import { createClient } from '@supabase/supabase-js'

// Hardcoded for Production Deployment
const supabaseUrl = 'https://base.kutraa.com'
const supabaseAnonKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3NjI0NDU2MCwiZXhwIjo0OTMxOTE4MTYwLCJyb2xlIjoiYW5vbiJ9.RJRl9UsbEImEOQYPBy6nZds-RYlaTclQQj2pJ8uJb6U'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase
