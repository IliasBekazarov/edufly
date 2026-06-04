import { useNavigate } from 'react-router-dom'
import { Lock, Star, CheckCircle } from 'lucide-react'
import { EmojiIcon } from '../components/EmojiIcon'
import type { Module, User } from '../types'

interface LearnProps {
  modules: Module[]
  user: User | null
}

const ZIGZAG = [0, 55, 35, -25, -50, 55, 28, -35, 45, 15]

const MODULE_GRADIENTS = [
  ['#5B6EF0', '#A78BFA'],
  ['#34D399', '#38BDF8'],
  ['#FB923C', '#F472B6'],
  ['#FCD34D', '#FB923C'],
  ['#38BDF8', '#5B6EF0'],
  ['#F472B6', '#A78BFA'],
]

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
    <div className="max-w-[600px] mx-auto px-4 lg:px-6 pt-5 lg:pt-8 overflow-x-hidden">
      {modules.map((mod, modIdx) => {
        const doneCount = mod.lessons.filter(l => completed.has(l.id)).length
        const pct = mod.lessons.length > 0 ? Math.round(doneCount / mod.lessons.length * 100) : 0
        const [c1, c2] = MODULE_GRADIENTS[modIdx % MODULE_GRADIENTS.length]

        return (
          <section key={mod.id} className="mb-12 animate-slide-up">

            {/* ── Module banner ──────────────────────────── */}
            <div className="relative mb-10">

              {/* Mascot */}
              {mod.mascotImage && (
                <div
                  className="absolute right-4 bottom-0 z-10 pointer-events-none select-none"
                  style={{ height: 168 }}
                >
                  <img
                    src={mod.mascotImage}
                    alt=""
                    className="h-full w-auto object-contain object-bottom"
                    style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,.4))' }}
                  />
                </div>
              )}

              {/* Banner */}
              <div
                className="rounded-2xl p-5 overflow-hidden relative"
                style={{
                  paddingRight: mod.mascotImage ? 148 : 20,
                  background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
                  boxShadow: `${c1}66 0px 8px 0px, ${c1}44 0px 24px 56px -16px`,
                }}
              >
                {/* Glass shimmer overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 60%)',
                    borderRadius: 'inherit',
                  }}
                />
                <div className="relative z-10">
                  <div className="text-[11px] uppercase tracking-widest font-bold text-white/60 mb-1">
                    {mod.id}-бөлүм
                  </div>
                  <div className="font-display font-bold text-xl text-white leading-snug mb-4">
                    {mod.title}
                  </div>
                  {/* Progress */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.22)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: 'rgba(255,255,255,0.9)' }}
                      />
                    </div>
                    <span className="text-xs font-bold text-white/80 tabular-nums shrink-0">
                      {doneCount}/{mod.lessons.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Lesson nodes — zigzag path ─────────────── */}
            <div className="flex flex-col items-center gap-6">
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
                      {/* START label */}
                      {active && (
                        <div
                          className="absolute -top-9 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-lg whitespace-nowrap"
                          style={{
                            background: '#fff',
                            color: c1,
                            boxShadow: `0 4px 16px ${c1}55`,
                            animation: 'floaty 3.5s ease-in-out infinite',
                          }}
                        >
                          БАШТА
                        </div>
                      )}

                      {/* Node button */}
                      <button
                        disabled={!unlocked}
                        onClick={() => unlocked && navigate(`/lesson/${lesson.id}`)}
                        title={lesson.title}
                        className="w-[76px] h-[76px] rounded-full flex items-center justify-center transition-all duration-200 active:translate-y-[3px] active:scale-95"
                        style={
                          done ? {
                            background: 'rgba(255,255,255,0.05)',
                            border: `2px solid ${c1}55`,
                            boxShadow: `${c1}33 0px 6px 0px, ${c1}22 0px 16px 40px -12px`,
                            cursor: 'pointer',
                          } : active ? {
                            background: `linear-gradient(145deg, ${c1}, ${c2})`,
                            boxShadow: `${c1}88 0px 6px 0px, ${c1}66 0px 16px 40px -8px`,
                            cursor: 'pointer',
                          } : {
                            background: 'rgba(255,255,255,0.04)',
                            border: '2px solid rgba(255,255,255,0.06)',
                            boxShadow: 'rgba(0,0,0,0.4) 0px 5px 0px',
                            cursor: 'not-allowed',
                            opacity: 0.45,
                          }
                        }
                      >
                        {done
                          ? <CheckCircle size={30} style={{ color: c1 }} strokeWidth={2} />
                          : unlocked
                          ? <EmojiIcon emoji={mod.emoji} size={28} color="white" />
                          : <Lock size={24} style={{ color: 'rgba(255,255,255,0.3)' }} />
                        }
                      </button>

                      {/* Lesson title */}
                      <div className="mt-2 text-[11px] text-center text-muted max-w-[130px] truncate leading-tight">
                        {lesson.title}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Separator */}
            {modIdx < modules.length - 1 && (
              <div className="flex items-center gap-4 mt-10">
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)' }} />
                <Star size={14} className="text-muted shrink-0" />
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)' }} />
              </div>
            )}

          </section>
        )
      })}
      <div className="h-10" />
    </div>
  )
}
