import type { Tier } from '../types'

export const TIERS: Tier[] = [
  { id: 0, name: 'Novice', minHours: 0, maxHours: 1000, color: '#8a8aa3', shape: 'triangle' },
  { id: 1, name: 'Apprentice', minHours: 1000, maxHours: 2000, color: '#4deeea', shape: 'square' },
  { id: 2, name: 'Adept', minHours: 2000, maxHours: 3500, color: '#7dff6b', shape: 'diamond' },
  { id: 3, name: 'Skilled', minHours: 3500, maxHours: 5000, color: '#ffd23f', shape: 'pentagon' },
  { id: 4, name: 'Expert', minHours: 5000, maxHours: 6500, color: '#ff9d3f', shape: 'hex' },
  { id: 5, name: 'Veteran', minHours: 6500, maxHours: 8000, color: '#f92aad', shape: 'cross' },
  { id: 6, name: 'Elite', minHours: 8000, maxHours: 9000, color: '#c04dff', shape: 'shield' },
  { id: 7, name: 'Grandmaster', minHours: 9000, maxHours: 9900, color: '#ff4d4d', shape: 'star' },
  { id: 8, name: 'Legend', minHours: 9900, maxHours: 10000, color: '#ffffff', shape: 'crown' },
  { id: 9, name: 'MASTER', minHours: 10000, maxHours: Infinity, color: '#ffd23f', shape: 'burst' },
]

export function getTierForHours(hours: number): Tier {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (hours >= TIERS[i].minHours) return TIERS[i]
  }
  return TIERS[0]
}

export function getNextTier(hours: number): Tier | null {
  const current = getTierForHours(hours)
  const next = TIERS[current.id + 1]
  return next ?? null
}

export function getTierProgress(hours: number): {
  tier: Tier
  next: Tier | null
  hoursIntoTier: number
  hoursForTier: number
  percent: number
} {
  const tier = getTierForHours(hours)
  const next = getNextTier(hours)
  const hoursForTier = tier.maxHours === Infinity ? 0 : tier.maxHours - tier.minHours
  const hoursIntoTier = tier.maxHours === Infinity ? hours - tier.minHours : hours - tier.minHours
  const percent = tier.maxHours === Infinity ? 100 : Math.min(100, (hoursIntoTier / hoursForTier) * 100)
  return { tier, next, hoursIntoTier, hoursForTier, percent }
}

export function getOverallProgress(hours: number, targetHours: number): number {
  return Math.min(100, (hours / targetHours) * 100)
}

export function estimateYearsToMastery(
  hours: number,
  targetHours: number,
  avgHoursPerWeek: number
): number | null {
  const remaining = targetHours - hours
  if (remaining <= 0) return 0
  if (avgHoursPerWeek <= 0) return null
  const weeksRemaining = remaining / avgHoursPerWeek
  return weeksRemaining / 52
}
