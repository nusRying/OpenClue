const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kxhnjmkxbylxmxjapiad.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4aG5qbWt4YnlseG14amFwaWFkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njg2ODIyOSwiZXhwIjoyMDkyNDQ0MjI5fQ.UKJtj4jTz3PUVcu6Aq0jA88ts87tmI0NwicBEK7rqaY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('Verifying Supabase Project: kxhnjmkxbylxmxjapiad');
  
  const tables = ['agents', 'projects', 'tasks', 'activity_log', 'conversations', 'messages'];
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
