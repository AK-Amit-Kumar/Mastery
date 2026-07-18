interface PixelBarProps {
  percent: number // 0-100
  color?: string
  segments?: number
  label?: string
  height?: 'sm' | 'md' | 'lg'
}

export default function PixelBar({ percent, color = '#4deeea', segments = 20, label, height = 'md' }: PixelBarProps) {
  const filled = Math.round((Math.max(0, Math.min(100, percent)) / 100) * segments)
  const heightClass = height === 'sm' ? 'h-3' : height === 'lg' ? 'h-6' : 'h-4'

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-1 font-body text-sm text-paper/80">
          <span>{label}</span>
          <span>{Math.round(percent)}%</span>
        </div>
      )}
      <div className={`w-full ${heightClass} bg-ink border-2 border-line flex gap-[2px] p-[2px]`}>
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-full"
            style={{
              backgroundColor: i < filled ? color : 'transparent',
              boxShadow: i < filled ? 'inset 0 0 0 1px rgba(0,0,0,0.3)' : undefined,
            }}
          />
        ))}
      </div>
    </div>
  )
}
