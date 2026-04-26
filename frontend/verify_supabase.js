const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const separatorIndex = line.indexOf('=');
    if (separatorIndex <= 0) continue;

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(__dirname, '.env.local'));
loadEnvFile(path.join(__dirname, '..', 'backend', '.env'));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running verify_supabase.js');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log(`Verifying Supabase Project: ${supabaseUrl}`);
  
  const tables = ['agents', 'projects', 'tasks', 'activity_log', 'conversations', 'tool_calls'];
  const summary = {};

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      summary[table] = { status: 'MISSING or ERROR', error: error.message };
    } else {
      summary[table] = { status: 'READY', has_data: data.length > 0 };
      if (table === 'tasks' && data.length > 0) {
        summary[table].columns = Object.keys(data[0]);
        summary[table].has_assignee_ids = summary[table].columns.includes('assignee_ids');
      } else if (table === 'tasks') {
        // If empty, we can't easily check columns without data via select('*') in JS client 
        // but we can try to insert and rollback or just assume based on success of empty select
        summary[table].note = 'Table exists but is empty. Cannot verify columns via SDK select alone.';
      }
    }
  }

  console.log('\n--- VERIFICATION SUMMARY ---');
  console.log(JSON.stringify(summary, null, 2));
}

check().catch(console.error);
