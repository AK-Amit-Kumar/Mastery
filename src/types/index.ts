export interface Session {
  id: string
  date: string // ISO date string, YYYY-MM-DD
  hoursSpent: number
  note?: string
}

export interface Skill {
  id: string
  name: string
  icon: string
  targetHours: number
  createdAt: string // ISO datetime
  totalHoursLogged: number
  sessions: Session[]
  dailyStreak: number
  longestStreak: number
  lastLogDate: string | null // YYYY-MM-DD
  masterCelebrated: boolean
}

export interface Tier {
  id: number
  name: string
  minHours: number
  maxHours: number // exclusive, Infinity for last tier
  color: string
  shape: 'triangle' | 'square' | 'diamond' | 'pentagon' | 'star' | 'hex' | 'cross' | 'shield' | 'crown' | 'burst'
}

export type AchievementId =
  | 'first-hour'
  | 'streak-7'
  | 'streak-30'
  | 'hours-100'
  | 'hours-1000'
  | 'first-master'
  | 'five-skills'
  | 'weekend-warrior'
  | 'comeback-kid'

export interface Achievement {
  id: AchievementId
  name: string
  description: string
  icon: string
}

export interface UnlockedAchievement {
  id: AchievementId
  unlockedAt: string // ISO datetime
  skillId?: string
}
