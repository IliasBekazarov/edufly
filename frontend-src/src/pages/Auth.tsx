import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mascot } from '../components/Mascot'

interface AuthProps {
  onLogin: (email: string, password: string) => Promise<void>
  onSignup: (name: string, email: string, password: string) => Promise<void>
}

export function Auth({ onLogin, onSignup }: AuthProps) {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function set(k: keyof typeof form, v: string) {
    setForm(f => ({ ...f, [k]: v }))
    setError(null)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (mode === 'login') {
        await onLogin(form.email, form.password)
      } else {
        await onSignup(form.name, form.email, form.password)
      }
      navigate('/learn')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ката чыкты')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm animate-scale-in">

        {/* ── Logo ──────────────────────────────────────── */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div
              className="w-20 h-20 rounded-[22px] flex items-center justify-center animate-floaty"
              style={{
                background: 'linear-gradient(135deg, #5B6EF0, #A78BFA)',
                boxShadow: '0 8px 40px rgba(91,110,240,.55), 0 0 0 1px rgba(255,255,255,0.1)',
              }}
            >
              <Mascot size={50} />
            </div>
            <div
              className="absolute inset-0 rounded-[22px] animate-glow-pulse pointer-events-none"
              style={{ boxShadow: '0 0 50px rgba(91,110,240,.4)', zIndex: -1 }}
            />
          </div>
          <h1
            className="font-display font-bold text-3xl bg-clip-text text-transparent mb-1"
            style={{ backgroundImage: 'linear-gradient(135deg, #818CF8, #C4B5FD)' }}
          >
            FinLingvo
          </h1>
          <p className="text-muted text-sm">Кыргызча финансылык сабатуулук</p>
        </div>

        {/* ── Card ──────────────────────────────────────── */}
        <div className="glass-elevated p-6">

          {/* Tabs */}
          <div
            className="flex rounded-xl p-1 mb-5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {(['login', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null) }}
                className="flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-250"
                style={mode === m ? {
                  background: 'linear-gradient(135deg, #5B6EF0, #8B6BE8)',
                  color: '#fff',
                  boxShadow: '0 2px 10px rgba(91,110,240,.45)',
                } : { color: '#5E7194' }}
              >
                {m === 'login' ? 'Кирүү' : 'Катталуу'}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div
              className="mb-4 p-3.5 rounded-xl text-sm flex items-center gap-2.5 animate-slide-up"
              style={{
                background: 'rgba(248,113,113,0.1)',
                border: '1px solid rgba(248,113,113,0.3)',
                color: '#FCA5A5',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={submit} className="space-y-3">
            {mode === 'signup' && (
              <input
                className="input"
                placeholder="Колдонуучу аты"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                required
                minLength={2}
              />
            )}
            <input
              className="input"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              required
            />
            <input
              className="input"
              type="password"
              placeholder="Сырсөз"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              required
              minLength={6}
            />
            <button type="submit" disabled={loading} className="btn3d full lg mt-2">
              {loading ? <span className="spin" /> : mode === 'login' ? 'Кирүү' : 'Катталуу'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted mt-6">
          Кирүү менен колдонуу шарттарына макулсуз
        </p>
      </div>
    </div>
  )
}
