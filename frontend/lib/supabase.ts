import { createClient } from '@supabase/supabase-js'

const DEFAULT_SUPABASE_URL = 'https://base.kutraa.com'
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3NjI0NDU2MCwiZXhwIjo0OTMxOTE4MTYwLCJyb2xlIjoiYW5vbiJ9.RJRl9UsbEImEOQYPBy6nZds-RYlaTclQQj2pJ8uJb6U'

function getRequiredEnv(name: 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY'): string {
  const value = process.env[name]?.trim()

  if (value) return value

  const fallback =
    name === 'NEXT_PUBLIC_SUPABASE_URL'
      ? DEFAULT_SUPABASE_URL
      : DEFAULT_SUPABASE_ANON_KEY

  if (typeof window === 'undefined') {
    console.warn(`[supabase] ${name} is not set. Falling back to the default public client configuration.`)
  }

  return fallback
}

const supabaseUrl = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL')
const supabaseAnonKey = getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase
