import { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Users, ShoppingBag, Image, LogOut, Menu, X } from 'lucide-react'
import { auth, api } from './api'
import { Dashboard } from './pages/Dashboard'
import { Modules } from './pages/Modules'
import { UsersPage } from './pages/Users'
import { ShopPage } from './pages/Shop'
import { MascotsPage } from './pages/Mascots'

// ── Toast ────────────────────────────────────────────────────────────────────
interface ToastMsg { id: number; msg: string; type: 'ok' | 'err' }
interface ToastCtx { toast: (msg: string, type?: 'ok' | 'err') => void }
const ToastContext = createContext<ToastCtx>({ toast: () => {} })
export function useToast() { return useContext(ToastContext) }

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMsg[]>([])
  function toast(msg: string, type: 'ok' | 'err' = 'ok') {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2800)
  }
  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`fade-in px-4 py-3 rounded-xl text-sm font-semibold shadow-lg border ${t.type === 'ok' ? 'bg-ink2 border-brand/40 text-sky' : 'bg-ink2 border-rose/40 text-rose'}`}>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// ── Login ────────────────────────────────────────────────────────────────────
function Login({ onLogin }: { onLogin: () => void }) {
  const [pwd, setPwd] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setErr('')
    try {
      const { token } = await api.login(pwd)
      auth.set(token)
      onLogin()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Ката')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'radial-gradient(800px at 50% -10%, rgba(11,144,224,.12), transparent 70%), #0B0F1A' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand/15 border border-brand/30 mb-4">
            <LayoutDashboard size={28} className="text-brand" />
          </div>
          <div className="font-display font-bold text-2xl">FinLingvo</div>
          <div className="text-muted text-sm mt-1">Админ панел</div>
        </div>
        <div className="card">
          {err && <div className="mb-4 px-3 py-2.5 rounded-xl bg-rose/10 border border-rose/30 text-rose text-sm">{err}</div>}
          <form onSubmit={submit} className="flex flex-col gap-3">
            <div>
              <label className="label">Сырсөз</label>
              <input className="input" type="password" value={pwd} onChange={e => setPwd(e.target.value)} autoFocus />
            </div>
            <button className="btn-primary w-full justify-center py-2.5 mt-1" disabled={loading}>
              {loading ? <span className="spin" /> : 'Кирүү'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ── Sidebar Nav ──────────────────────────────────────────────────────────────
const NAV = [
  { to: 'dashboard',  icon: LayoutDashboard, label: 'Башкы бет' },
  { to: 'modules',    icon: BookOpen,         label: 'Контент'    },
  { to: 'users',      icon: Users,            label: 'Колдонуучулар' },
  { to: 'shop',       icon: ShoppingBag,      label: 'Дүкөн'     },
  { to: 'mascots',    icon: Image,            label: 'Сүрөттөр'  },
]

function Sidebar({ onLogout, mobile, onClose }: { onLogout: () => void; mobile?: boolean; onClose?: () => void }) {
  return (
    <div className={`flex flex-col h-full bg-ink2 border-r border-line ${mobile ? 'w-72' : 'w-60'}`}>
      <div className="px-5 py-5 flex items-center justify-between border-b border-line">
        <div>
          <div className="font-display font-bold text-lg text-brand">FinLingvo</div>
          <div className="text-xs text-muted">Админ панел</div>
        </div>
        {mobile && onClose && (
          <button onClick={onClose} className="text-muted hover:text-text"><X size={20} /></button>
        )}
      </div>
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={onClose}
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-brand text-white shadow-[0_0_24px_rgba(11,144,224,.3)]' : 'text-muted hover:text-text hover:bg-line/50'}`}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-line">
        <button onClick={onLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-muted hover:text-rose hover:bg-rose/10 transition-all">
          <LogOut size={18} />
          Чыгуу
        </button>
      </div>
    </div>
  )
}

// ── Layout ───────────────────────────────────────────────────────────────────
function Layout({ onLogout }: { onLogout: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar onLogout={onLogout} />
      </div>

      {/* Mobile sidebar overlay */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <div className="relative z-10">
            <Sidebar onLogout={onLogout} mobile onClose={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-line bg-ink2/80 backdrop-blur shrink-0">
          <button onClick={() => setMenuOpen(true)} className="text-muted hover:text-text">
            <Menu size={22} />
          </button>
          <div className="font-display font-bold text-brand">FinLingvo Admin</div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="modules"   element={<Modules />} />
            <Route path="users"     element={<UsersPage />} />
            <Route path="shop"      element={<ShopPage />} />
            <Route path="mascots"   element={<MascotsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

// ── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [authed, setAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    if (!auth.token) { setAuthed(false); return }
    api.me().then(() => setAuthed(true)).catch(() => { auth.clear(); setAuthed(false) })
  }, [])

  if (authed === null) return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="spin text-brand" style={{ width: 32, height: 32, borderWidth: 3 }} />
    </div>
  )

  if (!authed) return (
    <ToastProvider>
      <Login onLogin={() => setAuthed(true)} />
    </ToastProvider>
  )

  return (
    <ToastProvider>
      <BrowserRouter basename="/admin">
        <Layout onLogout={() => { auth.clear(); setAuthed(false) }} />
      </BrowserRouter>
    </ToastProvider>
  )
}
