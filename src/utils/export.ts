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
