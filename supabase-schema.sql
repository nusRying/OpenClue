create extension if not exists pgcrypto;

-- =========================
-- AGENTS
-- =========================
create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text default 'agent',
  emoji text default '🤖',
  status text default 'offline',
  bot_username text,
  workspace_path text,
  last_heartbeat timestamptz default now(),
  last_seen_at timestamptz,
  current_task text,
  skills jsonb default '[]'::jsonb,
  memory jsonb default '{"has_memory_md": false}'::jsonb,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.agents add column if not exists role text default 'agent';
alter table public.agents add column if not exists emoji text default '🤖';
alter table public.agents add column if not exists bot_username text;
alter table public.agents add column if not exists workspace_path text;
alter table public.agents add column if not exists last_seen_at timestamptz;
alter table public.agents add column if not exists current_task text;
alter table public.agents add column if not exists skills jsonb default '[]'::jsonb;
alter table public.agents add column if not exists memory jsonb default '{"has_memory_md": false}'::jsonb;
alter table public.agents add column if not exists metadata jsonb default '{}'::jsonb;

-- Ensure specific agents exist
insert into public.agents (name, status)
select 'main', 'offline'
where not exists (select 1 from public.agents where name = 'main');

insert into public.agents (name, status)
select 'promo', 'offline'
where not exists (select 1 from public.agents where name = 'promo');

insert into public.agents (name, status)
select 'digit', 'offline'
where not exists (select 1 from public.agents where name = 'digit');

insert into public.agents (name, status)
select 'string', 'offline'
where not exists (select 1 from public.agents where name = 'string');

-- =========================
-- PROJECTS
-- =========================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  status text default 'active',
  owner_agent_id uuid references public.agents(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.projects add column if not exists description text;
alter table public.projects add column if not exists status text default 'active';
alter table public.projects add column if not exists owner_agent_id uuid references public.agents(id) on delete set null;
alter table public.projects add column if not exists updated_at timestamptz default now();

-- =========================
-- TASKS
-- =========================
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status text default 'todo',
  priority text default 'medium',
  assignee_ids uuid[] default '{}'::uuid[],
  assignee_names text[] default '{}'::text[],
  due_date timestamptz,
  tags text[] default '{}'::text[],
  agent_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.tasks add column if not exists description text;
alter table public.tasks add column if not exists priority text default 'medium';
alter table public.tasks add column if not exists assignee_ids uuid[] default '{}'::uuid[];
alter table public.tasks add column if not exists assignee_names text[] default '{}'::text[];
alter table public.tasks add column if not exists due_date timestamptz;
alter table public.tasks add column if not exists tags text[] default '{}'::text[];
alter table public.tasks add column if not exists updated_at timestamptz default now();
alter table public.tasks add column if not exists agent_id text;

-- Backfill assignee_ids from legacy agent_id when possible
update public.tasks
set assignee_ids = array[agent_id::uuid]
where (assignee_ids is null or cardinality(assignee_ids) = 0)
  and agent_id is not null
  and agent_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';

-- =========================
-- ACTIVITY LOG
-- =========================
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  message text,
  description text,
  agent_id uuid references public.agents(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.activity_log add column if not exists message text;
alter table public.activity_log add column if not exists description text;
alter table public.activity_log add column if not exists agent_id uuid references public.agents(id) on delete set null;
alter table public.activity_log add column if not exists project_id uuid references public.projects(id) on delete set null;
alter table public.activity_log add column if not exists task_id uuid references public.tasks(id) on delete set null;
alter table public.activity_log add column if not exists metadata jsonb default '{}'::jsonb;

-- =========================
-- TOOL CALLS
-- =========================
create table if not exists public.tool_calls (
  id uuid primary key default gen_random_uuid(),
  agent_id text,
  session_id text not null,
  tool_name text not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_ms integer,
  success boolean default true,
  error_message text,
  metadata jsonb default '{}'::jsonb
);

alter table public.tool_calls add column if not exists agent_id text;
alter table public.tool_calls add column if not exists session_id text;
alter table public.tool_calls add column if not exists tool_name text;
alter table public.tool_calls add column if not exists started_at timestamptz default now();
alter table public.tool_calls add column if not exists ended_at timestamptz;
alter table public.tool_calls add column if not exists duration_ms integer;
alter table public.tool_calls add column if not exists success boolean default true;
alter table public.tool_calls add column if not exists error_message text;
alter table public.tool_calls add column if not exists metadata jsonb default '{}'::jsonb;

-- =========================
-- CONVERSATIONS
-- =========================
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  session_key text unique not null,
  client_id text,
  client_name text,
  agent_id uuid references public.agents(id) on delete set null,
  channel text default 'telegram',
  messages jsonb default '[]'::jsonb,
  status text default 'active',
  last_message_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.conversations add column if not exists client_id text;
alter table public.conversations add column if not exists client_name text;
alter table public.conversations add column if not exists agent_id uuid references public.agents(id) on delete set null;
alter table public.conversations add column if not exists channel text default 'telegram';
alter table public.conversations add column if not exists messages jsonb default '[]'::jsonb;
alter table public.conversations add column if not exists status text default 'active';
alter table public.conversations add column if not exists last_message_at timestamptz default now();
alter table public.conversations add column if not exists updated_at timestamptz default now();

-- =========================
-- RPC FUNCTION
-- =========================
create or replace function public.append_conversation_message(
  p_session_key text,
  p_message jsonb,
  p_agent_id uuid,
  p_client_name text default 'Client'
)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.conversations (session_key, agent_id, client_name, messages, last_message_at, updated_at)
  values (
    p_session_key,
    p_agent_id,
    p_client_name,
    jsonb_build_array(p_message),
    now(),
    now()
  )
  on conflict (session_key)
  do update set
    messages = public.conversations.messages || p_message,
    last_message_at = now(),
    updated_at = now();
end;
$$;

-- =========================
-- REALTIME
-- =========================
do $$
begin
  alter publication supabase_realtime add table public.agents;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.projects;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.tasks;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.activity_log;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.conversations;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.tool_calls;
exception when duplicate_object then null;
end $$;

-- =========================
-- RLS POLICIES (Public Access)
-- =========================

-- Agents
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access" ON public.agents;
CREATE POLICY "Allow public read access" ON public.agents FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public update access" ON public.agents;
CREATE POLICY "Allow public update access" ON public.agents FOR UPDATE USING (true);

-- Projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access" ON public.projects;
CREATE POLICY "Allow public read access" ON public.projects FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert access" ON public.projects;
CREATE POLICY "Allow public insert access" ON public.projects FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update access" ON public.projects;
CREATE POLICY "Allow public update access" ON public.projects FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete access" ON public.projects;
CREATE POLICY "Allow public delete access" ON public.projects FOR DELETE USING (true);

-- Tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access" ON public.tasks;
CREATE POLICY "Allow public read access" ON public.tasks FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert access" ON public.tasks;
CREATE POLICY "Allow public insert access" ON public.tasks FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update access" ON public.tasks;
CREATE POLICY "Allow public update access" ON public.tasks FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete access" ON public.tasks;
CREATE POLICY "Allow public delete access" ON public.tasks FOR DELETE USING (true);

-- Activity Log
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access" ON public.activity_log;
CREATE POLICY "Allow public read access" ON public.activity_log FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert access" ON public.activity_log;
CREATE POLICY "Allow public insert access" ON public.activity_log FOR INSERT WITH CHECK (true);

-- Conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all access" ON public.conversations;
CREATE POLICY "Allow public all access" ON public.conversations FOR ALL USING (true);

-- Tool Calls
ALTER TABLE public.tool_calls ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access" ON public.tool_calls;
CREATE POLICY "Allow public read access" ON public.tool_calls FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert access" ON public.tool_calls;
CREATE POLICY "Allow public insert access" ON public.tool_calls FOR INSERT WITH CHECK (true);
