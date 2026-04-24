import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;
let envLoaded = false;

const backendRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function parseEnvValue(rawValue: string): string {
  const value = rawValue.trim();
  const quote = value[0];

  if ((quote === '"' || quote === "'") && value.endsWith(quote)) {
    return value.slice(1, -1);
  }

  return value;
}

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) return;

  const content = readFileSync(filePath, 'utf8');

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const separatorIndex = line.indexOf('=');
    if (separatorIndex <= 0) continue;

    const key = line.slice(0, separatorIndex).trim();
    const value = parseEnvValue(line.slice(separatorIndex + 1));

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function ensureEnvLoaded() {
  if (envLoaded) return;

  loadEnvFile(resolve(backendRoot, '.env'));
  loadEnvFile(resolve(backendRoot, '.env.local'));
  envLoaded = true;
}

function getRequiredEnv(name: string): string {
  ensureEnvLoaded();

  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required. Set it in the backend environment or backend/.env.`);
  }

  return value;
}

export function getSupabase(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(getRequiredEnv('SUPABASE_URL'), getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return supabase;
}

export default getSupabase;
