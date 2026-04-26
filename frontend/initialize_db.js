const { Client } = require('pg');
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

const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('Set SUPABASE_DB_URL or DATABASE_URL before running initialize_db.js');
}

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
