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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Mascot size={72} className="animate-floaty mb-3" />
          <div className="font-display font-bold text-3xl bg-clip-text text-transparent bg-grad-brand">
            FinLingvo
          </div>
          <div className="text-muted text-sm mt-1">Кыргызча финансы</div>
        </div>

        <div className="glass p-6">
          <div className="flex rounded-xl overflow-hidden border border-line mb-5">
            {(['login', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null) }}
                className={`flex-1 py-2 text-sm font-bold transition-all ${
                  mode === m ? 'bg-brand text-white' : 'text-muted'
                }`}
              >
                {m === 'login' ? 'Кирүү' : 'Катталуу'}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose/15 border border-rose/40 text-rose text-sm">
              {error}
            </div>
          )}

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
            <button type="submit" disabled={loading} className="btn3d full lg mt-1">
              {loading ? <span className="spin" /> : mode === 'login' ? 'Кирүү' : 'Катталуу'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
