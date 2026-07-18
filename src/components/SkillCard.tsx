import { Link } from 'react-router-dom'
import type { Skill } from '../types'
import { getTierProgress } from '../utils/leveling'
import TierBadge from './TierBadge'
import PixelBar from './PixelBar'
import StreakFlame from './StreakFlame'

interface SkillCardProps {
  skill: Skill
}

export default function SkillCard({ skill }: SkillCardProps) {
  const { tier, percent } = getTierProgress(skill.totalHoursLogged)

  return (
    <Link
      to={`/skill/${skill.id}`}
      className="block bg-panel border-2 border-line shadow-pixel hover:shadow-pixel-cyan hover:-translate-y-1 transition-all p-4"
    >
      <div className="flex items-center gap-3 mb-3">
        <TierBadge tier={tier} size={48} />
        <div className="min-w-0 flex-1">
          <p className="font-pixel text-xs text-paper truncate flex items-center gap-2">
            <span>{skill.icon}</span>
            <span className="truncate">{skill.name}</span>
          </p>
          <p className="font-body text-base" style={{ color: tier.color }}>
            {tier.name}
          </p>
        </div>
        <StreakFlame streak={skill.dailyStreak} size="sm" />
      </div>
      <PixelBar percent={percent} color={tier.color} segments={16} />
      <div className="flex justify-between mt-2 font-body text-base text-paper/70">
        <span>{skill.totalHoursLogged.toLocaleString()} hrs</span>
        <span>/ {skill.targetHours.toLocaleString()} hrs</span>
      </div>
    </Link>
  )
}
