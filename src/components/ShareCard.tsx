import { forwardRef } from 'react'
import type { Skill, Tier } from '../types'
import TierBadge from './TierBadge'
import PixelBar from './PixelBar'
import StreakFlame from './StreakFlame'

interface ShareCardProps {
  skill: Skill
  tier: Tier
  overallPercent: number
  hoursThisWeek: number
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ skill, tier, overallPercent, hoursThisWeek }, ref) => {
    return (
      <div
        ref={ref}
        className="bg-ink border-4 border-line flex flex-col items-center text-center px-8 py-10 gap-6"
        style={{ width: 720, height: 900 }}
      >
        <p className="font-pixel text-xs text-cyan tracking-widest">MASTERY_</p>

        <div className="flex flex-col items-center gap-3 mt-4">
          <span className="text-6xl">{skill.icon}</span>
          <h2 className="font-pixel text-2xl text-paper">{skill.name}</h2>
        </div>

        <TierBadge tier={tier} size={128} />
        <p className="font-pixel text-lg -mt-2" style={{ color: tier.color }}>
          {tier.name}
        </p>

        <div className="grid grid-cols-2 gap-6 w-full mt-4">
          <div className="border-2 border-line bg-panel px-4 py-4">
            <p className="font-pixel text-2xl text-amber">{skill.totalHoursLogged.toLocaleString()}</p>
            <p className="font-body text-lg text-paper/60 mt-1">Total Hours</p>
          </div>
          <div className="border-2 border-line bg-panel px-4 py-4">
            <p className="font-pixel text-2xl text-cyan">{hoursThisWeek.toFixed(1)}</p>
            <p className="font-body text-lg text-paper/60 mt-1">This Week</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 w-full">
          <div className="flex flex-col items-center gap-1 border-2 border-line bg-panel px-4 py-3 flex-1">
            <StreakFlame streak={skill.dailyStreak} size="lg" />
            <p className="font-body text-lg text-paper/60">Current Streak</p>
          </div>
          <div className="flex flex-col items-center gap-1 border-2 border-line bg-panel px-4 py-3 flex-1">
            <p className="font-pixel text-xl text-magenta">{skill.longestStreak}</p>
            <p className="font-body text-lg text-paper/60">Best Streak</p>
          </div>
        </div>

        <div className="w-full mt-2">
          <PixelBar
            percent={overallPercent}
            color={tier.color}
            segments={24}
            label={`Progress to ${skill.targetHours.toLocaleString()}h mastery`}
          />
        </div>

        <p className="font-body text-lg text-paper/40 mt-auto">10,000 hours to greatness.</p>
      </div>
    )
  }
)

ShareCard.displayName = 'ShareCard'

export default ShareCard
