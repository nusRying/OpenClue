import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://supabase-kong-l3a2tknbgy2ejacsyasfwxzc:8000'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3NjI0NDU2MCwiZXhwIjo0OTMxOTE4MTYwLCJyb2xlIjoiYW5vbiJ9.1234567890abcdefghijklmnopqrstuvwxyz'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase
