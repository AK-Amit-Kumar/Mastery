import { useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store/useStore'
import type { Session } from '../types'
import { getTierProgress, getOverallProgress, estimateYearsToMastery } from '../utils/leveling'
import { todayISO, formatDateDisplay, daysBetween } from '../utils/date'
import { seedColor } from '../utils/color'
import TierBadge from '../components/TierBadge'
import PixelBar from '../components/PixelBar'
import PixelPanel from '../components/PixelPanel'
import PixelButton from '../components/PixelButton'
import PixelModal from '../components/PixelModal'
import StreakFlame from '../components/StreakFlame'
import CalendarHeatmap from '../components/CalendarHeatmap'
import XPPopup, { type XPPopupItem } from '../components/XPPopup'
import { playCoin } from '../utils/sound'

const QUICK_ADDS = [0.5, 1, 2]

export default function SkillDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const skill = useStore((s) => s.skills.find((sk) => sk.id === id))
  const logSession = useStore((s) => s.logSession)
  const updateSession = useStore((s) => s.updateSession)
  const deleteSession = useStore((s) => s.deleteSession)
  const deleteSkill = useStore((s) => s.deleteSkill)
  const muted = useStore((s) => s.muted)

  const [hours, setHours] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(todayISO())
  const [popups, setPopups] = useState<XPPopupItem[]>([])
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [editHours, setEditHours] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editNote, setEditNote] = useState('')
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null)
  const formRef = useRef<HTMLDivElement>(null)

  const progress = useMemo(() => (skill ? getTierProgress(skill.totalHoursLogged) : null), [skill])

  const avgHoursPerWeek = useMemo(() => {
    if (!skill || skill.sessions.length === 0) return 0
    const today = todayISO()
    const cutoffDays = 28
    const recent = skill.sessions.filter((s) => daysBetween(s.date, today) <= cutoffDays)
    if (recent.length > 0) {
      const sum = recent.reduce((acc, s) => acc + s.hoursSpent, 0)
      const spanDays = Math.min(cutoffDays, Math.max(1, daysBetween(skill.createdAt.slice(0, 10), today)))
      return (sum / spanDays) * 7
    }
    const weeksSinceCreation = Math.max(1, daysBetween(skill.createdAt.slice(0, 10), today) / 7)
    return skill.totalHoursLogged / weeksSinceCreation
  }, [skill])

  if (!skill || !progress) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="font-pixel text-lg text-blood mb-4">SKILL NOT FOUND</p>
        <PixelButton onClick={() => navigate('/')}>BACK TO DASHBOARD</PixelButton>
      </div>
    )
  }

  const overallPercent = getOverallProgress(skill.totalHoursLogged, skill.targetHours)
  const hoursRemaining = Math.max(0, skill.targetHours - skill.totalHoursLogged)
  const yearsRemaining = estimateYearsToMastery(skill.totalHoursLogged, skill.targetHours, avgHoursPerWeek)

  const spawnPopup = (text: string) => {
    const rect = formRef.current?.getBoundingClientRect()
    const x = (rect?.left ?? 100) + (rect?.width ?? 200) / 2 + (Math.random() * 40 - 20)
    const y = (rect?.top ?? 100) + 20
    const popupId = `${Date.now()}-${Math.random()}`
    setPopups((p) => [...p, { id: popupId, text, x, y }])
    setTimeout(() => setPopups((p) => p.filter((item) => item.id !== popupId)), 1300)
  }

  const handleLog = () => {
    const h = parseFloat(hours)
    if (!h || h <= 0) return
    logSession(skill.id, h, note, date)
    if (!muted) playCoin()
    spawnPopup(`+${h}h XP`)
    setHours('')
    setNote('')
    setDate(todayISO())
  }

  const handleQuickAdd = (amount: number) => {
    const current = parseFloat(hours) || 0
    setHours(String(Math.round((current + amount) * 100) / 100))
  }

  const handleDelete = () => {
    deleteSkill(skill.id)
    navigate('/')
  }

  const openEditSession = (s: Session) => {
    setEditingSession(s)
    setEditHours(String(s.hoursSpent))
    setEditDate(s.date)
    setEditNote(s.note ?? '')
  }

  const handleSaveEdit = () => {
    if (!editingSession) return
    const h = parseFloat(editHours)
    if (!h || h <= 0) return
    updateSession(skill.id, editingSession.id, { date: editDate, hoursSpent: h, note: editNote })
    setEditingSession(null)
  }

  const handleDeleteSession = () => {
    if (!deletingSessionId) return
    deleteSession(skill.id, deletingSessionId)
    setDeletingSessionId(null)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-8">
      <XPPopup popups={popups} />

      <button
        onClick={() => navigate('/')}
        className="font-pixel text-[10px] text-paper/50 hover:text-cyan self-start"
      >
        ← BACK
      </button>

      {/* Header */}
      <PixelPanel glow="cyan" className="flex flex-col md:flex-row items-center gap-6">
        <TierBadge tier={progress.tier} size={96} accent={seedColor(skill.id)} />
        <div className="flex-1 text-center md:text-left">
          <h1 className="font-pixel text-lg md:text-xl text-paper flex items-center justify-center md:justify-start gap-2">
            <span>{skill.icon}</span>
            <span>{skill.name}</span>
          </h1>
          <p className="font-pixel text-sm mt-2" style={{ color: progress.tier.color }}>
            {progress.tier.name}
          </p>
          <div className="flex items-center justify-center md:justify-start gap-4 mt-3">
            <StreakFlame streak={skill.dailyStreak} size="md" />
            <span className="font-body text-lg text-paper/60">Best: {skill.longestStreak} days</span>
          </div>
        </div>
        <div className="text-center md:text-right">
          <p className="font-pixel text-2xl text-amber">{skill.totalHoursLogged.toLocaleString()}</p>
          <p className="font-body text-lg text-paper/60">hours logged</p>
        </div>
      </PixelPanel>

      {/* Progress bars */}
      <PixelPanel className="flex flex-col gap-5">
        <div>
          <PixelBar
            percent={progress.percent}
            color={progress.tier.color}
            segments={24}
            label={
              progress.next
                ? `XP to ${progress.next.name}: ${Math.max(0, progress.next.minHours - skill.totalHoursLogged).toFixed(1)}h remaining`
                : 'MAX TIER REACHED'
            }
          />
        </div>
        <div>
          <PixelBar
            percent={overallPercent}
            color="#ffd23f"
            segments={24}
            label={`Overall progress to ${skill.targetHours.toLocaleString()}h mastery`}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-center">
            <div>
              <p className="font-pixel text-sm text-cyan">{overallPercent.toFixed(1)}%</p>
              <p className="font-body text-base text-paper/60">Complete</p>
            </div>
            <div>
              <p className="font-pixel text-sm text-magenta">{hoursRemaining.toFixed(0)}h</p>
              <p className="font-body text-base text-paper/60">Remaining</p>
            </div>
            <div>
              <p className="font-pixel text-sm text-lime">
                {yearsRemaining === null ? '—' : yearsRemaining <= 0 ? '0' : yearsRemaining.toFixed(1)}
              </p>
              <p className="font-body text-base text-paper/60">Est. Years to Mastery</p>
            </div>
          </div>
          <p className="font-body text-sm text-paper/40 text-center mt-1">
            based on avg. {avgHoursPerWeek.toFixed(1)}h/week pace
          </p>
        </div>
      </PixelPanel>

      {/* Log session form */}
      <PixelPanel glow="magenta" ref={formRef}>
        <h2 className="font-pixel text-sm text-magenta mb-4">LOG SESSION</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-pixel text-[10px] text-paper/70 block mb-2">HOURS SPENT</label>
            <input
              type="number"
              min={0}
              step={0.25}
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="0.0"
              className="w-full bg-ink border-2 border-line px-3 py-2 font-body text-xl text-paper focus:outline-none focus:border-magenta"
            />
            <div className="flex gap-2 mt-2 flex-wrap">
              {QUICK_ADDS.map((a) => (
                <button
                  key={a}
                  onClick={() => handleQuickAdd(a)}
                  className="font-pixel text-[10px] px-2 py-1.5 border-2 border-line bg-panel2 text-cyan hover:border-cyan"
                >
                  +{a}h
                </button>
              ))}
              <button
                onClick={() => setHours('')}
                className="font-pixel text-[10px] px-2 py-1.5 border-2 border-line bg-panel2 text-paper/50 hover:border-blood hover:text-blood"
              >
                CLEAR
              </button>
            </div>
          </div>
          <div>
            <label className="font-pixel text-[10px] text-paper/70 block mb-2">DATE</label>
            <input
              type="date"
              value={date}
              max={todayISO()}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-ink border-2 border-line px-3 py-2 font-body text-xl text-paper focus:outline-none focus:border-magenta"
            />
          </div>
          <div className="md:col-span-2">
            <label className="font-pixel text-[10px] text-paper/70 block mb-2">NOTE (OPTIONAL)</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What did you work on?"
              maxLength={140}
              className="w-full bg-ink border-2 border-line px-3 py-2 font-body text-xl text-paper focus:outline-none focus:border-magenta"
            />
          </div>
        </div>
        <div className="mt-4">
          <PixelButton variant="lime" onClick={handleLog} disabled={!parseFloat(hours)}>
            ⚡ LOG HOURS
          </PixelButton>
        </div>
      </PixelPanel>

      {/* Heatmap */}
      <PixelPanel>
        <h2 className="font-pixel text-sm text-lime mb-4">ACTIVITY</h2>
        <CalendarHeatmap sessions={skill.sessions} />
      </PixelPanel>

      {/* Session history */}
      <PixelPanel>
        <h2 className="font-pixel text-sm text-cyan mb-4">SESSION HISTORY</h2>
        {skill.sessions.length === 0 ? (
          <p className="font-body text-lg text-paper/50">No sessions logged yet.</p>
        ) : (
          <div className="max-h-80 overflow-y-auto flex flex-col gap-2 pr-1">
            {skill.sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 border-2 border-line bg-panel2 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="font-body text-lg text-paper">{formatDateDisplay(s.date)}</p>
                  {s.note && <p className="font-body text-base text-paper/50 truncate">{s.note}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <p className="font-pixel text-xs text-amber">+{s.hoursSpent}h</p>
                  <button
                    onClick={() => openEditSession(s)}
                    title="Edit session"
                    className="font-pixel text-[9px] px-2 py-1.5 border-2 border-line bg-panel text-cyan/80 hover:border-cyan hover:text-cyan"
                  >
                    EDIT
                  </button>
                  <button
                    onClick={() => setDeletingSessionId(s.id)}
                    title="Delete session"
                    className="font-pixel text-[9px] px-2 py-1.5 border-2 border-line bg-panel text-paper/40 hover:border-blood hover:text-blood"
                  >
                    DEL
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </PixelPanel>

      {/* Danger zone */}
      <div className="flex justify-end">
        <PixelButton variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
          DELETE SKILL
        </PixelButton>
      </div>

      <PixelModal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="DELETE SKILL?">
        <p className="font-body text-xl text-paper/80 mb-6">
          This will permanently delete "{skill.name}" and all {skill.sessions.length} logged sessions. This cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <PixelButton variant="default" onClick={() => setConfirmDelete(false)}>
            CANCEL
          </PixelButton>
          <PixelButton variant="danger" onClick={handleDelete}>
            DELETE FOREVER
          </PixelButton>
        </div>
      </PixelModal>

      <PixelModal open={!!editingSession} onClose={() => setEditingSession(null)} title="EDIT SESSION">
        <div className="flex flex-col gap-4">
          <div>
            <label className="font-pixel text-[10px] text-paper/70 block mb-2">HOURS SPENT</label>
            <input
              type="number"
              min={0}
              step={0.25}
              value={editHours}
              onChange={(e) => setEditHours(e.target.value)}
              className="w-full bg-ink border-2 border-line px-3 py-2 font-body text-xl text-paper focus:outline-none focus:border-cyan"
            />
          </div>
          <div>
            <label className="font-pixel text-[10px] text-paper/70 block mb-2">DATE</label>
            <input
              type="date"
              value={editDate}
              max={todayISO()}
              onChange={(e) => setEditDate(e.target.value)}
              className="w-full bg-ink border-2 border-line px-3 py-2 font-body text-xl text-paper focus:outline-none focus:border-cyan"
            />
          </div>
          <div>
            <label className="font-pixel text-[10px] text-paper/70 block mb-2">NOTE (OPTIONAL)</label>
            <input
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              maxLength={140}
              className="w-full bg-ink border-2 border-line px-3 py-2 font-body text-xl text-paper focus:outline-none focus:border-cyan"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <PixelButton variant="default" onClick={() => setEditingSession(null)}>
              CANCEL
            </PixelButton>
            <PixelButton variant="cyan" onClick={handleSaveEdit} disabled={!parseFloat(editHours)}>
              SAVE
            </PixelButton>
          </div>
        </div>
      </PixelModal>

      <PixelModal open={!!deletingSessionId} onClose={() => setDeletingSessionId(null)} title="DELETE SESSION?">
        <p className="font-body text-xl text-paper/80 mb-6">
          This will permanently remove this logged session and recalculate your totals and streaks. This cannot be
          undone.
        </p>
        <div className="flex gap-3 justify-end">
          <PixelButton variant="default" onClick={() => setDeletingSessionId(null)}>
            CANCEL
          </PixelButton>
          <PixelButton variant="danger" onClick={handleDeleteSession}>
            DELETE
          </PixelButton>
        </div>
      </PixelModal>
    </div>
  )
}
