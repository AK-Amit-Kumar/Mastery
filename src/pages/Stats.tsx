import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import PixelPanel from '../components/PixelPanel'
import PixelBarChart from '../components/PixelBarChart'
import { addDays, getWeekStart, todayISO, parseDateISO } from '../utils/date'

const WEEK_COUNT = 8

export default function Stats() {
  const skills = useStore((s) => s.skills)
  const [selectedId, setSelectedId] = useState<string>('all')

  const ranked = useMemo(
    () => [...skills].sort((a, b) => b.totalHoursLogged - a.totalHoursLogged),
    [skills]
  )

  const weeklyData = useMemo(() => {
    const today = todayISO()
    const currentWeekStart = getWeekStart(today)
    const weekStarts: string[] = []
    for (let i = WEEK_COUNT - 1; i >= 0; i--) {
      weekStarts.push(addDays(currentWeekStart, -i * 7))
    }

    const relevantSkills = selectedId === 'all' ? skills : skills.filter((s) => s.id === selectedId)

    return weekStarts.map((weekStart) => {
      const weekEnd = addDays(weekStart, 6)
      let total = 0
      for (const skill of relevantSkills) {
        for (const session of skill.sessions) {
          if (session.date >= weekStart && session.date <= weekEnd) {
            total += session.hoursSpent
          }
        }
      }
      const d = parseDateISO(weekStart)
      const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      return { label, value: Math.round(total * 100) / 100 }
    })
  }, [skills, selectedId])

  const maxHours = ranked[0]?.totalHoursLogged ?? 1

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-8">
      <div>
        <h1 className="font-pixel text-2xl text-lime mb-1">STATS</h1>
        <p className="font-body text-xl text-paper/60">Your grind, visualized.</p>
      </div>

      <PixelPanel glow="cyan">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h2 className="font-pixel text-sm text-cyan">HOURS PER WEEK</h2>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="bg-ink border-2 border-line px-2 py-1.5 font-body text-lg text-paper focus:outline-none focus:border-cyan"
          >
            <option value="all">All Skills (Combined)</option>
            {skills.map((s) => (
              <option key={s.id} value={s.id}>
                {s.icon} {s.name}
              </option>
            ))}
          </select>
        </div>
        {skills.length === 0 ? (
          <p className="font-body text-lg text-paper/50">Add a skill and log some hours to see your chart.</p>
        ) : (
          <PixelBarChart data={weeklyData} color="var(--color-cyan)" />
        )}
      </PixelPanel>

      <PixelPanel glow="amber">
        <h2 className="font-pixel text-sm text-amber mb-4">HIGH SCORES</h2>
        {ranked.length === 0 ? (
          <p className="font-body text-lg text-paper/50">No skills tracked yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {ranked.map((skill, i) => (
              <div
                key={skill.id}
                className="flex items-center gap-3 border-2 border-line bg-panel2 px-3 py-2.5"
              >
                <span className="font-pixel text-sm text-amber w-10 shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-2xl shrink-0">{skill.icon}</span>
                <span className="font-body text-xl text-paper flex-1 truncate">{skill.name}</span>
                <div className="hidden sm:block w-32">
                  <div className="w-full h-3 bg-ink border border-black/40 flex">
                    <div
                      className="h-full bg-lime"
                      style={{ width: `${Math.max(2, (skill.totalHoursLogged / maxHours) * 100)}%` }}
                    />
                  </div>
                </div>
                <span className="font-pixel text-xs text-lime shrink-0 w-24 text-right">
                  {skill.totalHoursLogged.toLocaleString()}h
                </span>
              </div>
            ))}
          </div>
        )}
      </PixelPanel>
    </div>
  )
}
