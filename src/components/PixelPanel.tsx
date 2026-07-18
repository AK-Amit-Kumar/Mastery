import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'

interface PixelPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  glow?: 'cyan' | 'magenta' | 'lime' | 'amber' | 'none'
}

const glowClasses: Record<string, string> = {
  cyan: 'shadow-pixel-cyan',
  magenta: 'shadow-pixel-magenta',
  lime: 'shadow-[4px_4px_0_0_#7dff6b]',
  amber: 'shadow-[4px_4px_0_0_#ffd23f]',
  none: 'shadow-pixel',
}

const PixelPanel = forwardRef<HTMLDivElement, PixelPanelProps>(
  ({ children, glow = 'none', className = '', ...rest }, ref) => {
    return (
      <div
        ref={ref}
        {...rest}
        className={`bg-panel border-2 border-line ${glowClasses[glow]} p-4 ${className}`}
      >
        {children}
      </div>
    )
  }
)

PixelPanel.displayName = 'PixelPanel'

export default PixelPanel
