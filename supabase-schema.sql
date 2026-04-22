-- ============================================================
-- Kutraa Mission Control — Supabase Schema
-- Run this in: Supabase SQL Editor
-- ============================================================

-- ============================================================
-- TABLE: agents
-- ============================================================
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('CEO', 'CFO', 'COO', 'CMO')),
  emoji TEXT DEFAULT '🤖',
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'idle', 'busy', 'offline')),
  current_task TEXT,
  current_project TEXT,
  current_session_key TEXT,
  current_tool TEXT,
  current_skill TEXT,
  last_heartbeat TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_session ON agents(current_session_key);

-- ============================================================
-- TABLE: projects
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  owner_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_agent_id);

-- ============================================================
-- TABLE: tasks
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  assignee_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  due_date DATE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date);

-- ============================================================
-- TABLE: activity_log
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  message TEXT NOT NULL,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  severity TEXT DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_log(event_type);
CREATE INDEX IF NOT EXISTS idx_activity_agent ON activity_log(agent_id);
CREATE INDEX IF NOT EXISTS idx_activity_project ON activity_log(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at DESC);

-- ============================================================
-- TABLE: tool_calls
-- ============================================================
CREATE TABLE IF NOT EXISTS tool_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_key TEXT NOT NULL,
  agent_name TEXT,
  skill_name TEXT,
  tool_name TEXT NOT NULL,
  params JSONB DEFAULT '{}',
  duration_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tool_calls_session ON tool_calls(session_key);
CREATE INDEX IF NOT EXISTS idx_tool_calls_tool ON tool_calls(tool_name);
CREATE INDEX IF NOT EXISTS idx_tool_calls_skill ON tool_calls(skill_name);
CREATE INDEX IF NOT EXISTS idx_tool_calls_agent ON tool_calls(agent_name);
CREATE INDEX IF NOT EXISTS idx_tool_calls_created ON tool_calls(created_at DESC);

-- ============================================================
-- TABLE: session_events
-- ============================================================
CREATE TABLE IF NOT EXISTS session_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_key TEXT NOT NULL,
  event_type TEXT NOT NULL,
  message TEXT,
  agent_name TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_events_session ON session_events(session_key);
CREATE INDEX IF NOT EXISTS idx_session_events_type ON session_events(event_type);
CREATE INDEX IF NOT EXISTS idx_session_events_created ON session_events(created_at DESC);

-- ============================================================
-- TABLE: conversations
-- ============================================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_key TEXT NOT NULL UNIQUE,
  client_id TEXT,
  client_name TEXT,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  channel TEXT DEFAULT 'telegram' CHECK (channel IN ('telegram', 'whatsapp', 'web')),
  messages JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_key);
CREATE INDEX IF NOT EXISTS idx_conversations_agent ON conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_conversations_client ON conversations(client_id);

-- ============================================================
-- ENABLE REALTIME
-- ============================================================
-- Enable realtime for all 7 tables
ALTER PUBLICATION supabase_realtime ADD TABLE agents;
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;
ALTER PUBLICATION supabase_realtime ADD TABLE tool_calls;
ALTER PUBLICATION supabase_realtime ADD TABLE session_events;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
-- CEO-only internal tool — anon key is private
-- Full access via service role key

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Public access (KUT is the only user)
CREATE POLICY "public_all_agents" ON agents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_conversations" ON conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_insert_activity" ON activity_log FOR INSERT WITH CHECK (true);
CREATE POLICY "public_insert_tool_calls" ON tool_calls FOR INSERT WITH CHECK (true);
CREATE POLICY "public_insert_session_events" ON session_events FOR INSERT WITH CHECK (true);

-- ============================================================
-- SEED: Initial Agents
-- ============================================================
INSERT INTO agents (name, role, emoji, status) VALUES
  ('Mehzam', 'CEO', '🥷🏻', 'online'),
  ('Digit', 'CFO', '💰', 'offline'),
  ('String', 'COO', '💻', 'offline'),
  ('Promo', 'CMO', '🛍️', 'offline');

-- ============================================================
-- FUNCTION: Auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agents_updated_at BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
