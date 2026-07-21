import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { isSupabaseConfigured } from '../lib/supabase'
import PixelPanel from '../components/PixelPanel'
import PixelButton from '../components/PixelButton'

export default function Login() {
  const user = useAuthStore((s) => s.user)
  const authError = useAuthStore((s) => s.authError)
  const infoMessage = useAuthStore((s) => s.infoMessage)
  const signInWithEmail = useAuthStore((s) => s.signInWithEmail)
  const signUpWithEmail = useAuthStore((s) => s.signUpWithEmail)
  const clearMessages = useAuthStore((s) => s.clearMessages)

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  if (user) return <Navigate to="/" replace />

  const switchMode = (next: 'signin' | 'signup') => {
    setMode(next)
    clearMessages()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    if (mode === 'signup') {
      await signUpWithEmail(email, password, username)
    } else {
      await signInWithEmail(email, password)
    }
    setSubmitting(false)
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="font-pixel text-2xl text-cyan mb-2">MASTERY</h1>
        <p className="font-body text-xl text-paper/60">10,000 hours to greatness.</p>
      </div>

      {!isSupabaseConfigured && (
        <PixelPanel className="mb-4" style={{ borderColor: 'var(--color-amber)' }}>
          <p className="font-body text-lg text-amber">
            Supabase isn't configured yet. Copy <span className="text-paper">.env.example</span> to{' '}
            <span className="text-paper">.env.local</span>, fill in your project URL + anon key, and restart the
            dev server to enable login.
          </p>
        </PixelPanel>
      )}

      <PixelPanel glow="cyan">
        <div className="flex mb-5 border-2 border-line">
          <button
            onClick={() => switchMode('signin')}
            className={`flex-1 font-pixel text-[10px] py-3 ${mode === 'signin' ? 'bg-cyan text-ink' : 'bg-panel2 text-paper/60'}`}
          >
            SIGN IN
          </button>
          <button
            onClick={() => switchMode('signup')}
            className={`flex-1 font-pixel text-[10px] py-3 ${mode === 'signup' ? 'bg-cyan text-ink' : 'bg-panel2 text-paper/60'}`}
          >
            SIGN UP
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'signup' && (
            <div>
              <label className="font-pixel text-[10px] text-paper/70 block mb-2">USERNAME</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="RetroGrinder"
                required
                minLength={2}
                maxLength={24}
                className="w-full bg-ink border-2 border-line px-3 py-2 font-body text-xl text-paper focus:outline-none focus:border-cyan"
              />
            </div>
          )}
          <div>
            <label className="font-pixel text-[10px] text-paper/70 block mb-2">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-ink border-2 border-line px-3 py-2 font-body text-xl text-paper focus:outline-none focus:border-cyan"
            />
          </div>
          <div>
            <label className="font-pixel text-[10px] text-paper/70 block mb-2">PASSWORD</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-ink border-2 border-line pl-3 pr-16 py-2 font-body text-xl text-paper focus:outline-none focus:border-cyan"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-1 top-1/2 -translate-y-1/2 font-pixel text-[9px] px-2 py-2 border-2 border-line bg-panel2 text-paper/60 hover:text-cyan hover:border-cyan"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

          {authError && <p className="font-body text-lg text-blood">{authError}</p>}
          {infoMessage && <p className="font-body text-lg text-lime">{infoMessage}</p>}

          <PixelButton
            type="submit"
            variant="lime"
            disabled={submitting || !isSupabaseConfigured}
            className="w-full"
          >
            {mode === 'signup' ? 'CREATE ACCOUNT' : 'SIGN IN'}
          </PixelButton>
        </form>
      </PixelPanel>
    </div>
  )
}
