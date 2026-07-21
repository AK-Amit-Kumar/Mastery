export function todayISO(): string {
  return toDateISO(new Date())
}

export function toDateISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseDateISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function daysBetween(a: string, b: string): number {
  const da = parseDateISO(a)
  const db = parseDateISO(b)
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.round((db.getTime() - da.getTime()) / msPerDay)
}

export function isWeekend(iso: string): boolean {
  const d = parseDateISO(iso)
  const day = d.getDay()
  return day === 0 || day === 6
}

export function addDays(iso: string, n: number): string {
  const d = parseDateISO(iso)
  d.setDate(d.getDate() + n)
  return toDateISO(d)
}

export function formatDateDisplay(iso: string): string {
  const d = parseDateISO(iso)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function getWeekStart(iso: string): string {
  const d = parseDateISO(iso)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day // week starts Monday
  return addDays(iso, diff)
}

export type MeridiemPeriod = 'AM' | 'PM'

export function to12Hour(time24: string): { hour: number; minute: number; period: MeridiemPeriod } {
  const [h, m] = time24.split(':').map(Number)
  const period: MeridiemPeriod = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 === 0 ? 12 : h % 12
  return { hour, minute: m, period }
}

export function to24HourTime(hour: number, minute: number, period: MeridiemPeriod): string {
  const h = period === 'PM' ? (hour % 12) + 12 : hour % 12
  return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

export function getLastNDates(n: number, endIso: string = todayISO()): string[] {
  const dates: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    dates.push(addDays(endIso, -i))
  }
  return dates
}
