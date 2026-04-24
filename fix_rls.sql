-- FIX: Enable Row Level Security and Add Public Access Policies
-- Run this in your Supabase SQL Editor

-- 1. Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- 2. Projects Policies
DROP POLICY IF EXISTS "Allow public read access" ON projects;
CREATE POLICY "Allow public read access" ON projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access" ON projects;
CREATE POLICY "Allow public insert access" ON projects FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access" ON projects;
CREATE POLICY "Allow public update access" ON projects FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete access" ON projects;
CREATE POLICY "Allow public delete access" ON projects FOR DELETE USING (true);

-- 3. Tasks Policies
DROP POLICY IF EXISTS "Allow public read access" ON tasks;
CREATE POLICY "Allow public read access" ON tasks FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access" ON tasks;
CREATE POLICY "Allow public insert access" ON tasks FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access" ON tasks;
CREATE POLICY "Allow public update access" ON tasks FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete access" ON tasks;
CREATE POLICY "Allow public delete access" ON tasks FOR DELETE USING (true);

-- 4. Agents Policies
DROP POLICY IF EXISTS "Allow public read access" ON agents;
CREATE POLICY "Allow public read access" ON agents FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public update access" ON agents;
CREATE POLICY "Allow public update access" ON agents FOR UPDATE USING (true);

-- 5. Conversations Policies (Crucial for n8n and Realtime)
DROP POLICY IF EXISTS "Allow public all access" ON conversations;
CREATE POLICY "Allow public all access" ON conversations FOR ALL USING (true);

-- 6. Activity Log Policies
DROP POLICY IF EXISTS "Allow public read access" ON activity_log;
CREATE POLICY "Allow public read access" ON activity_log FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access" ON activity_log;
CREATE POLICY "Allow public insert access" ON activity_log FOR INSERT WITH CHECK (true);
