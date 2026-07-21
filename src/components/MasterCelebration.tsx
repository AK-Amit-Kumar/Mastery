import { useEffect, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import PixelButton from './PixelButton'
import { playMaster } from '../utils/sound'

const CONFETTI_COLORS = [
  'var(--color-cyan)',
  'var(--color-magenta)',
  'var(--color-lime)',
  'var(--color-amber)',
  'var(--color-blood)',
  '#ffffff',
]

interface ConfettiPiece {
  id: number
  x: number
  delay: number
  color: string
  size: number
  rotate: number
}

export default function MasterCelebration() {
  const skillId = useStore((s) => s.masterCelebrationSkillId)
  const skill = useStore((s) => s.skills.find((sk) => sk.id === skillId))
  const clearMasterCelebration = useStore((s) => s.clearMasterCelebration)
  const muted = useStore((s) => s.muted)

  const pieces: ConfettiPiece[] = useMemo(
    () =>
      Array.from({ length: 60 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 1.5,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 6 + Math.random() * 10,
        rotate: Math.random() * 360,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [skillId]
  )

  useEffect(() => {
    if (skillId && !muted) playMaster()
  }, [skillId, muted])

  if (!skillId || !skill) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[500] flex items-center justify-center overflow-hidden bg-black/90"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {pieces.map((p) => (
          <motion.div
            key={p.id}
            className="absolute top-0"
            style={{ left: `${p.x}%`, width: p.size, height: p.size, backgroundColor: p.color }}
            initial={{ y: -20, opacity: 1, rotate: 0 }}
            animate={{ y: '110vh', opacity: [1, 1, 0], rotate: p.rotate }}
            transition={{ duration: 2.5 + Math.random() * 1.5, delay: p.delay, repeat: Infinity, ease: 'linear' }}
          />
        ))}

        <motion.div
          className="relative flex flex-col items-center gap-4 text-center px-6"
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 10, stiffness: 150, delay: 0.2 }}
        >
          <motion.p
            className="font-pixel text-4xl md:text-6xl text-amber"
            animate={{
              textShadow: [
                '0 0 10px var(--color-amber)',
                '0 0 30px var(--color-blood)',
                '0 0 10px var(--color-amber)',
              ],
            }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            MASTER
          </motion.p>
          <p className="font-pixel text-lg text-cyan">{skill.icon} {skill.name}</p>
          <p className="font-body text-2xl text-paper/90">10,000 HOURS ACHIEVED!</p>
          <p className="font-body text-lg text-paper/60 max-w-md">
            You've walked the full path. Legend status unlocked — the grind is complete.
          </p>
          <PixelButton variant="amber" onClick={clearMasterCelebration} className="mt-2">
            CLAIM VICTORY
          </PixelButton>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
