const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres.kxhnjmkxbylxmxjapiad:Ue%40%23ceme8677@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres';

async function main() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected to Supabase Postgres.');

    const schemaPath = path.join(__dirname, '..', 'supabase-schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Applying baseline schema...');
    await client.query(schemaSql);
    console.log('Baseline schema applied successfully.');

    console.log('Applying multi-assignee migration...');
    const migrationSql = `
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assignee_ids UUID[] DEFAULT '{}';
      UPDATE tasks SET assignee_ids = ARRAY[assignee_id] WHERE assignee_id IS NOT NULL AND (assignee_ids IS NULL OR cardinality(assignee_ids) = 0);
    `;
    await client.query(migrationSql);
    console.log('Multi-assignee migration applied successfully.');

    console.log('Database Initialization Complete!');
  } catch (err) {
    console.error('Error during database initialization:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
