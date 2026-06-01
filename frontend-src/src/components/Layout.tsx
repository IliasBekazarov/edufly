import { NavLink, Outlet } from 'react-router-dom'
import { House, Trophy, ShoppingBag, User, Settings, Flame, Gem, Heart } from 'lucide-react'
import { Mascot } from './Mascot'
import type { User as UserType } from '../types'

interface LayoutProps {
  user: UserType | null
}

const NAV = [
  { to: '/learn',       icon: House,       label: 'Үйрөнүү' },
  { to: '/leaderboard', icon: Trophy,       label: 'Лига' },
  { to: '/shop',        icon: ShoppingBag,  label: 'Дүкөн' },
  { to: '/profile',     icon: User,         label: 'Профиль' },
  { to: '/settings',    icon: Settings,     label: 'Орнотуу' },
]

function navClass({ isActive }: { isActive: boolean }) {
  return isActive
    ? 'group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all bg-[#0B90E0] text-white shadow-[0_0_40px_rgba(11,144,224,.35)]'
    : 'group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all text-muted hover:text-text hover:bg-line/40'
}

function mobileNavClass({ isActive }: { isActive: boolean }) {
  return `flex-1 flex flex-col items-center gap-0.5 py-2 text-[11px] font-bold transition-all ${isActive ? 'text-[#0B90E0]' : 'text-muted'}`
}

export function Layout({ user }: LayoutProps) {
  const s = user?.state
  const hearts = s?.hearts ?? 5

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[260px] shrink-0 sticky top-0 h-screen flex-col border-r border-line bg-ink2/60 backdrop-blur-xl">
        <div className="px-5 py-5 flex items-center gap-3 border-b border-line">
          <Mascot size={40} />
          <div>
            <div className="font-display font-bold text-lg leading-none bg-clip-text text-transparent bg-grad-brand">
              FinLingvo
            </div>
            <div className="text-xs text-muted mt-1">Кыргызча финансы</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={navClass}>
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="m-3 p-3 rounded-2xl border border-line bg-ink3/60 text-xs text-muted">
          <div className="font-bold text-text mb-1">Кеңеш</div>
          Жашоону жоготпой машыгуу үчүн «Кайталоо» баскычын колдон.
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-ink/70 border-b border-line">
          <div className="px-4 lg:px-8 py-3 flex items-center gap-3 max-w-[1100px] mx-auto pt-safe">
            <div className="lg:hidden flex items-center gap-2 mr-auto">
              <Mascot size={28} />
              <span className="font-display font-bold text-base bg-clip-text text-transparent bg-grad-brand">
                FinLingvo
              </span>
            </div>
            <div className="hidden lg:block flex-1" />
            <div className="flex items-center gap-2">
              <span className="stat-pill" style={{ color: '#FF9600' }}>
                <Flame size={16} fill="#FF9600" />
                {s?.streak ?? 0}
              </span>
              <span className="stat-pill" style={{ color: '#1CB0F6' }}>
                <Gem size={16} fill="#1CB0F6" />
                {s?.gems ?? 0}
              </span>
              <div
                className="stat-pill"
                title={hearts >= 5 ? 'Толук' : `${hearts}/5 жашоо`}
                style={{ color: '#FF4B4B' }}
              >
                <Heart size={16} fill="#FF4B4B" />
                <span>{hearts}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 pb-28 lg:pb-10">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-ink2/85 backdrop-blur-xl border-t border-line pb-safe">
          <div className="flex">
            {NAV.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} className={mobileNavClass}>
                <Icon size={22} />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}
