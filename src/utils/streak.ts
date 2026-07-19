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
 * Recomputes streak state from scratch given a skill's full session list.
 * Used after editing or deleting a session, since streaks can no longer be
 * derived incrementally from a single before/after comparison.
 */
export function recomputeStreakFromSessions(sessions: { date: string }[]): {
  dailyStreak: number
  longestStreak: number
  lastLogDate: string | null
} {
  if (sessions.length === 0) {
    return { dailyStreak: 0, longestStreak: 0, lastLogDate: null }
  }

  const uniqueDates = Array.from(new Set(sessions.map((s) => s.date))).sort()

  let runLength = 1
  let longestStreak = 1
  for (let i = 1; i < uniqueDates.length; i++) {
    const gap = daysBetween(uniqueDates[i - 1], uniqueDates[i])
    runLength = gap === 1 ? runLength + 1 : 1
    longestStreak = Math.max(longestStreak, runLength)
  }

  return {
    dailyStreak: runLength,
    longestStreak,
    lastLogDate: uniqueDates[uniqueDates.length - 1],
  }
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
