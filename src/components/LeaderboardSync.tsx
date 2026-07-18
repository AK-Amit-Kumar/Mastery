import { useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'
import { useAuthStore } from '../store/useAuthStore'
import { isSupabaseConfigured } from '../lib/supabase'

export default function LeaderboardSync() {
  const skills = useStore((s) => s.skills)
  const user = useAuthStore((s) => s.user)
  const syncStats = useAuthStore((s) => s.syncStats)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured || !user) return

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      const totalHours = Math.round(skills.reduce((sum, s) => sum + s.totalHoursLogged, 0) * 100) / 100
      syncStats(totalHours, skills.length)
    }, 800)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [skills, user, syncStats])

  return null
}
