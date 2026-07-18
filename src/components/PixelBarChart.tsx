interface PixelBarChartProps {
  data: { label: string; value: number }[]
  color?: string
  height?: number
}

export default function PixelBarChart({ data, color = '#4deeea', height = 160 }: PixelBarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value))

  return (
    <div className="w-full overflow-x-auto no-scrollbar">
      <div className="flex items-end gap-2 w-max min-w-full" style={{ height }}>
        {data.map((d, i) => {
          const barHeight = Math.max(2, (d.value / max) * (height - 24))
          return (
            <div key={i} className="flex flex-col items-center gap-1 w-10 shrink-0">
              <span className="font-body text-sm text-paper/70">{d.value > 0 ? d.value.toFixed(1) : ''}</span>
              <div
                className="w-full border-2 border-black/40"
                style={{
                  height: barHeight,
                  backgroundColor: color,
                  imageRendering: 'pixelated',
                  boxShadow: 'inset -3px -3px 0 rgba(0,0,0,0.25)',
                }}
              />
              <span className="font-pixel text-[8px] text-paper/50 text-center leading-tight">{d.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
