import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useStore } from '../store/useStore'
import { useAuthStore } from '../store/useAuthStore'
import { isSupabaseConfigured } from '../lib/supabase'
import { CLICK_SOUND_OPTIONS, playClickSound, type ClickSoundId } from '../utils/sound'
import { exportMasteryData, parseMasteryExport, type MasteryExport } from '../utils/export'
import { getNotificationPermission, isNotificationSupported, requestNotificationPermission } from '../utils/notifications'
import { to12Hour, to24HourTime, type MeridiemPeriod } from '../utils/date'
import { THEME_OPTIONS } from '../utils/themes'

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1)
const MINUTES = Array.from({ length: 60 }, (_, i) => i)
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
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)
  const resetAllData = useStore((s) => s.resetAllData)
  const importData = useStore((s) => s.importData)
  const notificationsEnabled = useStore((s) => s.notificationsEnabled)
  const setNotificationsEnabled = useStore((s) => s.setNotificationsEnabled)
  const reminderTime = useStore((s) => s.reminderTime)
  const setReminderTime = useStore((s) => s.setReminderTime)

  const profile = useAuthStore((s) => s.profile)
  const authError = useAuthStore((s) => s.authError)
  const updateUsername = useAuthStore((s) => s.updateUsername)
  const signOut = useAuthStore((s) => s.signOut)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [usernameInput, setUsernameInput] = useState(profile?.username ?? '')
  const [usernameSaved, setUsernameSaved] = useState(false)
  const [notifPermission, setNotifPermission] = useState(getNotificationPermission())
  const [exported, setExported] = useState(false)
  const [pendingImport, setPendingImport] = useState<MasteryExport | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [imported, setImported] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleReset = () => {
    resetAllData()
    setConfirmOpen(false)
    setConfirmText('')
  }

  const handleToggleNotifications = async () => {
    if (notificationsEnabled) {
      setNotificationsEnabled(false)
      return
    }
    const perm = await requestNotificationPermission()
    setNotifPermission(perm)
    if (perm === 'granted') setNotificationsEnabled(true)
  }

  const handleExport = () => {
    exportMasteryData(skills, unlockedAchievements)
    setExported(true)
    setTimeout(() => setExported(false), 2000)
  }

  const handleImportClick = () => {
    setImportError(null)
    fileInputRef.current?.click()
  }

  const handleFileSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setImportError(null)
    try {
      const text = await file.text()
      setPendingImport(parseMasteryExport(text))
    } catch (err) {
      setPendingImport(null)
      setImportError(err instanceof Error ? err.message : 'Could not read that file.')
    }
  }

  const handleConfirmImport = () => {
    if (!pendingImport) return
    importData(pendingImport.skills, pendingImport.unlockedAchievements)
    setPendingImport(null)
    setImported(true)
    setTimeout(() => setImported(false), 2000)
  }

  const { hour: reminderHour, minute: reminderMinute, period: reminderPeriod } = to12Hour(reminderTime)

  const handleReminderHourChange = (hour: number) => {
    setReminderTime(to24HourTime(hour, reminderMinute, reminderPeriod))
  }

  const handleReminderMinuteChange = (minute: number) => {
    setReminderTime(to24HourTime(reminderHour, minute, reminderPeriod))
  }

  const handleReminderPeriodChange = (period: MeridiemPeriod) => {
    setReminderTime(to24HourTime(reminderHour, reminderMinute, period))
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

      <PixelPanel glow="amber">
        <h2 className="font-pixel text-sm text-amber mb-4">APPEARANCE</h2>
        <label className="font-pixel text-[10px] text-paper/70 block mb-2">COLOR THEME</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {THEME_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => setTheme(option.id)}
              className={`flex flex-col items-center gap-2 px-2 py-3 border-2 transition-colors ${
                theme === option.id
                  ? 'border-amber bg-panel2'
                  : 'border-line bg-panel2 hover:border-amber/60'
              }`}
            >
              <div className="flex gap-1">
                {option.swatches.map((swatch, i) => (
                  <span
                    key={i}
                    className="block w-3 h-3 border border-black/40"
                    style={{ backgroundColor: swatch }}
                  />
                ))}
              </div>
              <span
                className={`font-pixel text-[9px] ${theme === option.id ? 'text-amber' : 'text-paper/60'}`}
              >
                {option.label}
              </span>
            </button>
          ))}
        </div>
        <p className="font-body text-base text-paper/40 mt-3">
          Changes the app's accent colors. Tier ranks and achievement icons stay the same.
        </p>
      </PixelPanel>

      <PixelPanel glow="magenta">
        <h2 className="font-pixel text-sm text-magenta mb-4">REMINDERS</h2>
        {!isNotificationSupported() ? (
          <p className="font-body text-lg text-paper/50">
            Your browser doesn't support notifications.
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <p className="font-body text-xl text-paper/80">Daily practice reminder</p>
              <PixelButton
                variant={notificationsEnabled ? 'magenta' : 'default'}
                size="sm"
                onClick={handleToggleNotifications}
              >
                {notificationsEnabled ? 'ON 🔔' : 'OFF 🔕'}
              </PixelButton>
            </div>
            {notifPermission === 'denied' && (
              <p className="font-body text-lg text-blood mt-2">
                Notifications are blocked for this site in your browser. Enable them in your browser's site
                settings to turn reminders on.
              </p>
            )}
            <div className="mt-5">
              <label className="font-pixel text-[10px] text-paper/70 block mb-2">REMIND ME AT</label>
              <div className="flex items-center gap-2">
                <select
                  value={reminderHour}
                  onChange={(e) => handleReminderHourChange(Number(e.target.value))}
                  disabled={!notificationsEnabled}
                  className="bg-ink border-2 border-line px-2 py-2 font-body text-xl text-paper focus:outline-none focus:border-magenta disabled:opacity-40"
                >
                  {HOURS.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
                <span className="font-pixel text-lg text-paper/60">:</span>
                <select
                  value={reminderMinute}
                  onChange={(e) => handleReminderMinuteChange(Number(e.target.value))}
                  disabled={!notificationsEnabled}
                  className="bg-ink border-2 border-line px-2 py-2 font-body text-xl text-paper focus:outline-none focus:border-magenta disabled:opacity-40"
                >
                  {MINUTES.map((m) => (
                    <option key={m} value={m}>
                      {String(m).padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <div className="flex gap-1 ml-2">
                  {(['AM', 'PM'] as MeridiemPeriod[]).map((period) => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => handleReminderPeriodChange(period)}
                      disabled={!notificationsEnabled}
                      className={`font-pixel text-xs px-3 py-2 border-2 transition-colors disabled:opacity-40 ${
                        reminderPeriod === period
                          ? 'bg-magenta text-ink border-ink'
                          : 'bg-panel2 text-paper/60 border-line hover:text-magenta hover:border-magenta'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
              <p className="font-body text-base text-paper/40 mt-2">
                If any skill hasn't been logged yet that day, you'll get a browser notification at this time.
                Only fires while MASTERY is open in a tab.
              </p>
            </div>
          </>
        )}
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

      <PixelPanel glow="lime">
        <h2 className="font-pixel text-sm text-lime mb-4">BACKUP</h2>
        <p className="font-body text-xl text-paper/70 mb-4">
          Download all your skills, sessions, and achievements as a JSON file. Since your data lives only in this
          browser, keep a backup somewhere safe in case you clear your browser data or switch devices.
        </p>
        <div className="flex flex-wrap gap-3">
          <PixelButton variant="lime" onClick={handleExport} disabled={skills.length === 0}>
            EXPORT DATA (JSON)
          </PixelButton>
          <PixelButton variant="default" onClick={handleImportClick}>
            IMPORT DATA (JSON)
          </PixelButton>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileSelected}
          className="hidden"
        />
        {exported && <p className="font-body text-lg text-lime mt-2">Downloaded!</p>}
        {imported && <p className="font-body text-lg text-lime mt-2">Data imported!</p>}
        {importError && <p className="font-body text-lg text-blood mt-2">{importError}</p>}
      </PixelPanel>

      <PixelPanel style={{ borderColor: 'var(--color-blood)' }}>
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

      <PixelModal open={pendingImport !== null} onClose={() => setPendingImport(null)} title="⚠ CONFIRM IMPORT">
        <p className="font-body text-xl text-paper/80 mb-6">
          This file has <span className="text-lime">{pendingImport?.skills.length ?? 0}</span> skill(s) and{' '}
          <span className="text-lime">{pendingImport?.unlockedAchievements.length ?? 0}</span> achievement(s).
          Importing will <span className="text-blood">replace all data currently stored in this browser</span>{' '}
          ({skills.length} skill(s) now). This cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <PixelButton variant="default" onClick={() => setPendingImport(null)}>
            CANCEL
          </PixelButton>
          <PixelButton variant="lime" onClick={handleConfirmImport}>
            REPLACE WITH IMPORTED DATA
          </PixelButton>
        </div>
      </PixelModal>
    </div>
  )
}
