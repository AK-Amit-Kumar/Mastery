import { NavLink } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useAuthStore } from '../store/useAuthStore'

const links = [
  { to: '/', label: 'HOME' },
  { to: '/leaderboard', label: 'RANKS' },
  { to: '/achievements', label: 'AWARDS' },
  { to: '/stats', label: 'STATS' },
  { to: '/settings', label: 'CONFIG' },
]

export default function NavBar() {
  const muted = useStore((s) => s.muted)
  const toggleMute = useStore((s) => s.toggleMute)
  const profile = useAuthStore((s) => s.profile)
  const signOut = useAuthStore((s) => s.signOut)

  return (
    <header className="border-b-4 border-line bg-panel sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
        <NavLink to="/" className="font-pixel text-sm text-cyan tracking-tight">
          MASTERY<span className="text-magenta">_</span>
        </NavLink>
        <nav className="flex items-center gap-2 flex-wrap">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `font-pixel text-[10px] px-3 py-2 border-2 transition-colors ${
                  isActive
                    ? 'bg-cyan text-ink border-ink'
                    : 'bg-panel2 text-paper/70 border-line hover:text-cyan hover:border-cyan'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <button
            onClick={toggleMute}
            className="font-pixel text-[10px] px-3 py-2 border-2 bg-panel2 border-line text-paper/70 hover:text-amber hover:border-amber"
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          {profile && (
            <div className="flex items-center gap-2 pl-2 ml-1 border-l-2 border-line">
              <span className="font-body text-lg text-lime truncate max-w-[8rem]" title={profile.username}>
                {profile.username}
              </span>
              <button
                onClick={signOut}
                className="font-pixel text-[9px] px-2 py-2 border-2 bg-panel2 border-line text-paper/50 hover:text-blood hover:border-blood"
              >
                LOG OUT
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
