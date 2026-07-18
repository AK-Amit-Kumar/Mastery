import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PixelModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: string
}

export default function PixelModal({ open, onClose, children, title }: PixelModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-panel border-4 border-line shadow-pixel max-w-lg w-full max-h-[85vh] overflow-y-auto"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {title && (
              <div className="border-b-2 border-line bg-panel2 px-4 py-3 flex items-center justify-between">
                <h2 className="font-pixel text-xs text-cyan">{title}</h2>
                <button
                  onClick={onClose}
                  className="font-pixel text-xs text-paper/60 hover:text-magenta border-2 border-line px-2 py-1"
                >
                  X
                </button>
              </div>
            )}
            <div className="p-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
