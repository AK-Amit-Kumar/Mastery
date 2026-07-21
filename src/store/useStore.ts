import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AchievementId, Skill, UnlockedAchievement } from '../types'
import { generateId } from '../utils/icons'
import { todayISO, isWeekend, addDays } from '../utils/date'
import { computeStreak, recomputeStreakFromSessions } from '../utils/streak'
import { getTierForHours } from '../utils/leveling'
import type { ClickSoundId } from '../utils/sound'

const DEFAULT_TARGET_HOURS = 10000

export interface LevelUpEvent {
  skillId: string
  skillName: string
  tierId: number
  tierName: string
}

interface MasteryState {
  skills: Skill[]
  unlockedAchievements: UnlockedAchievement[]
  muted: boolean
  clickSound: ClickSoundId
  levelUpEvent: LevelUpEvent | null
  masterCelebrationSkillId: string | null
  notificationsEnabled: boolean
  reminderTime: string // HH:mm, 24h
  lastReminderShownDate: string | null

  addSkill: (name: string, icon: string, targetHours?: number) => string
  deleteSkill: (id: string) => void
  logSession: (skillId: string, hours: number, note?: string, date?: string) => void
  updateSession: (skillId: string, sessionId: string, updates: { date: string; hoursSpent: number; note?: string }) => void
  deleteSession: (skillId: string, sessionId: string) => void
  toggleMute: () => void
  setClickSound: (id: ClickSoundId) => void
  setNotificationsEnabled: (enabled: boolean) => void
  setReminderTime: (time: string) => void
  markReminderShown: (date: string) => void
  importData: (skills: Skill[], unlockedAchievements: UnlockedAchievement[]) => void
  resetAllData: () => void
  clearLevelUpEvent: () => void
  clearMasterCelebration: () => void
  seedIfEmpty: () => void
}

function newSkill(name: string, icon: string, targetHours: number): Skill {
  return {
    id: generateId(),
    name,
    icon,
    targetHours,
    createdAt: new Date().toISOString(),
    totalHoursLogged: 0,
    sessions: [],
    dailyStreak: 0,
    longestStreak: 0,
    lastLogDate: null,
    masterCelebrated: false,
  }
}

function buildSeedSkill(): Skill {
  const skill = newSkill('Reading', '📖', DEFAULT_TARGET_HOURS)
  const today = todayISO()
  const dates: { offset: number; hours: number }[] = [
    { offset: -2, hours: 1.5 },
    { offset: -1, hours: 2 },
    { offset: 0, hours: 1.5 },
  ]
  let total = 0
  let streak = 0
  let longest = 0
  let lastDate: string | null = null
  const sessions = dates.map(({ offset, hours }) => {
    const date = addDays(today, offset)
    total += hours
    const result = computeStreak(lastDate, streak, longest, date)
    streak = result.dailyStreak
    longest = result.longestStreak
    lastDate = date
    return { id: generateId(), date, hoursSpent: hours, note: undefined }
  })
  skill.sessions = sessions
  skill.totalHoursLogged = Math.round(total * 100) / 100
  skill.dailyStreak = streak
  skill.longestStreak = longest
  skill.lastLogDate = lastDate
  return skill
}

function unlock(
  achievements: UnlockedAchievement[],
  id: AchievementId,
  skillId?: string
): UnlockedAchievement[] {
  if (achievements.some((a) => a.id === id)) return achievements
  return [...achievements, { id, unlockedAt: new Date().toISOString(), skillId }]
}

export const useStore = create<MasteryState>()(
  persist(
    (set, get) => ({
      skills: [],
      unlockedAchievements: [],
      muted: false,
      clickSound: 'blip',
      levelUpEvent: null,
      masterCelebrationSkillId: null,
      notificationsEnabled: false,
      reminderTime: '20:00',
      lastReminderShownDate: null,

      addSkill: (name, icon, targetHours = DEFAULT_TARGET_HOURS) => {
        const skill = newSkill(name.trim(), icon, targetHours)
        set((state) => {
          const skills = [...state.skills, skill]
          let unlockedAchievements = state.unlockedAchievements
          if (skills.length >= 5) {
            unlockedAchievements = unlock(unlockedAchievements, 'five-skills')
          }
          return { skills, unlockedAchievements }
        })
        return skill.id
      },

      deleteSkill: (id) => {
        set((state) => ({ skills: state.skills.filter((s) => s.id !== id) }))
      },

      logSession: (skillId, hours, note, date = todayISO()) => {
        if (hours <= 0) return
        const state = get()
        const skill = state.skills.find((s) => s.id === skillId)
        if (!skill) return

        const prevTier = getTierForHours(skill.totalHoursLogged)
        const newTotal = Math.round((skill.totalHoursLogged + hours) * 100) / 100
        const newTier = getTierForHours(newTotal)

        const streakResult = computeStreak(skill.lastLogDate, skill.dailyStreak, skill.longestStreak, date)

        const session = { id: generateId(), date, hoursSpent: hours, note: note?.trim() || undefined }

        const updatedSkill: Skill = {
          ...skill,
          sessions: [session, ...skill.sessions],
          totalHoursLogged: newTotal,
          dailyStreak: streakResult.dailyStreak,
          longestStreak: streakResult.longestStreak,
          lastLogDate: date,
        }

        let unlockedAchievements = state.unlockedAchievements
        const isFirstSessionEver = state.skills.every((s) => s.sessions.length === 0)
        if (isFirstSessionEver) {
          unlockedAchievements = unlock(unlockedAchievements, 'first-hour')
        }
        if (streakResult.dailyStreak >= 7) {
          unlockedAchievements = unlock(unlockedAchievements, 'streak-7')
        }
        if (streakResult.dailyStreak >= 30) {
          unlockedAchievements = unlock(unlockedAchievements, 'streak-30')
        }
        if (newTotal >= 100) {
          unlockedAchievements = unlock(unlockedAchievements, 'hours-100')
        }
        if (newTotal >= 1000) {
          unlockedAchievements = unlock(unlockedAchievements, 'hours-1000')
        }
        if (isWeekend(date)) {
          unlockedAchievements = unlock(unlockedAchievements, 'weekend-warrior')
        }
        if (streakResult.wasComeback) {
          unlockedAchievements = unlock(unlockedAchievements, 'comeback-kid')
        }

        let levelUpEvent: LevelUpEvent | null = null
        let masterCelebrationSkillId: string | null = null

        if (newTier.id > prevTier.id) {
          const reachedMaster = newTier.id === 9 && !skill.masterCelebrated
          if (reachedMaster) {
            // The full-screen MASTER celebration replaces the regular level-up modal
            // so the two full-screen overlays never stack.
            updatedSkill.masterCelebrated = true
            masterCelebrationSkillId = skillId
            unlockedAchievements = unlock(unlockedAchievements, 'first-master', skillId)
          } else {
            levelUpEvent = { skillId, skillName: skill.name, tierId: newTier.id, tierName: newTier.name }
          }
        }

        set((s) => ({
          skills: s.skills.map((sk) => (sk.id === skillId ? updatedSkill : sk)),
          unlockedAchievements,
          levelUpEvent: levelUpEvent ?? s.levelUpEvent,
          masterCelebrationSkillId: masterCelebrationSkillId ?? s.masterCelebrationSkillId,
        }))
      },

      updateSession: (skillId, sessionId, updates) => {
        if (updates.hoursSpent <= 0) return
        set((state) => ({
          skills: state.skills.map((sk) => {
            if (sk.id !== skillId) return sk
            const sessions = sk.sessions.map((s) =>
              s.id === sessionId
                ? { ...s, date: updates.date, hoursSpent: updates.hoursSpent, note: updates.note?.trim() || undefined }
                : s
            )
            const totalHoursLogged = Math.round(sessions.reduce((sum, s) => sum + s.hoursSpent, 0) * 100) / 100
            const { dailyStreak, longestStreak, lastLogDate } = recomputeStreakFromSessions(sessions)
            return { ...sk, sessions, totalHoursLogged, dailyStreak, longestStreak, lastLogDate }
          }),
        }))
      },

      deleteSession: (skillId, sessionId) => {
        set((state) => ({
          skills: state.skills.map((sk) => {
            if (sk.id !== skillId) return sk
            const sessions = sk.sessions.filter((s) => s.id !== sessionId)
            const totalHoursLogged = Math.round(sessions.reduce((sum, s) => sum + s.hoursSpent, 0) * 100) / 100
            const { dailyStreak, longestStreak, lastLogDate } = recomputeStreakFromSessions(sessions)
            return { ...sk, sessions, totalHoursLogged, dailyStreak, longestStreak, lastLogDate }
          }),
        }))
      },

      toggleMute: () => set((state) => ({ muted: !state.muted })),

      setClickSound: (id) => set({ clickSound: id }),

      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),

      setReminderTime: (time) => set({ reminderTime: time }),

      markReminderShown: (date) => set({ lastReminderShownDate: date }),

      importData: (skills, unlockedAchievements) =>
        set({
          skills,
          unlockedAchievements,
          levelUpEvent: null,
          masterCelebrationSkillId: null,
        }),

      resetAllData: () =>
        set({
          skills: [],
          unlockedAchievements: [],
          levelUpEvent: null,
          masterCelebrationSkillId: null,
        }),

      clearLevelUpEvent: () => set({ levelUpEvent: null }),
      clearMasterCelebration: () => set({ masterCelebrationSkillId: null }),

      seedIfEmpty: () => {
        const state = get()
        if (state.skills.length === 0 && !localStorage.getItem('mastery-seeded')) {
          const seedSkill = buildSeedSkill()
          let unlockedAchievements = state.unlockedAchievements
          if (seedSkill.sessions.length > 0) {
            unlockedAchievements = unlock(unlockedAchievements, 'first-hour')
          }
          if (seedSkill.longestStreak >= 7) {
            unlockedAchievements = unlock(unlockedAchievements, 'streak-7')
          }
          if (seedSkill.longestStreak >= 30) {
            unlockedAchievements = unlock(unlockedAchievements, 'streak-30')
          }
          if (seedSkill.totalHoursLogged >= 100) {
            unlockedAchievements = unlock(unlockedAchievements, 'hours-100')
          }
          if (seedSkill.totalHoursLogged >= 1000) {
            unlockedAchievements = unlock(unlockedAchievements, 'hours-1000')
          }
          if (seedSkill.sessions.some((s) => isWeekend(s.date))) {
            unlockedAchievements = unlock(unlockedAchievements, 'weekend-warrior')
          }
          set({ skills: [seedSkill], unlockedAchievements })
          localStorage.setItem('mastery-seeded', '1')
        }
      },
    }),
    {
      name: 'mastery-storage',
    }
  )
)
