import { useStore } from '../store/useStore'
import { ACHIEVEMENTS } from '../utils/achievements'
import PixelPanel from '../components/PixelPanel'
import { formatDateDisplay } from '../utils/date'

export default function Achievements() {
  const unlocked = useStore((s) => s.unlockedAchievements)
  const unlockedMap = new Map(unlocked.map((u) => [u.id, u]))

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div>
        <h1 className="font-pixel text-2xl text-amber mb-1">AWARDS</h1>
        <p className="font-body text-xl text-paper/60">
          {unlocked.length} / {ACHIEVEMENTS.length} unlocked across all skills
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACHIEVEMENTS.map((a) => {
          const isUnlocked = unlockedMap.has(a.id)
          const unlockedAt = unlockedMap.get(a.id)?.unlockedAt

          return (
            <PixelPanel
              key={a.id}
              glow={isUnlocked ? 'amber' : 'none'}
              className={`flex flex-col items-center text-center gap-2 ${!isUnlocked ? 'opacity-50' : ''}`}
            >
              <div
                className={`w-16 h-16 flex items-center justify-center border-2 border-line text-3xl ${
                  isUnlocked ? 'bg-panel2' : 'bg-ink grayscale'
                }`}
                style={{ filter: isUnlocked ? undefined : 'grayscale(1) brightness(0.5)' }}
              >
                {a.icon}
              </div>
              <p className="font-pixel text-[11px] text-paper">{a.name}</p>
              <p className="font-body text-base text-paper/60">{a.description}</p>
              {isUnlocked && unlockedAt && (
                <p className="font-body text-sm text-lime mt-1">Unlocked {formatDateDisplay(unlockedAt.slice(0, 10))}</p>
              )}
              {!isUnlocked && <p className="font-body text-sm text-paper/30 mt-1">LOCKED</p>}
            </PixelPanel>
          )
        })}
      </div>
    </div>
  )
}
