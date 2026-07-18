import { daysBetween, todayISO } from './date'

export interface StreakResult {
  dailyStreak: number
  longestStreak: number
  wasComeback: boolean
}

/**
 * Computes the new streak state when logging a session on `logDate`.
 * A streak continues if logDate is the same day as lastLogDate (no change)
 * or exactly one day after. It resets to 1 if there's a gap.
 */
export function computeStreak(
  lastLogDate: string | null,
  currentStreak: number,
  longestStreak: number,
  logDate: string = todayISO()
): StreakResult {
  if (!lastLogDate) {
    return { dailyStreak: 1, longestStreak: Math.max(1, longestStreak), wasComeback: false }
  }

  const gap = daysBetween(lastLogDate, logDate)

  if (gap === 0) {
    // same day, streak unchanged
    return { dailyStreak: Math.max(1, currentStreak), longestStreak: Math.max(longestStreak, currentStreak, 1), wasComeback: false }
  }

  if (gap === 1) {
    const newStreak = currentStreak + 1
    return { dailyStreak: newStreak, longestStreak: Math.max(longestStreak, newStreak), wasComeback: false }
  }

  // gap > 1 (or negative, e.g. backfilled a past date) -> streak resets
  const wasComeback = currentStreak === 0 && longestStreak > 0
  return { dailyStreak: 1, longestStreak: Math.max(longestStreak, 1), wasComeback }
}

/**
 * Checks whether an existing streak should be reset to 0 due to inactivity,
 * evaluated against "today" independent of logging a new session.
 */
export function getEffectiveStreak(lastLogDate: string | null, currentStreak: number, today: string = todayISO()): number {
  if (!lastLogDate) return 0
  const gap = daysBetween(lastLogDate, today)
  if (gap <= 1) return currentStreak
  return 0
}
