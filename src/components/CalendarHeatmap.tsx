import type { Session } from '../types'
import { addDays, todayISO, parseDateISO, formatDateDisplay } from '../utils/date'

interface CalendarHeatmapProps {
  sessions: Session[]
  weeks?: number
}

function intensityColor(hours: number): string {
  if (hours <= 0) return 'var(--color-panel2)'
  if (hours < 1) return '#164e4a'
  if (hours < 2) return '#1f8a7a'
  if (hours < 4) return '#2fd3a8'
  return '#7dff6b'
}

export default function CalendarHeatmap({ sessions, weeks = 14 }: CalendarHeatmapProps) {
  const today = todayISO()
  const totalDays = weeks * 7

  // Align end to the Sunday of current week so columns are consistent weeks (Mon-Sun)
  const todayDow = parseDateISO(today).getDay() // 0 = Sun
  const daysUntilSunday = todayDow === 0 ? 0 : 7 - todayDow
  const end = addDays(today, daysUntilSunday)
  const start = addDays(end, -(totalDays - 1))

  const hoursByDate = new Map<string, number>()
  for (const s of sessions) {
    hoursByDate.set(s.date, (hoursByDate.get(s.date) ?? 0) + s.hoursSpent)
  }

  const days: string[] = []
  for (let i = 0; i < totalDays; i++) {
    days.push(addDays(start, i))
  }

  const columns: string[][] = []
  for (let i = 0; i < days.length; i += 7) {
    columns.push(days.slice(i, i + 7))
  }

  return (
    <div className="overflow-x-auto no-scrollbar">
      <div className="flex gap-1 w-max">
        {columns.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-1">
            {col.map((date) => {
              const hours = hoursByDate.get(date) ?? 0
              const isFuture = date > today
              return (
                <div
                  key={date}
                  className="w-3.5 h-3.5 border border-black/40"
                  style={{ backgroundColor: isFuture ? '#0f0f24' : intensityColor(hours) }}
                  title={`${formatDateDisplay(date)}: ${hours > 0 ? hours + 'h' : 'no session'}`}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
