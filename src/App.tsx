import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import { useAuthStore } from './store/useAuthStore'
import { isSupabaseConfigured } from './lib/supabase'
import { todayISO } from './utils/date'
import { getNotificationPermission, showReminderNotification } from './utils/notifications'
import { getThemeOption } from './utils/themes'
import NavBar from './components/NavBar'
import LevelUpModal from './components/LevelUpModal'
import MasterCelebration from './components/MasterCelebration'
import LeaderboardSync from './components/LeaderboardSync'
import Dashboard from './pages/Dashboard'
import SkillDetail from './pages/SkillDetail'
import Achievements from './pages/Achievements'
import Stats from './pages/Stats'
import Settings from './pages/Settings'
import Leaderboard from './pages/Leaderboard'
import Login from './pages/Login'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)

  if (!isSupabaseConfigured) return <>{children}</>
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="font-pixel text-sm text-cyan animate-blink">LOADING...</p>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const seedIfEmpty = useStore((s) => s.seedIfEmpty)
  const initializeAuth = useAuthStore((s) => s.initialize)
  const theme = useStore((s) => s.theme)

  useEffect(() => {
    seedIfEmpty()
    initializeAuth()
  }, [seedIfEmpty, initializeAuth])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    const meta = document.querySelector('meta[name="theme-color"]')
    meta?.setAttribute('content', getThemeOption(theme).swatches[0])
  }, [theme])

  useEffect(() => {
    const checkReminder = () => {
      const state = useStore.getState()
      if (!state.notificationsEnabled) return
      if (getNotificationPermission() !== 'granted') return
      if (state.skills.length === 0) return

      const today = todayISO()
      if (state.lastReminderShownDate === today) return

      const now = new Date()
      const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      if (nowTime < state.reminderTime) return

      const unlogged = state.skills.filter((s) => s.lastLogDate !== today).map((s) => s.name)
      if (unlogged.length === 0) return

      showReminderNotification(unlogged)
      state.markReminderShown(today)
    }

    checkReminder()
    const interval = setInterval(checkReminder, 60_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/skill/:id"
              element={
                <RequireAuth>
                  <SkillDetail />
                </RequireAuth>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <RequireAuth>
                  <Leaderboard />
                </RequireAuth>
              }
            />
            <Route
              path="/achievements"
              element={
                <RequireAuth>
                  <Achievements />
                </RequireAuth>
              }
            />
            <Route
              path="/stats"
              element={
                <RequireAuth>
                  <Stats />
                </RequireAuth>
              }
            />
            <Route
              path="/settings"
              element={
                <RequireAuth>
                  <Settings />
                </RequireAuth>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="border-t-2 border-line bg-panel py-4 text-center">
          <p className="font-body text-base text-paper/40">
            MASTERY — 10,000 hours to greatness. Skill data stored locally in your browser.
          </p>
        </footer>
      </div>
      <div className="crt-overlay" />
      <LevelUpModal />
      <MasterCelebration />
      <LeaderboardSync />
    </BrowserRouter>
  )
}
