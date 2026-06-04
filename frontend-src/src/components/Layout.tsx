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

export function Layout({ user }: LayoutProps) {
  const s = user?.state
  const hearts = s?.hearts ?? 5

  return (
    <div className="min-h-screen lg:flex">

      {/* ── Desktop sidebar ──────────────────────────────── */}
      <aside
        className="hidden lg:flex w-[260px] shrink-0 sticky top-0 h-screen flex-col"
        style={{
          background: 'rgba(5,8,20,0.6)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo */}
        <div
          className="px-5 py-5 flex items-center gap-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #5B6EF0, #A78BFA)',
              boxShadow: '0 4px 16px rgba(91,110,240,.45)',
            }}
          >
            <Mascot size={26} />
          </div>
          <div>
            <div
              className="font-display font-bold text-[17px] leading-tight bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #818CF8, #C4B5FD)' }}
            >
              FinLingvo
            </div>
            <div className="text-[11px] text-muted mt-0.5">Кыргызча финансы</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className="block rounded-xl overflow-hidden">
              {({ isActive }) => (
                <div
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-all duration-200 relative"
                  style={isActive ? {
                    background: 'linear-gradient(135deg, rgba(91,110,240,.22), rgba(167,139,250,.16))',
                    border: '1px solid rgba(91,110,240,.28)',
                    borderRadius: '12px',
                    color: '#EEF2FF',
                    boxShadow: '0 4px 20px rgba(91,110,240,.15)',
                  } : {
                    color: '#5E7194',
                  }}
                >
                  <Icon size={18} className="shrink-0" />
                  <span>{label}</span>
                  {isActive && (
                    <div
                      className="absolute right-3 w-1.5 h-1.5 rounded-full"
                      style={{ background: 'linear-gradient(135deg, #5B6EF0, #A78BFA)' }}
                    />
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Tip card */}
        <div
          className="m-3 p-3.5 rounded-2xl text-xs text-muted"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="font-bold text-text text-xs mb-1">💡 Кеңеш</div>
          Жашоону жоготпой машыгуу үчүн «Кайталоо» баскычын колдон.
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">

        {/* ── Header ───────────────────────────────────────── */}
        <header
          className="sticky top-0 z-30 pt-safe"
          style={{
            background: 'rgba(5,8,20,0.72)',
            backdropFilter: 'blur(28px) saturate(180%)',
            WebkitBackdropFilter: 'blur(28px) saturate(180%)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="px-4 lg:px-8 py-3 flex items-center gap-3 max-w-[1100px] mx-auto">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2.5 mr-auto">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #5B6EF0, #A78BFA)' }}
              >
                <Mascot size={18} />
              </div>
              <span
                className="font-display font-bold text-[15px] bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #818CF8, #C4B5FD)' }}
              >
                FinLingvo
              </span>
            </div>
            <div className="hidden lg:block flex-1" />

            {/* Stats */}
            <div className="flex items-center gap-2">
              <span className="stat-pill" style={{ color: '#FB923C' }}>
                <Flame size={14} fill="#FB923C" />
                {s?.streak ?? 0}
              </span>
              <span className="stat-pill" style={{ color: '#38BDF8' }}>
                <Gem size={14} fill="#38BDF8" />
                {s?.gems ?? 0}
              </span>
              <span className="stat-pill" style={{ color: '#F87171' }}>
                <Heart size={14} fill="#F87171" />
                {hearts}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 pb-28 lg:pb-10">
          <Outlet />
        </main>

        {/* ── Mobile bottom nav ────────────────────────────── */}
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 z-30 pb-safe"
          style={{
            background: 'rgba(5,8,20,0.88)',
            backdropFilter: 'blur(32px) saturate(180%)',
            WebkitBackdropFilter: 'blur(32px) saturate(180%)',
            borderTop: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div className="flex">
            {NAV.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} className="flex-1">
                {({ isActive }) => (
                  <div
                    className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold transition-all duration-200 ${
                      isActive ? 'text-brand' : 'text-muted'
                    }`}
                  >
                    <div
                      className="p-1.5 rounded-xl transition-all duration-200"
                      style={isActive ? {
                        background: 'rgba(91,110,240,.15)',
                        boxShadow: '0 0 16px rgba(91,110,240,.2)',
                      } : {}}
                    >
                      <Icon size={20} />
                    </div>
                    <span>{label}</span>
                  </div>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

      </div>
    </div>
  )
}
