import { useState } from 'react'
import { useStore } from '../store/useStore'
import { useAuthStore } from '../store/useAuthStore'
import { isSupabaseConfigured } from '../lib/supabase'
import { CLICK_SOUND_OPTIONS, playClickSound, type ClickSoundId } from '../utils/sound'
import PixelPanel from '../components/PixelPanel'
import PixelButton from '../components/PixelButton'
import PixelModal from '../components/PixelModal'

export default function Settings() {
  const skills = useStore((s) => s.skills)
  const unlockedAchievements = useStore((s) => s.unlockedAchievements)
  const muted = useStore((s) => s.muted)
  const toggleMute = useStore((s) => s.toggleMute)
  const clickSound = useStore((s) => s.clickSound)
  const setClickSound = useStore((s) => s.setClickSound)
  const resetAllData = useStore((s) => s.resetAllData)

  const profile = useAuthStore((s) => s.profile)
  const authError = useAuthStore((s) => s.authError)
  const updateUsername = useAuthStore((s) => s.updateUsername)
  const signOut = useAuthStore((s) => s.signOut)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [usernameInput, setUsernameInput] = useState(profile?.username ?? '')
  const [usernameSaved, setUsernameSaved] = useState(false)

  const handleReset = () => {
    resetAllData()
    setConfirmOpen(false)
    setConfirmText('')
  }

  const handleSaveUsername = async () => {
    setUsernameSaved(false)
    const ok = await updateUsername(usernameInput)
    if (ok) {
      setUsernameSaved(true)
      setTimeout(() => setUsernameSaved(false), 2000)
    }
  }

  const handleSelectClickSound = (id: ClickSoundId) => {
    if (!muted) playClickSound(id)
    setClickSound(id)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div>
        <h1 className="font-pixel text-2xl text-paper mb-1">CONFIG</h1>
        <p className="font-body text-xl text-paper/60">App settings and preferences.</p>
      </div>

      {isSupabaseConfigured && profile && (
        <PixelPanel glow="lime">
          <h2 className="font-pixel text-sm text-lime mb-4">ACCOUNT</h2>
          <label className="font-pixel text-[10px] text-paper/70 block mb-2">LEADERBOARD USERNAME</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              minLength={2}
              maxLength={24}
              className="flex-1 bg-ink border-2 border-line px-3 py-2 font-body text-xl text-paper focus:outline-none focus:border-lime"
            />
            <PixelButton variant="lime" onClick={handleSaveUsername} disabled={usernameInput.trim() === profile.username}>
              SAVE
            </PixelButton>
          </div>
          {usernameSaved && <p className="font-body text-lg text-lime mt-2">Username updated!</p>}
          {authError && <p className="font-body text-lg text-blood mt-2">{authError}</p>}
          <div className="flex justify-end mt-4">
            <PixelButton variant="default" size="sm" onClick={signOut}>
              LOG OUT
            </PixelButton>
          </div>
        </PixelPanel>
      )}

      <PixelPanel glow="cyan">
        <h2 className="font-pixel text-sm text-cyan mb-4">AUDIO</h2>
        <div className="flex items-center justify-between">
          <p className="font-body text-xl text-paper/80">Sound effects (clicks, level-ups)</p>
          <PixelButton variant={muted ? 'default' : 'lime'} size="sm" onClick={toggleMute}>
            {muted ? 'MUTED 🔇' : 'ON 🔊'}
          </PixelButton>
        </div>

        <div className="mt-5">
          <label className="font-pixel text-[10px] text-paper/70 block mb-2">CLICK SOUND</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {CLICK_SOUND_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelectClickSound(option.id)}
                className={`font-pixel text-[9px] px-2 py-3 border-2 transition-colors ${
                  clickSound === option.id
                    ? 'bg-cyan text-ink border-ink'
                    : 'bg-panel2 text-paper/60 border-line hover:text-cyan hover:border-cyan'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="font-body text-base text-paper/40 mt-2">Tap an option to preview and select it.</p>
        </div>
      </PixelPanel>

      <PixelPanel>
        <h2 className="font-pixel text-sm text-paper mb-4">DATA SUMMARY</h2>
        <div className="grid grid-cols-2 gap-4 font-body text-xl text-paper/80">
          <p>Skills tracked: <span className="text-lime">{skills.length}</span></p>
          <p>Achievements unlocked: <span className="text-amber">{unlockedAchievements.length}</span></p>
          <p>Total sessions logged: <span className="text-cyan">{skills.reduce((sum, s) => sum + s.sessions.length, 0)}</span></p>
          <p>Total hours: <span className="text-magenta">{skills.reduce((sum, s) => sum + s.totalHoursLogged, 0).toFixed(1)}</span></p>
        </div>
      </PixelPanel>

      <PixelPanel style={{ borderColor: '#ff4d4d' }}>
        <h2 className="font-pixel text-sm text-blood mb-4">DANGER ZONE</h2>
        <p className="font-body text-xl text-paper/70 mb-4">
          Permanently erase every skill, session, streak, and achievement stored in this browser. This cannot be undone.
        </p>
        <PixelButton variant="danger" onClick={() => setConfirmOpen(true)}>
          RESET ALL DATA
        </PixelButton>
      </PixelPanel>

      <PixelModal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="⚠ CONFIRM RESET">
        <p className="font-body text-xl text-paper/80 mb-4">
          Type <span className="text-blood font-pixel text-sm">RESET</span> below to confirm you want to permanently
          delete all data.
        </p>
        <input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="Type RESET"
          className="w-full bg-ink border-2 border-line px-3 py-2 font-body text-xl text-paper focus:outline-none focus:border-blood mb-6"
        />
        <div className="flex gap-3 justify-end">
          <PixelButton variant="default" onClick={() => setConfirmOpen(false)}>
            CANCEL
          </PixelButton>
          <PixelButton variant="danger" onClick={handleReset} disabled={confirmText !== 'RESET'}>
            ERASE EVERYTHING
          </PixelButton>
        </div>
      </PixelModal>
    </div>
  )
}
