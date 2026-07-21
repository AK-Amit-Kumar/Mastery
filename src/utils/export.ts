import type { Skill, UnlockedAchievement } from '../types'
import { todayISO } from './date'

export interface MasteryExport {
  exportedAt: string
  version: 1
  skills: Skill[]
  unlockedAchievements: UnlockedAchievement[]
}

export function buildExport(skills: Skill[], unlockedAchievements: UnlockedAchievement[]): MasteryExport {
  return {
    exportedAt: new Date().toISOString(),
    version: 1,
    skills,
    unlockedAchievements,
  }
}

export function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportMasteryData(skills: Skill[], unlockedAchievements: UnlockedAchievement[]) {
  const data = buildExport(skills, unlockedAchievements)
  downloadJSON(data, `mastery-export-${todayISO()}.json`)
}

function isSessionLike(value: unknown): value is Skill['sessions'][number] {
  if (!value || typeof value !== 'object') return false
  const s = value as Record<string, unknown>
  return typeof s.id === 'string' && typeof s.date === 'string' && typeof s.hoursSpent === 'number'
}

function isSkillLike(value: unknown): value is Skill {
  if (!value || typeof value !== 'object') return false
  const s = value as Record<string, unknown>
  return (
    typeof s.id === 'string' &&
    typeof s.name === 'string' &&
    typeof s.targetHours === 'number' &&
    typeof s.totalHoursLogged === 'number' &&
    Array.isArray(s.sessions) &&
    s.sessions.every(isSessionLike)
  )
}

function isUnlockedAchievementLike(value: unknown): value is UnlockedAchievement {
  if (!value || typeof value !== 'object') return false
  const a = value as Record<string, unknown>
  return typeof a.id === 'string' && typeof a.unlockedAt === 'string'
}

export function parseMasteryExport(raw: string): MasteryExport {
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    throw new Error('That file is not valid JSON.')
  }

  if (!data || typeof data !== 'object') {
    throw new Error('That file is not a valid MASTERY export.')
  }
  const d = data as Record<string, unknown>

  if (!Array.isArray(d.skills) || !d.skills.every(isSkillLike)) {
    throw new Error('That file is missing valid skill data.')
  }
  if (!Array.isArray(d.unlockedAchievements) || !d.unlockedAchievements.every(isUnlockedAchievementLike)) {
    throw new Error('That file is missing valid achievement data.')
  }

  return {
    exportedAt: typeof d.exportedAt === 'string' ? d.exportedAt : new Date().toISOString(),
    version: 1,
    skills: d.skills,
    unlockedAchievements: d.unlockedAchievements,
  }
}
