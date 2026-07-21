import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured, type Profile } from '../lib/supabase'

function slugifyUsername(seed: string): string {
  const base = seed
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 16)
  const safeBase = base.length >= 2 ? base : 'player'
  return `${safeBase}${Math.floor(1000 + Math.random() * 9000)}`
}

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  authError: string | null
  infoMessage: string | null

  initialize: () => Promise<void>
  signUpWithEmail: (email: string, password: string, username: string) => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateUsername: (newUsername: string) => Promise<boolean>
  syncStats: (totalHours: number, skillsTracked: number) => Promise<void>
  clearMessages: () => void
}

const SESSION_TIMEOUT_MS = 4000

// getSession() normally resolves from local storage without needing network, but if it does
// hang (e.g. no connectivity mid-refresh), this keeps the app from being stuck on "LOADING..."
// forever instead of reaching the user's local skill data.
async function getSessionWithTimeout() {
  const timeout = new Promise<{ data: { session: null } }>((resolve) =>
    setTimeout(() => resolve({ data: { session: null } }), SESSION_TIMEOUT_MS)
  )
  return Promise.race([supabase.auth.getSession(), timeout])
}

async function ensureProfile(user: User): Promise<Profile | null> {
  const { data: existing } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
  if (existing) return existing as Profile

  const desired = (user.user_metadata?.username as string | undefined) || slugifyUsername(user.email ?? 'player')

  for (let attempt = 0; attempt < 3; attempt++) {
    const candidate = attempt === 0 ? desired : `${desired}${Math.floor(Math.random() * 9000)}`
    const { data, error } = await supabase
      .from('profiles')
      .insert({ id: user.id, username: candidate, total_hours: 0, skills_tracked: 0 })
      .select()
      .single()
    if (!error && data) return data as Profile
    if (error && error.code !== '23505') break // not a uniqueness violation, give up
  }
  return null
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  authError: null,
  infoMessage: null,

  initialize: async () => {
    if (!isSupabaseConfigured) {
      set({ loading: false })
      return
    }

    const {
      data: { session },
    } = await getSessionWithTimeout()

    if (session?.user) {
      const profile = await ensureProfile(session.user)
      set({ user: session.user, profile, loading: false })
    } else {
      set({ loading: false })
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await ensureProfile(session.user)
        set({ user: session.user, profile })
      } else {
        set({ user: null, profile: null })
      }
    })
  },

  signUpWithEmail: async (email, password, username) => {
    set({ authError: null, infoMessage: null })
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })
    if (error) {
      set({ authError: error.message })
      return
    }
    if (data.session) {
      const profile = await ensureProfile(data.user!)
      set({ user: data.user, profile })
    } else {
      set({ infoMessage: 'Check your inbox to confirm your email, then sign in.' })
    }
  },

  signInWithEmail: async (email, password) => {
    set({ authError: null, infoMessage: null })
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      set({ authError: error.message })
      return
    }
    if (data.user) {
      const profile = await ensureProfile(data.user)
      set({ user: data.user, profile })
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  },

  updateUsername: async (newUsername) => {
    const { user } = get()
    if (!user) return false
    const trimmed = newUsername.trim()
    if (trimmed.length < 2 || trimmed.length > 24) {
      set({ authError: 'Username must be 2-24 characters.' })
      return false
    }
    const { data, error } = await supabase
      .from('profiles')
      .update({ username: trimmed })
      .eq('id', user.id)
      .select()
      .single()
    if (error) {
      set({ authError: error.code === '23505' ? 'That username is already taken.' : error.message })
      return false
    }
    set({ profile: data as Profile, authError: null })
    return true
  },

  syncStats: async (totalHours, skillsTracked) => {
    const { user, profile } = get()
    if (!user) return
    const { data, error } = await supabase
      .from('profiles')
      .update({ total_hours: totalHours, skills_tracked: skillsTracked, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single()
    if (!error && data) {
      set({ profile: data as Profile })
    } else if (!profile) {
      // profile row doesn't exist yet for some reason; ensure it then retry once.
      const created = await ensureProfile(user)
      if (created) {
        const { data: retried } = await supabase
          .from('profiles')
          .update({ total_hours: totalHours, skills_tracked: skillsTracked, updated_at: new Date().toISOString() })
          .eq('id', user.id)
          .select()
          .single()
        if (retried) set({ profile: retried as Profile })
      }
    }
  },

  clearMessages: () => set({ authError: null, infoMessage: null }),
}))
