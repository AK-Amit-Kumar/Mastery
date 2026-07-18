import type { Achievement } from '../types'

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-hour', name: 'First Hour Logged', description: 'Log your very first hour on any skill.', icon: '⏱' },
  { id: 'streak-7', name: '7-Day Streak', description: 'Log a skill 7 days in a row.', icon: '🔥' },
  { id: 'streak-30', name: '30-Day Streak', description: 'Log a skill 30 days in a row.', icon: '🔥' },
  { id: 'hours-100', name: '100 Hours Club', description: 'Reach 100 hours on a single skill.', icon: '💯' },
  { id: 'hours-1000', name: '1,000 Hours Club', description: 'Reach 1,000 hours on a single skill.', icon: '🏆' },
  { id: 'first-master', name: 'First MASTER Rank', description: 'Reach 10,000 hours on a skill.', icon: '👑' },
  { id: 'five-skills', name: '5 Skills Tracked', description: 'Track 5 different skills at once.', icon: '📚' },
  { id: 'weekend-warrior', name: 'Weekend Warrior', description: 'Log a session on a Saturday or Sunday.', icon: '⚔' },
  { id: 'comeback-kid', name: 'Comeback Kid', description: 'Restart a streak after breaking one.', icon: '🔄' },
]

export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id)
}
