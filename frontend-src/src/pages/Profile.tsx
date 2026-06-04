import { Star, Flame, BookOpen, Zap, Trophy, BarChart3, UserCircle } from 'lucide-react'
import { EmojiIcon } from '../components/EmojiIcon'
import type { User, Achievement, Module, League } from '../types'
import { useNavigate } from 'react-router-dom'

interface ProfileProps {
  user: User | null
  achievements: Achievement[]
  modules: Module[]
  leagues: League[]
}

function getUserLeague(user: User | null, leagues: League[]): League | null {
  if (!user || !leagues.length) return null
  let best: League | null = null
  for (const l of leagues) {
    if (user.state.xp >= l.minXp) best = l
  }
  return best
}

const STAT_CONFIG = [
  { key: 'xp',      label: 'XP',       gradient: ['#FCD34D', '#FB923C'] },
  { key: 'streak',  label: 'СЕРИЯ',    gradient: ['#FB923C', '#F87171'] },
  { key: 'lessons', label: 'САБАК',    gradient: ['#38BDF8', '#5B6EF0'] },
  { key: 'perfect', label: 'ПЕРФЕКТ',  gradient: ['#A78BFA', '#F472B6'] },
]

export function Profile({ user, achievements, modules, leagues }: ProfileProps) {
  const navigate = useNavigate()

  if (!user) {
    return (
      <div className="max-w-[480px] mx-auto px-4 pt-16 text-center animate-fade-in">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <UserCircle size={44} className="text-muted" />
        </div>
        <div className="font-display font-bold text-2xl mb-2 text-text">
          Профилиңди көрүү үчүн кирүү керек
        </div>
        <div className="text-muted mb-8 text-sm leading-relaxed">
          Прогрессиңди сактоо үчүн аккаунтка кириңиз
        </div>
        <button className="btn3d full lg" onClick={() => navigate('/login')}>
          Кирүү
        </button>
      </div>
    )
  }

  const s = user.state
  const league = getUserLeague(user, leagues)
  const completed = new Set(s.completedLessons)
  const totalLessons = modules.reduce((a, m) => a + m.lessons.length, 0)
  const earnedAchievements = new Set(s.achievements)

  const statValues = {
    xp:      s.xp,
    streak:  s.streak,
    lessons: `${completed.size}/${totalLessons}`,
    perfect: s.perfectLessons?.length ?? 0,
  }

  const statIcons = {
    xp:      <Star size={18} />,
    streak:  <Flame size={18} />,
    lessons: <BookOpen size={18} />,
    perfect: <Zap size={18} />,
  }

  return (
    <div className="max-w-[640px] mx-auto px-4 lg:px-6 pt-5 lg:pt-8 pb-8">

      {/* ── Avatar card ─────────────────────────────── */}
      <div className="glass-elevated p-6 mb-5 relative overflow-hidden animate-slide-up">
        {/* Glow bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 300px 200px at 50% 0%, rgba(91,110,240,.12) 0%, transparent 70%)',
          }}
        />
        <div className="relative flex flex-col items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, #5B6EF0, #A78BFA)',
                boxShadow: '0 8px 32px rgba(91,110,240,.5)',
              }}
            >
              {user.name[0].toUpperCase()}
            </div>
            <div
              className="absolute inset-0 rounded-full animate-glow-pulse pointer-events-none"
              style={{ boxShadow: '0 0 30px rgba(91,110,240,.3)', zIndex: -1 }}
            />
          </div>
          <div className="text-center">
            <div className="font-display font-bold text-2xl text-text">{user.name}</div>
            <div className="text-muted text-sm mt-0.5">{user.email}</div>
            {league && (
              <div
                className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  color: league.color,
                  border: `1px solid ${league.color}44`,
                  background: `${league.color}14`,
                }}
              >
                {league.emoji} {league.name}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats grid ──────────────────────────────── */}
      <div className="grid grid-cols-4 gap-2.5 mb-5 animate-slide-up">
        {STAT_CONFIG.map(({ key, label, gradient }) => (
          <div
            key={key}
            className="glass p-3 text-center relative overflow-hidden"
            style={{ '--g1': gradient[0], '--g2': gradient[1] } as React.CSSProperties}
          >
            <div className="flex justify-center mb-1.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                style={{ background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`, opacity: 0.9 }}
              >
                {statIcons[key as keyof typeof statIcons]}
              </div>
            </div>
            <div
              className="font-display font-bold text-base tabular-nums bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` }}
            >
              {statValues[key as keyof typeof statValues]}
            </div>
            <div className="text-[9px] uppercase tracking-widest text-muted mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Achievements ────────────────────────────── */}
      <div className="mb-5 animate-slide-up">
        <div className="font-bold text-text mb-3 flex items-center gap-2 text-sm">
          <Trophy size={16} style={{ color: '#FCD34D' }} />
          Жетишкендиктер
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {achievements.map(ach => {
            const earned = earnedAchievements.has(ach.id)
            return (
              <div
                key={ach.id}
                className="glass p-3.5 flex items-center gap-3 transition-all duration-200"
                style={earned ? {
                  background: 'rgba(252,211,77,0.06)',
                  border: '1px solid rgba(252,211,77,0.18)',
                } : { opacity: 0.4 }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: earned ? 'rgba(252,211,77,0.15)' : 'rgba(255,255,255,0.05)' }}
                >
                  <EmojiIcon emoji={ach.emoji} size={20} color={earned ? '#FCD34D' : '#5E7194'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-text truncate">{ach.title}</div>
                  <div className="text-[11px] text-muted leading-snug">{ach.desc}</div>
                </div>
                <div
                  className="text-xs font-bold shrink-0 tabular-nums"
                  style={{ color: '#FCD34D' }}
                >
                  +{ach.xp}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Module progress ─────────────────────────── */}
      <div className="animate-slide-up">
        <div className="font-bold text-text mb-3 flex items-center gap-2 text-sm">
          <BarChart3 size={16} style={{ color: '#38BDF8' }} />
          Прогресс
        </div>
        <div className="glass overflow-hidden">
          {modules.map((mod, i) => {
            const done = mod.lessons.filter(l => completed.has(l.id)).length
            const pct = mod.lessons.length > 0 ? done / mod.lessons.length : 0
            return (
              <div
                key={mod.id}
                className="px-4 py-3"
                style={{ borderBottom: i < modules.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5 text-sm font-semibold text-text">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ background: mod.color || '#5B6EF0' }}
                    >
                      {mod.id}
                    </div>
                    {mod.title}
                  </div>
                  <div className="text-xs text-muted tabular-nums">{done}/{mod.lessons.length}</div>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct * 100}%`, background: mod.color || '#5B6EF0' }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
