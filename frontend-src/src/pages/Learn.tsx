import { useNavigate } from 'react-router-dom'
import { Lock, Star } from 'lucide-react'
import { EmojiIcon } from '../components/EmojiIcon'
import type { Module, User } from '../types'

interface LearnProps {
  modules: Module[]
  user: User | null
}

const ZIGZAG = [0, 60, 40, -20, -50, 60, 30, -30, 50, 20]

export function Learn({ modules, user }: LearnProps) {
  const navigate = useNavigate()
  const completed = new Set(user?.state.completedLessons ?? [])

  function isUnlocked(mod: Module, idx: number): boolean {
    if (idx === 0) {
      if (mod.id === modules[0]?.id) return true
      const prev = modules.find(m => m.id === mod.id - 1)
      return prev ? prev.lessons.every(l => completed.has(l.id)) : false
    }
    return completed.has(mod.lessons[idx - 1].id)
  }

  function isActive(mod: Module, idx: number): boolean {
    return isUnlocked(mod, idx) && !completed.has(mod.lessons[idx].id)
  }

  return (
    <div className="max-w-[640px] mx-auto px-4 lg:px-6 pt-4 lg:pt-8 overflow-x-hidden">
      {modules.map((mod) => {
        const doneCount = mod.lessons.filter(l => completed.has(l.id)).length
        const pct = mod.lessons.length > 0 ? Math.round(doneCount / mod.lessons.length * 100) : 0

        return (
          <section key={mod.id} className="mb-10">

            {/* ── Section banner (Duolingo-style) ─────────────────── */}
            <div className="relative mb-8">

              {/* Mascot — stands on the right edge, overflows above banner */}
              {mod.mascotImage && (
                <div
                  className="absolute right-3 bottom-0 z-10 pointer-events-none select-none"
                  style={{ height: 172 }}
                >
                  <img
                    src={mod.mascotImage}
                    alt=""
                    className="h-full w-auto object-contain object-bottom"
                    style={{ filter: 'drop-shadow(0 6px 20px rgba(0,0,0,.35))' }}
                  />
                </div>
              )}

              {/* Banner card */}
              <div
                className="rounded-2xl p-5 overflow-hidden"
                style={{
                  paddingRight: mod.mascotImage ? 148 : 20,
                  background: 'linear-gradient(135deg, #066BB0 0%, #0B90E0 100%)',
                  boxShadow: '#044E82 0px 6px 0px, rgba(11,144,224,.45) 0px 20px 48px -16px',
                }}
              >
                <div className="text-[11px] uppercase tracking-wider font-bold text-white/70 mb-1">
                  {mod.id}-бөлүм
                </div>
                <div className="font-display font-bold text-xl text-white leading-tight">
                  {mod.title}
                </div>
                {/* Progress bar */}
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex-1 h-2.5 rounded-full bg-white/20 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-white transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-white/90 tabular-nums shrink-0">
                    {doneCount}/{mod.lessons.length}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Lesson nodes — zigzag path ───────────────────────── */}
            <div className="flex flex-col items-center gap-5">
              {mod.lessons.map((lesson, idx) => {
                const unlocked = isUnlocked(mod, idx)
                const active   = isActive(mod, idx)
                const done     = completed.has(lesson.id)
                const offset   = ZIGZAG[idx % ZIGZAG.length]

                return (
                  <div key={lesson.id} className="flex justify-center w-full">
                    <div
                      className="relative flex flex-col items-center"
                      style={{ transform: `translateX(${offset}px)` }}
                    >
                      {/* Floating START label */}
                      {active && (
                        <div
                          className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-lg bg-white text-brand whitespace-nowrap shadow-pop"
                          style={{ animation: 'floaty 3s ease-in-out infinite' }}
                        >
                          БАШТА
                        </div>
                      )}

                      {/* Circle button */}
                      <button
                        disabled={!unlocked}
                        onClick={() => unlocked && navigate(`/lesson/${lesson.id}`)}
                        className="w-[80px] h-[80px] rounded-full flex items-center justify-center transition-all active:translate-y-[3px]"
                        title={lesson.title}
                        style={
                          done
                            ? {
                                background: 'linear-gradient(145deg, #0d2644 0%, #091c34 100%)',
                                boxShadow: '#05111f 0px 6px 0px, rgba(28,176,246,0.3) 0px 16px 40px -12px',
                                border: '2px solid rgba(28,176,246,0.35)',
                                cursor: 'pointer',
                              }
                            : active
                            ? {
                                background: '#0B90E0',
                                boxShadow: `#0870B0 0px 6px 0px, rgba(11,144,224,.6) 0px 12px 32px -12px`,
                                color: '#fff',
                                cursor: 'pointer',
                              }
                            : {
                                background: '#2A3148',
                                boxShadow: '#1A1F30 0px 5px 0px',
                                color: '#6B7488',
                                cursor: 'not-allowed',
                                opacity: 0.7,
                              }
                        }
                      >
                        {done
                          ? <Star size={34} fill="#1CB0F6" strokeWidth={0} />
                          : unlocked
                          ? <EmojiIcon emoji={mod.emoji} size={28} color="white" />
                          : <Lock size={28} />}
                      </button>

                      <div className="mt-1 text-[11px] text-center text-muted max-w-[140px] truncate">
                        {lesson.title}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

          </section>
        )
      })}
      <div className="h-10" />
    </div>
  )
}
