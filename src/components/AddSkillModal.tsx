import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PixelModal from './PixelModal'
import PixelButton from './PixelButton'
import { useStore } from '../store/useStore'
import { SKILL_ICONS, pickRandomIcon } from '../utils/icons'

interface AddSkillModalProps {
  open: boolean
  onClose: () => void
}

export default function AddSkillModal({ open, onClose }: AddSkillModalProps) {
  const addSkill = useStore((s) => s.addSkill)
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [icon, setIcon] = useState(pickRandomIcon())
  const [customTarget, setCustomTarget] = useState(false)
  const [targetHours, setTargetHours] = useState(10000)
  const [error, setError] = useState('')

  const reset = () => {
    setName('')
    setIcon(pickRandomIcon())
    setCustomTarget(false)
    setTargetHours(10000)
    setError('')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Enter a skill name.')
      return
    }
    if (customTarget && (!targetHours || targetHours <= 0)) {
      setError('Target hours must be greater than 0.')
      return
    }
    const id = addSkill(trimmed, icon, customTarget ? targetHours : 10000)
    handleClose()
    navigate(`/skill/${id}`)
  }

  return (
    <PixelModal open={open} onClose={handleClose} title="+ ADD NEW SKILL">
      <div className="flex flex-col gap-4">
        <div>
          <label className="font-pixel text-[10px] text-paper/70 block mb-2">SKILL NAME</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Quantum Computing"
            className="w-full bg-ink border-2 border-line px-3 py-2 font-body text-xl text-paper focus:outline-none focus:border-cyan"
            maxLength={40}
          />
        </div>

        <div>
          <label className="font-pixel text-[10px] text-paper/70 block mb-2">CHOOSE ICON</label>
          <div className="grid grid-cols-8 gap-2">
            {SKILL_ICONS.map((ic) => (
              <button
                key={ic}
                onClick={() => setIcon(ic)}
                className={`aspect-square flex items-center justify-center text-xl border-2 ${
                  icon === ic ? 'border-cyan bg-cyan/20' : 'border-line bg-ink'
                }`}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 font-body text-lg text-paper/80 cursor-pointer">
            <input
              type="checkbox"
              checked={customTarget}
              onChange={(e) => setCustomTarget(e.target.checked)}
              className="w-4 h-4 accent-magenta"
            />
            Set custom target hours (default 10,000)
          </label>
          {customTarget && (
            <input
              type="number"
              min={1}
              value={targetHours}
              onChange={(e) => setTargetHours(Number(e.target.value))}
              className="mt-2 w-full bg-ink border-2 border-line px-3 py-2 font-body text-xl text-paper focus:outline-none focus:border-cyan"
            />
          )}
        </div>

        {error && <p className="font-body text-lg text-blood">{error}</p>}

        <div className="flex gap-3 justify-end pt-2">
          <PixelButton variant="default" onClick={handleClose}>
            CANCEL
          </PixelButton>
          <PixelButton variant="lime" onClick={handleSubmit}>
            CREATE
          </PixelButton>
        </div>
      </div>
    </PixelModal>
  )
}
