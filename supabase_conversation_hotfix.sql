begin;

-- Hotfix for the live Mission Control schema.
-- This aligns the existing tables with what the current frontend/backend expect
-- without forcing a risky type migration on legacy agent_id values.

-- =========================
-- CONVERSATIONS
-- =========================
alter table public.conversations
  add column if not exists client_id text;

alter table public.conversations
  add column if not exists channel text default 'telegram';

alter table public.conversations
  add column if not exists status text default 'active';

alter table public.conversations
  add column if not exists updated_at timestamptz default now();

alter table public.conversations
  alter column messages set default '[]'::jsonb;

alter table public.conversations
  alter column last_message_at set default now();

update public.conversations
set messages = '[]'::jsonb
where messages is null;

update public.conversations
set client_name = 'Client'
where client_name is null or btrim(client_name) = '';

update public.conversations
set channel = 'telegram'
where channel is null or btrim(channel) = '';

update public.conversations
set status = 'active'
where status is null or btrim(status) = '';

update public.conversations
set updated_at = coalesce(updated_at, last_message_at, created_at, now())
where updated_at is null;

update public.conversations
set messages = jsonb_build_array(messages)
where messages is not null
  and jsonb_typeof(messages) = 'object';

with ranked_rows as (
  select
    id,
    session_key,
    row_number() over (
      partition by session_key
      order by coalesce(updated_at, last_message_at, created_at, now()) desc, created_at desc, id desc
    ) as row_rank
  from public.conversations
),
aggregated_rows as (
  select
    c.session_key,
    min(c.created_at) as merged_created_at,
    max(c.last_message_at) as merged_last_message_at,
    max(coalesce(c.updated_at, c.last_message_at, c.created_at, now())) as merged_updated_at,
    coalesce(
      (array_remove(array_agg(c.agent_id order by coalesce(c.updated_at, c.last_message_at, c.created_at, now()) desc), null))[1],
      (array_agg(c.agent_id order by coalesce(c.updated_at, c.last_message_at, c.created_at, now()) desc))[1]
    ) as merged_agent_id,
    coalesce(
      (array_remove(array_agg(c.client_id order by coalesce(c.updated_at, c.last_message_at, c.created_at, now()) desc), null))[1],
      (array_agg(c.client_id order by coalesce(c.updated_at, c.last_message_at, c.created_at, now()) desc))[1]
    ) as merged_client_id,
    coalesce(
      (array_remove(array_agg(c.client_name order by coalesce(c.updated_at, c.last_message_at, c.created_at, now()) desc), null))[1],
      'Client'
    ) as merged_client_name,
    coalesce(
      (array_remove(array_agg(c.channel order by coalesce(c.updated_at, c.last_message_at, c.created_at, now()) desc), null))[1],
      'telegram'
    ) as merged_channel,
    coalesce(
      (array_remove(array_agg(c.status order by coalesce(c.updated_at, c.last_message_at, c.created_at, now()) desc), null))[1],
      'active'
    ) as merged_status,
    coalesce(
      jsonb_agg(msg order by coalesce(c.updated_at, c.last_message_at, c.created_at, now()))
        filter (where msg is not null),
      '[]'::jsonb
    ) as merged_messages
  from public.conversations c
  left join lateral jsonb_array_elements(
    case
      when c.messages is null then '[]'::jsonb
      when jsonb_typeof(c.messages) = 'array' then c.messages
      when jsonb_typeof(c.messages) = 'object' then jsonb_build_array(c.messages)
      else '[]'::jsonb
    end
  ) msg on true
  group by c.session_key
)
update public.conversations c
set
  agent_id = a.merged_agent_id,
  client_id = a.merged_client_id,
  client_name = a.merged_client_name,
  channel = a.merged_channel,
  status = a.merged_status,
  messages = a.merged_messages,
  last_message_at = a.merged_last_message_at,
  created_at = a.merged_created_at,
  updated_at = a.merged_updated_at
from ranked_rows r
join aggregated_rows a on a.session_key = r.session_key
where c.id = r.id
  and r.row_rank = 1;

with ranked_rows as (
  select
    id,
    row_number() over (
      partition by session_key
      order by coalesce(updated_at, last_message_at, created_at, now()) desc, created_at desc, id desc
    ) as row_rank
  from public.conversations
)
delete from public.conversations c
using ranked_rows r
where c.id = r.id
  and r.row_rank > 1;

-- Ensure session_key stays unique for upserts/appends.
do $$
begin
  alter table public.conversations
    add constraint conversations_session_key_key unique (session_key);
exception
  when duplicate_table then null;
  when duplicate_object then null;
end $$;

-- =========================
-- ACTIVITY LOG
-- =========================
alter table public.activity_log
  add column if not exists message text;

alter table public.activity_log
  add column if not exists metadata jsonb default '{}'::jsonb;

update public.activity_log
set message = description
where message is null and description is not null;

update public.activity_log
set metadata = '{}'::jsonb
where metadata is null;

-- =========================
-- RPC: APPEND CONVERSATION MESSAGE
-- =========================
-- Keep p_agent_id as text here because the live conversations.agent_id column
-- currently stores legacy text values like "main". The backend can still send
-- a UUID string and it will store cleanly.
create or replace function public.append_conversation_message(
  p_session_key text,
  p_message jsonb,
  p_agent_id text default null,
  p_client_name text default 'Client'
)
returns void
language plpgsql
security definer
as $$
declare
  v_message_timestamp timestamptz;
begin
  v_message_timestamp := coalesce((p_message->>'timestamp')::timestamptz, now());

  insert into public.conversations (
    session_key,
    agent_id,
    client_name,
    messages,
    last_message_at,
    created_at,
    updated_at
  )
  values (
    p_session_key,
    p_agent_id,
    coalesce(nullif(btrim(p_client_name), ''), 'Client'),
    jsonb_build_array(p_message),
    v_message_timestamp,
    now(),
    v_message_timestamp
  )
  on conflict (session_key)
  do update set
    agent_id = coalesce(excluded.agent_id, public.conversations.agent_id),
    client_name = coalesce(nullif(excluded.client_name, ''), public.conversations.client_name, 'Client'),
    messages = coalesce(public.conversations.messages, '[]'::jsonb) || excluded.messages,
    last_message_at = v_message_timestamp,
    updated_at = v_message_timestamp;
end;
$$;

-- =========================
-- REALTIME
-- =========================
do $$
begin
  alter publication supabase_realtime add table public.conversations;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.activity_log;
exception when duplicate_object then null;
end $$;

-- =========================
-- RLS
-- =========================
alter table public.conversations enable row level security;
drop policy if exists "Allow public all access" on public.conversations;
create policy "Allow public all access"
on public.conversations
for all
using (true)
with check (true);

alter table public.activity_log enable row level security;
drop policy if exists "Allow public read access" on public.activity_log;
create policy "Allow public read access"
on public.activity_log
for select
using (true);

drop policy if exists "Allow public insert access" on public.activity_log;
create policy "Allow public insert access"
on public.activity_log
for insert
with check (true);

commit;
