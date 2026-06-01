import { useEffect, useRef, useState } from 'react'
import { Crown, ChevronRight, Trophy, Flame } from 'lucide-react'
import { EmojiIcon } from '../components/EmojiIcon'
import { api } from '../api'
import type { LeaderboardEntry, League as LeagueType, User } from '../types'

interface LeagueProps {
  leagues: LeagueType[]
  user: User | null
}

function Avatar({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
      style={{ background: stringToColor(entry.name) }}
    >
      {entry.name[0].toUpperCase()}
    </div>
  )
}

function stringToColor(s: string): string {
  const colors = ['#0B90E0', '#1CB0F6', '#FF4B4B', '#FFD900', '#FF9600', '#CE82FF']
  let hash = 0
  for (const c of s) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff
  return colors[Math.abs(hash) % colors.length]
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
        <div className="font-bold text-text flex items-center gap-2"><Trophy size={16} className="text-sun" /> Бардык лигалар</div>
        {page < pages - 1 && (
          <button
            onClick={() => scrollToPage(page + 1)}
            className="w-8 h-8 rounded-full bg-line flex items-center justify-center text-muted hover:text-text transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      <div
        ref={ref}
        onScroll={handleScroll}
        className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {leagues.map((league) => {
          const active = league.id === userLeague?.id
          return (
            <div
              key={league.id}
              className="snap-start shrink-0 flex flex-col items-center justify-center rounded-2xl p-3 text-center transition-all"
              style={{
                width: 'calc((100% - 20px) / 3)',
                minHeight: 96,
                background: active ? `${league.color}18` : '#101524b3',
                border: `1.5px solid ${active ? league.color : '#1F2538'}`,
                boxShadow: active ? `0 0 24px ${league.color}33` : undefined,
                backdropFilter: 'blur(16px)',
              }}
            >
              <div className="mb-1.5 leading-none flex items-center justify-center">
                <EmojiIcon emoji={league.emoji} size={24} color={active ? league.color : '#7C8499'} />
              </div>
              <div
                className="font-display font-bold text-xs leading-tight"
                style={{ color: active ? league.color : '#E6E9F2' }}
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
                width: i === page ? 16 : 6,
                height: 6,
                background: i === page ? '#0B90E0' : '#1F2538',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function League({ leagues, user }: LeagueProps) {
  const [board, setBoard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const userLeague = getUserLeague(user, leagues)

  useEffect(() => {
    api.leaderboard(50).then(setBoard).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const top3 = board.slice(0, 3)

  return (
    <div className="max-w-[640px] mx-auto px-4 lg:px-6 pt-4 lg:pt-8">
      {/* League carousel */}
      {leagues.length > 0 && (
        <LeagueCarousel leagues={leagues} userLeague={userLeague} />
      )}

      {/* Podium */}
      {!loading && top3.length >= 3 && (
        <div className="mb-6">
          <div className="flex items-end justify-center gap-4">
            {[top3[1], top3[0], top3[2]].map((entry, i) => {
              const rank = i === 1 ? 1 : i === 0 ? 2 : 3
              const heights = ['h-24', 'h-32', 'h-20']
              const isFirst = rank === 1
              return (
                <div key={entry.id} className="flex flex-col items-center gap-2">
                  {isFirst && <Crown size={20} className="text-sun" />}
                  <div className="font-bold text-sm text-text">{entry.name}</div>
                  <Avatar entry={entry} />
                  <div className="font-bold text-xs text-muted">{entry.xp} XP</div>
                  <div
                    className={`w-24 ${heights[i]} rounded-t-2xl flex items-end justify-center pb-3`}
                    style={{
                      background: rank === 1 ? '#FFD90033' : rank === 2 ? '#94A3B833' : '#CD7F3233',
                      border: `1px solid ${rank === 1 ? '#FFD90066' : rank === 2 ? '#94A3B866' : '#CD7F3266'}`,
                    }}
                  >
                    <span className="font-display font-bold text-2xl" style={{
                      color: rank === 1 ? '#FFD900' : rank === 2 ? '#94A3B8' : '#CD7F32',
                    }}>
                      #{rank}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Full leaderboard */}
      {loading
        ? <div className="text-center text-muted py-12">Жүктөлүүдө...</div>
        : (
          <div className="glass overflow-hidden mb-8">
            {board.map((entry, idx) => {
              const isMe = entry.id === user?.id
              return (
                <div
                  key={entry.id}
                  className={`flex items-center gap-3 px-4 py-3 border-b border-line last:border-b-0 ${isMe ? 'bg-brand/10' : ''}`}
                >
                  <div className={`w-6 text-center font-display font-bold text-sm ${idx < 3 ? 'text-sun' : 'text-muted'}`}>
                    {idx + 1}
                  </div>
                  <Avatar entry={entry} />
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold text-sm truncate ${isMe ? 'text-brand' : 'text-text'}`}>
                      {entry.name} {isMe && '· сен'}
                    </div>
                    <div className="text-[11px] text-muted flex items-center gap-1">
                      {entry.completed} сабак · <Flame size={11} className="text-warm" /> {entry.streak}
                    </div>
                  </div>
                  <div className="font-display font-bold tabular-nums">{entry.xp}</div>
                </div>
              )
            })}
          </div>
        )
      }
    </div>
  )
}
