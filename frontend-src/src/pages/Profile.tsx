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

export function Profile({ user, achievements, modules, leagues }: ProfileProps) {
  const navigate = useNavigate()

  if (!user) {
    return (
      <div className="max-w-[480px] mx-auto px-4 pt-16 text-center">
        <UserCircle size={72} className="text-muted mb-4" />
        <div className="font-display font-bold text-2xl mb-2">Профилиңизди көрүү үчүн кирүү керек</div>
        <div className="text-muted mb-8">Прогрессиңизди сактоо үчүн аккаунтка кириңиз</div>
        <button className="btn3d full lg" onClick={() => navigate('/login')}>Кирүү</button>
      </div>
    )
  }

  const s = user.state
  const league = getUserLeague(user, leagues)
  const completed = new Set(s.completedLessons)
  const totalLessons = modules.reduce((a, m) => a + m.lessons.length, 0)
  const earnedAchievements = new Set(s.achievements)

  return (
    <div className="max-w-[640px] mx-auto px-4 lg:px-6 pt-4 lg:pt-8">
      {/* Avatar + name */}
      <div className="glass p-6 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-grad-brand opacity-5 rounded-2xl" />
        <div className="relative flex flex-col items-center gap-3">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white"
            style={{ background: 'linear-gradient(145deg, #0B90E0 0%, #0870B0 100%)' }}
          >
            {user.name[0].toUpperCase()}
          </div>
          <div className="text-center">
            <div className="font-display font-bold text-2xl">{user.name}</div>
            <div className="text-muted text-sm">{user.email}</div>
            {league && (
              <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-bold border"
                style={{ color: league.color, borderColor: `${league.color}44`, background: `${league.color}11` }}>
                {league.emoji} {league.name}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'XP', value: s.xp, icon: <Star size={16} className="text-sun" />, color: 'text-sun' },
          { label: 'STREAK', value: s.streak, icon: <Flame size={16} className="text-warm" />, color: 'text-warm' },
          { label: 'САБАК', value: `${completed.size}/${totalLessons}`, icon: <BookOpen size={16} className="text-sky" />, color: 'text-sky' },
          { label: 'ПЕРФЕКТ', value: s.perfectLessons?.length ?? 0, icon: <Zap size={16} className="text-violet" />, color: 'text-violet' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="glass p-3 text-center">
            <div className="flex justify-center mb-1">{icon}</div>
            <div className={`font-display font-bold text-lg tabular-nums ${color}`}>{value}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted">{label}</div>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div className="mb-6">
        <div className="font-bold text-text mb-3 flex items-center gap-2"><Trophy size={16} className="text-sun" /> Жетишкендиктер</div>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map(ach => {
            const earned = earnedAchievements.has(ach.id)
            return (
              <div
                key={ach.id}
                className={`glass p-3 flex items-center gap-3 ${earned ? '' : 'opacity-40'}`}
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  <EmojiIcon emoji={ach.emoji} size={22} color={earned ? '#FFD900' : '#7C8499'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-text truncate">{ach.title}</div>
                  <div className="text-[11px] text-muted">{ach.desc}</div>
                </div>
                <div className="text-xs font-bold text-sun shrink-0">+{ach.xp}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Module progress */}
      <div className="mb-10">
        <div className="font-bold text-text mb-3 flex items-center gap-2"><BarChart3 size={16} className="text-sky" /> Прогресс</div>
        <div className="glass overflow-hidden">
          {modules.map(mod => {
            const done = mod.lessons.filter(l => completed.has(l.id)).length
            const pct = mod.lessons.length > 0 ? done / mod.lessons.length : 0
            return (
              <div key={mod.id} className="px-4 py-3 border-b border-line last:border-b-0">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ background: mod.color }}
                    >
                      {mod.id}
                    </div>
                    {mod.title}
                  </div>
                  <div className="text-xs text-muted tabular-nums">{done}/{mod.lessons.length}</div>
                </div>
                <div className="h-1.5 rounded-full bg-line overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct * 100}%`, background: mod.color }}
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
