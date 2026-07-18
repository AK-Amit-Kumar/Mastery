import { AnimatePresence, motion } from 'framer-motion'

export interface XPPopupItem {
  id: string
  text: string
  x: number
  y: number
}

interface XPPopupProps {
  popups: XPPopupItem[]
}

export default function XPPopup({ popups }: XPPopupProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[300]">
      <AnimatePresence>
        {popups.map((p) => (
          <motion.div
            key={p.id}
            className="absolute font-pixel text-sm text-lime drop-shadow-[2px_2px_0_#000]"
            style={{ left: p.x, top: p.y }}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -60 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          >
            {p.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
