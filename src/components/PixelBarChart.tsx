interface PixelBarChartProps {
  data: { label: string; value: number }[]
  color?: string
  height?: number
}

// Value labels, bars, and date labels each live in their own grid row so that
// variable label content (e.g. a date wrapping to two lines) can never push a
// bar out of alignment with its neighbors — every bar sits in an identical
// fixed-height track regardless of what's above or below it.
export default function PixelBarChart({ data, color = 'var(--color-cyan)', height = 130 }: PixelBarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value))

  return (
    <div className="w-full overflow-x-auto no-scrollbar">
      <div
        className="grid gap-x-2 gap-y-1 w-max min-w-full"
        style={{ gridTemplateColumns: `repeat(${data.length}, minmax(2.5rem, 1fr))` }}
      >
        {data.map((d, i) => (
          <span key={`value-${i}`} className="font-body text-sm text-paper/70 text-center">
            {d.value > 0 ? d.value.toFixed(1) : ''}
          </span>
        ))}
        {data.map((d, i) => {
          const barHeight = Math.max(2, (d.value / max) * height)
          return (
            <div key={`bar-${i}`} className="flex items-end justify-center" style={{ height }}>
              <div
                className="w-full border-2 border-black/40"
                style={{
                  height: barHeight,
                  backgroundColor: color,
                  imageRendering: 'pixelated',
                  boxShadow: 'inset -3px -3px 0 rgba(0,0,0,0.25)',
                }}
              />
            </div>
          )
        })}
        {data.map((d, i) => (
          <span key={`label-${i}`} className="font-pixel text-[8px] text-paper/50 text-center leading-tight">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}
