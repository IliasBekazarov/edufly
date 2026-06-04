import { useEffect, useRef, useState } from 'react'
import { Crown, ChevronRight, Trophy, Flame } from 'lucide-react'
import { EmojiIcon } from '../components/EmojiIcon'
import { api } from '../api'
import type { LeaderboardEntry, League as LeagueType, User } from '../types'

interface LeagueProps {
  leagues: LeagueType[]
  user: User | null
}

function Avatar({ entry, size = 40 }: { entry: LeaderboardEntry; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white shrink-0"
      style={{
        width: size,
        height: size,
        background: stringToGradient(entry.name),
        boxShadow: `0 4px 12px ${stringToBaseColor(entry.name)}55`,
        fontSize: size * 0.35,
      }}
    >
      {entry.name[0].toUpperCase()}
    </div>
  )
}

function stringToBaseColor(s: string): string {
  const colors = ['#5B6EF0', '#38BDF8', '#F87171', '#FCD34D', '#FB923C', '#A78BFA']
  let hash = 0
  for (const c of s) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff
  return colors[Math.abs(hash) % colors.length]
}

function stringToGradient(s: string): string {
  const pairs = [
    ['#5B6EF0', '#A78BFA'],
    ['#38BDF8', '#5B6EF0'],
    ['#F87171', '#FB923C'],
    ['#FCD34D', '#FB923C'],
    ['#A78BFA', '#F472B6'],
    ['#34D399', '#38BDF8'],
  ]
  let hash = 0
  for (const c of s) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff
  const [c1, c2] = pairs[Math.abs(hash) % pairs.length]
  return `linear-gradient(135deg, ${c1}, ${c2})`
}

function getUserLeague(user: User | null, leagues: LeagueType[]): LeagueType | null {
  if (!user || !leagues.length) return null
  let best: LeagueType | null = null
  for (const l of leagues) {
    if (user.state.xp >= l.minXp) best = l
  }
  return best
}

const ITEMS_PER_PAGE = 3

function LeagueCarousel({ leagues, userLeague }: { leagues: LeagueType[]; userLeague: LeagueType | null }) {
  const ref = useRef<HTMLDivElement>(null)
  const [page, setPage] = useState(0)
  const pages = Math.ceil(leagues.length / ITEMS_PER_PAGE)

  function scrollToPage(p: number) {
    if (!ref.current) return
    const w = ref.current.clientWidth
    ref.current.scrollTo({ left: p * w, behavior: 'smooth' })
  }

  function handleScroll() {
    if (!ref.current) return
    const w = ref.current.clientWidth
    if (w === 0) return
    setPage(Math.round(ref.current.scrollLeft / w))
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="font-bold text-text text-sm flex items-center gap-2">
          <Trophy size={16} style={{ color: '#FCD34D' }} />
          Бардык лигалар
        </div>
        {page < pages - 1 && (
          <button
            onClick={() => scrollToPage(page + 1)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-muted hover:text-text transition-colors"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      <div
        ref={ref}
        onScroll={handleScroll}
        className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {leagues.map(league => {
          const active = league.id === userLeague?.id
          return (
            <div
              key={league.id}
              className="snap-start shrink-0 flex flex-col items-center justify-center rounded-2xl p-3 text-center transition-all duration-200"
              style={{
                width: 'calc((100% - 20px) / 3)',
                minHeight: 90,
                background: active ? `${league.color}15` : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${active ? league.color + '55' : 'rgba(255,255,255,0.07)'}`,
                boxShadow: active ? `0 0 28px ${league.color}28` : undefined,
                backdropFilter: 'blur(16px)',
              }}
            >
              <div className="mb-1.5">
                <EmojiIcon emoji={league.emoji} size={22} color={active ? league.color : '#5E7194'} />
              </div>
              <div
                className="font-display font-bold text-xs"
                style={{ color: active ? league.color : '#EEF2FF' }}
              >
                {league.name}
              </div>
              <div className="text-[10px] text-muted mt-0.5">{league.minXp}+ XP</div>
            </div>
          )
        })}
      </div>

      {pages > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToPage(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === page ? 18 : 6,
                height: 6,
                background: i === page ? 'linear-gradient(90deg, #5B6EF0, #A78BFA)' : 'rgba(255,255,255,0.1)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const PODIUM_STYLES = [
  { rank: 2, height: 90,  color: '#94A3B8', gradient: 'linear-gradient(135deg, #94A3B8, #64748B)', label: '#2' },
  { rank: 1, height: 120, color: '#FCD34D', gradient: 'linear-gradient(135deg, #FCD34D, #FB923C)', label: '#1' },
  { rank: 3, height: 72,  color: '#CD9B5A', gradient: 'linear-gradient(135deg, #CD9B5A, #A0735A)', label: '#3' },
]

export function League({ leagues, user }: LeagueProps) {
  const [board, setBoard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const userLeague = getUserLeague(user, leagues)

  useEffect(() => {
    api.leaderboard(50).then(setBoard).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const top3 = board.slice(0, 3)
  const podiumOrder = [top3[1], top3[0], top3[2]]

  return (
    <div className="max-w-[640px] mx-auto px-4 lg:px-6 pt-5 lg:pt-8">

      {leagues.length > 0 && (
        <LeagueCarousel leagues={leagues} userLeague={userLeague} />
      )}

      {/* ── Podium ────────────────────────────────── */}
      {!loading && top3.length >= 3 && (
        <div className="mb-6 animate-slide-up">
          <div className="flex items-end justify-center gap-3">
            {PODIUM_STYLES.map(({ rank, height, color, gradient, label }, i) => {
              const entry = podiumOrder[i]
              if (!entry) return null
              return (
                <div key={rank} className="flex flex-col items-center gap-2">
                  {rank === 1 && (
                    <Crown size={20} style={{ color: '#FCD34D' }} className="animate-floaty" />
                  )}
                  <div className="font-bold text-xs text-text truncate max-w-[80px] text-center">
                    {entry.name}
                  </div>
                  <Avatar entry={entry} size={rank === 1 ? 44 : 36} />
                  <div className="text-[11px] text-muted tabular-nums">{entry.xp} XP</div>
                  <div
                    className="w-[88px] rounded-t-2xl flex items-end justify-center pb-2.5 relative overflow-hidden"
                    style={{
                      height,
                      background: `${color}18`,
                      border: `1px solid ${color}33`,
                    }}
                  >
                    <div
                      className="absolute inset-0 opacity-10 pointer-events-none"
                      style={{ background: gradient }}
                    />
                    <span
                      className="font-display font-bold text-2xl relative z-10"
                      style={{ color }}
                    >
                      {label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Leaderboard ───────────────────────────── */}
      {loading ? (
        <div className="text-center text-muted py-14">Жүктөлүүдө...</div>
      ) : (
        <div className="glass overflow-hidden mb-8 animate-slide-up">
          {board.map((entry, i) => {
            const isMe = entry.id === user?.id
            const isTop3 = i < 3
            return (
              <div
                key={entry.id}
                className="flex items-center gap-3 px-4 py-3 transition-all duration-200"
                style={{
                  borderBottom: i < board.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  background: isMe ? 'rgba(91,110,240,0.08)' : 'transparent',
                }}
              >
                {/* Rank */}
                <div
                  className="w-6 text-center font-display font-bold text-sm shrink-0"
                  style={{
                    color: isTop3 ? '#FCD34D' : '#5E7194',
                  }}
                >
                  {i + 1}
                </div>

                <Avatar entry={entry} size={38} />

                <div className="flex-1 min-w-0">
                  <div
                    className="font-semibold text-sm truncate"
                    style={{ color: isMe ? '#818CF8' : '#EEF2FF' }}
                  >
                    {entry.name} {isMe && <span className="text-xs opacity-70">· сен</span>}
                  </div>
                  <div className="text-[11px] text-muted flex items-center gap-1 mt-0.5">
                    {entry.completed} сабак
                    <span className="opacity-40">·</span>
                    <Flame size={11} style={{ color: '#FB923C' }} />
                    {entry.streak}
                  </div>
                </div>

                <div
                  className="font-display font-bold tabular-nums text-sm shrink-0"
                  style={{ color: isTop3 ? '#FCD34D' : '#EEF2FF' }}
                >
                  {entry.xp}
                </div>
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}
