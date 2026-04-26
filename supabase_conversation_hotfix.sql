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
