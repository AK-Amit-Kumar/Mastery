import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured, type Profile } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'
import PixelPanel from '../components/PixelPanel'

const MEDAL_COLORS = ['#ffd23f', '#c0c0d8', '#cd7f32']

export default function Leaderboard() {
  const currentUser = useAuthStore((s) => s.user)
  const [rows, setRows] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    supabase
      .from('profiles')
      .select('*')
      .order('total_hours', { ascending: false })
      .limit(100)
      .then(({ data, error: fetchError }) => {
        if (cancelled) return
        if (fetchError) setError(fetchError.message)
        else setRows((data ?? []) as Profile[])
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const maxHours = rows[0]?.total_hours ?? 1

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div>
        <h1 className="font-pixel text-2xl text-amber mb-1">LEADERBOARD</h1>
        <p className="font-body text-xl text-paper/60">Every grinder, ranked by total hours logged.</p>
      </div>

      {!isSupabaseConfigured ? (
        <PixelPanel>
          <p className="font-body text-lg text-paper/60">
            The leaderboard needs Supabase configured. See .env.example for setup.
          </p>
        </PixelPanel>
      ) : loading ? (
        <PixelPanel>
          <p className="font-pixel text-xs text-cyan animate-blink">LOADING SCORES...</p>
        </PixelPanel>
      ) : error ? (
        <PixelPanel>
          <p className="font-body text-lg text-blood">Failed to load leaderboard: {error}</p>
        </PixelPanel>
      ) : rows.length === 0 ? (
        <PixelPanel>
          <p className="font-body text-lg text-paper/60">No one has logged hours yet. Be the first!</p>
        </PixelPanel>
      ) : (
        <PixelPanel glow="amber">
          <div className="flex flex-col gap-2">
            {rows.map((row, i) => {
              const isMe = row.id === currentUser?.id
              return (
                <div
                  key={row.id}
                  className={`flex items-center gap-3 border-2 px-3 py-2.5 ${
                    isMe ? 'border-cyan bg-cyan/10' : 'border-line bg-panel2'
                  }`}
                >
                  <span
                    className="font-pixel text-sm w-10 shrink-0"
                    style={{ color: MEDAL_COLORS[i] ?? '#8a8aa3' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-body text-xl text-paper flex-1 truncate">
                    {row.username}
                    {isMe && <span className="text-cyan"> (you)</span>}
                  </span>
                  <span className="hidden sm:block font-body text-base text-paper/50 shrink-0">
                    {row.skills_tracked} skill{row.skills_tracked === 1 ? '' : 's'}
                  </span>
                  <div className="hidden sm:block w-32">
                    <div className="w-full h-3 bg-ink border border-black/40 flex">
                      <div
                        className="h-full bg-amber"
                        style={{ width: `${Math.max(2, (row.total_hours / maxHours) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="font-pixel text-xs text-amber shrink-0 w-24 text-right">
                    {row.total_hours.toLocaleString()}h
                  </span>
                </div>
              )
            })}
          </div>
        </PixelPanel>
      )}
    </div>
  )
}
