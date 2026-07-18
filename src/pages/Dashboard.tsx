import { useState } from 'react'
import { useStore } from '../store/useStore'
import SkillCard from '../components/SkillCard'
import PixelPanel from '../components/PixelPanel'
import PixelButton from '../components/PixelButton'
import AddSkillModal from '../components/AddSkillModal'

export default function Dashboard() {
  const skills = useStore((s) => s.skills)
  const [modalOpen, setModalOpen] = useState(false)

  const totalHours = skills.reduce((sum, s) => sum + s.totalHoursLogged, 0)
  const longestStreak = skills.reduce((max, s) => Math.max(max, s.longestStreak), 0)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8">
      <div>
        <h1 className="font-pixel text-2xl md:text-3xl text-cyan mb-1">MASTERY</h1>
        <p className="font-body text-xl text-paper/60">10,000 hours to greatness. Track any skill, any grind.</p>
      </div>

      <PixelPanel glow="cyan" className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div>
          <p className="font-pixel text-lg text-amber">{Math.round(totalHours).toLocaleString()}</p>
          <p className="font-body text-base text-paper/60 mt-1">Total Hours Logged</p>
        </div>
        <div>
          <p className="font-pixel text-lg text-lime">{skills.length}</p>
          <p className="font-body text-base text-paper/60 mt-1">Skills Tracked</p>
        </div>
        <div>
          <p className="font-pixel text-lg text-magenta">{longestStreak}</p>
          <p className="font-body text-base text-paper/60 mt-1">Longest Active Streak</p>
        </div>
      </PixelPanel>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-pixel text-sm text-paper">YOUR SKILLS</h2>
        <PixelButton variant="magenta" onClick={() => setModalOpen(true)}>
          + ADD NEW SKILL
        </PixelButton>
      </div>

      {skills.length === 0 ? (
        <PixelPanel className="text-center py-12">
          <p className="font-body text-2xl text-paper/60 mb-4">No skills yet. Start your journey!</p>
          <PixelButton variant="lime" onClick={() => setModalOpen(true)}>
            + ADD YOUR FIRST SKILL
          </PixelButton>
        </PixelPanel>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      )}

      <AddSkillModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
