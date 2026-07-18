import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { playClickSound } from '../utils/sound'
import { useStore } from '../store/useStore'

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'cyan' | 'magenta' | 'lime' | 'amber' | 'default' | 'danger'
  size?: 'sm' | 'md'
}

const variantClasses: Record<string, string> = {
  cyan: 'bg-cyan text-ink border-ink hover:bg-cyan/90',
  magenta: 'bg-magenta text-ink border-ink hover:bg-magenta/90',
  lime: 'bg-lime text-ink border-ink hover:bg-lime/90',
  amber: 'bg-amber text-ink border-ink hover:bg-amber/90',
  default: 'bg-panel2 text-paper border-line hover:bg-line',
  danger: 'bg-blood text-ink border-ink hover:bg-blood/90',
}

export default function PixelButton({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  onClick,
  ...rest
}: PixelButtonProps) {
  const muted = useStore((s) => s.muted)
  const clickSound = useStore((s) => s.clickSound)

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (!muted) playClickSound(clickSound)
    onClick?.(e)
  }

  const sizeClasses = size === 'sm' ? 'px-3 py-1.5 text-[10px]' : 'px-4 py-3 text-xs'

  return (
    <button
      {...rest}
      onClick={handleClick}
      className={`font-pixel border-2 shadow-pixel active:shadow-none active:translate-x-1 active:translate-y-1 transition-transform disabled:opacity-40 disabled:pointer-events-none select-none ${sizeClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
