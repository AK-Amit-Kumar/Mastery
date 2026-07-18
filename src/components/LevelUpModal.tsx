import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import { TIERS } from '../utils/leveling'
import TierBadge from './TierBadge'
import PixelButton from './PixelButton'
import { playLevelUp } from '../utils/sound'

export default function LevelUpModal() {
  const event = useStore((s) => s.levelUpEvent)
  const clearLevelUpEvent = useStore((s) => s.clearLevelUpEvent)
  const muted = useStore((s) => s.muted)

  useEffect(() => {
    if (event && !muted) playLevelUp()
  }, [event, muted])

  if (!event) return null
  const tier = TIERS[event.tierId]

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[400] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 bg-white"
          initial={{ opacity: 0.9 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        />
        <motion.div className="absolute inset-0 bg-black/80" />
        <motion.div
          className="relative bg-panel border-4 border-amber shadow-[0_0_40px_rgba(255,210,63,0.5)] px-8 py-8 flex flex-col items-center gap-4 max-w-sm w-full"
          initial={{ scale: 0.3, rotate: -8, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
        >
          <motion.p
            className="font-pixel text-amber text-lg text-center animate-blink"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            LEVEL UP!
          </motion.p>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 8, stiffness: 150, delay: 0.5 }}
          >
            <TierBadge tier={tier} size={96} />
          </motion.div>
          <div className="text-center">
            <p className="font-body text-xl text-paper/80">{event.skillName}</p>
            <p className="font-pixel text-sm mt-2" style={{ color: tier.color }}>
              {tier.name}
            </p>
          </div>
          <PixelButton variant="amber" onClick={clearLevelUpEvent}>
            CONTINUE
          </PixelButton>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
