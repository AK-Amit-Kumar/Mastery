interface StreakFlameProps {
  streak: number
  size?: 'sm' | 'md' | 'lg'
}

export default function StreakFlame({ streak, size = 'md' }: StreakFlameProps) {
  const scale = streak >= 30 ? 1.3 : streak >= 14 ? 1.15 : streak >= 7 ? 1.05 : 1
  const color = streak >= 30 ? '#f92aad' : streak >= 7 ? '#ffd23f' : streak > 0 ? '#ff9d3f' : '#4a4a6a'
  const sizePx = size === 'lg' ? 32 : size === 'sm' ? 16 : 22

  return (
    <div className="inline-flex items-center gap-1.5" title={`${streak} day streak`}>
      <span
        className="inline-block"
        style={{ fontSize: sizePx, transform: `scale(${scale})`, filter: streak > 0 ? `drop-shadow(0 0 4px ${color})` : undefined }}
      >
        🔥
      </span>
      <span className="font-pixel text-xs" style={{ color }}>
        {streak}
      </span>
    </div>
  )
}
