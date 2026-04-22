import { createClient } from '@supabase/supabase-js'

// Hardcoded for Production Deployment
const supabaseUrl = 'https://kxhnjmkxbylxmxjapiad.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4aG5qbWt4YnlseG14amFwaWFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NjgyMjksImV4cCI6MjA5MjQ0NDIyOX0.tiglsri5k-ndvc6cY073TQyNN-C8DUvaq-Wc2GE6w4U'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase
