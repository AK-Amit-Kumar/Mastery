import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useAuthStore } from '../store/useAuthStore'
import { useOnlineStatus } from '../utils/useOnlineStatus'

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
  const [menuOpen, setMenuOpen] = useState(false)
  const isOnline = useOnlineStatus()

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `font-pixel text-[10px] px-3 py-2 border-2 transition-colors ${
      isActive
        ? 'bg-cyan text-ink border-ink'
        : 'bg-panel2 text-paper/70 border-line hover:text-cyan hover:border-cyan'
    }`

  return (
    <header className="border-b-4 border-line bg-panel sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <NavLink to="/" className="font-pixel text-sm text-cyan tracking-tight shrink-0">
            MASTERY<span className="text-magenta">_</span>
          </NavLink>
          {!isOnline && (
            <span
              className="font-pixel text-[9px] px-2 py-1 border-2 bg-panel2 border-amber text-amber"
              title="No network connection — your local skill data still works fine."
            >
              OFFLINE
            </span>
          )}
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2 flex-wrap">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'} className={linkClass}>
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

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleMute}
            className="font-pixel text-[10px] px-2.5 py-2 border-2 bg-panel2 border-line text-paper/70 hover:text-amber hover:border-amber"
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          {profile && (
            <>
              <span
                className="font-body text-base text-lime truncate max-w-[5rem]"
                title={profile.username}
              >
                {profile.username}
              </span>
              <button
                onClick={signOut}
                className="font-pixel text-[9px] px-2 py-2 border-2 bg-panel2 border-line text-paper/50 hover:text-blood hover:border-blood"
              >
                LOG OUT
              </button>
            </>
          )}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="flex flex-col justify-center items-center gap-[5px] w-9 h-9 border-2 bg-panel2 border-line hover:border-cyan shrink-0"
          >
            <span
              className={`block h-[2px] w-5 bg-paper transition-transform ${
                menuOpen ? 'translate-y-[7px] rotate-45' : ''
              }`}
            />
            <span
              className={`block h-[2px] w-5 bg-paper transition-opacity ${menuOpen ? 'opacity-0' : ''}`}
            />
            <span
              className={`block h-[2px] w-5 bg-paper transition-transform ${
                menuOpen ? '-translate-y-[7px] -rotate-45' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <nav className="md:hidden absolute top-full inset-x-0 border-t-2 border-line bg-panel px-4 py-3 flex flex-col gap-2 shadow-pixel">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setMenuOpen(false)}
              className={linkClass}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
