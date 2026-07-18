import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

if (!isSupabaseConfigured) {
  console.warn(
    '[MASTERY] Supabase is not configured. Copy .env.example to .env.local and fill in your project URL + anon key to enable login and the leaderboard.'
  )
}

// Falls back to harmless placeholder values so the client can be constructed
// even when unconfigured; isSupabaseConfigured gates all real usage.
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key'
)

export interface Profile {
  id: string
  username: string
  total_hours: number
  skills_tracked: number
  updated_at: string
}
