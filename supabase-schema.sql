-- 1. Create Tables
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'offline',
  last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure specific agents exist
INSERT INTO agents (name, status) 
VALUES 
  ('main', 'offline'),
  ('promo', 'offline'),
  ('digit', 'offline'),
  ('string', 'offline')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'todo',
  agent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_key TEXT UNIQUE NOT NULL,
  agent_id TEXT NOT NULL,
  client_name TEXT,
  messages JSONB DEFAULT '[]'::jsonb,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create the RPC function for message logging (Crucial for n8n)
CREATE OR REPLACE FUNCTION append_conversation_message(
  p_session_key TEXT,
  p_message JSONB,
  p_agent_id TEXT,
  p_client_name TEXT DEFAULT 'Client'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO conversations (session_key, agent_id, client_name, messages, last_message_at)
  VALUES (
    p_session_key, 
    p_agent_id, 
    p_client_name, 
    jsonb_build_array(p_message),
    NOW()
  )
  ON CONFLICT (session_key) 
  DO UPDATE SET 
    messages = conversations.messages || p_message,
    last_message_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Enable Realtime for Dashboard Updates
ALTER PUBLICATION supabase_realtime ADD TABLE agents;
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
