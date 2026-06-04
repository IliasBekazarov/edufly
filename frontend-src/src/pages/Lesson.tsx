import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { X, Heart, CheckCircle, XCircle, Trophy, Star, ArrowRight } from 'lucide-react'
import { api } from '../api'
import { setUser } from '../hooks/useApp'
import { sounds } from '../sounds'
import type { Module, User } from '../types'

interface LessonProps {
  modules: Module[]
  user: User | null
}

type Phase = 'question' | 'feedback' | 'complete'

export function Lesson({ modules, user }: LessonProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const lesson = modules.flatMap(m => m.lessons).find(l => l.id === id)
  const mod = modules.find(m => m.lessons.some(l => l.id === id))

  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<number | boolean | null>(null)
  const [phase, setPhase] = useState<Phase>('question')
  const [mistakes, setMistakes] = useState(0)
  const [hearts, setHearts] = useState(user?.state.hearts ?? 5)
  const [xpEarned, setXpEarned] = useState(0)
  const [reward, setReward] = useState<{ xp: number; gems: number } | null>(null)
  const [saveError, setSaveError] = useState(false)

  useEffect(() => { window.scrollTo(0, 0) }, [idx])

  if (!lesson || !mod) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted">
        Сабак табылган жок
      </div>
    )
  }

  const questions = lesson.questions
  const q = questions[idx]
  const progress = (idx + 1) / questions.length

  function checkAnswer(answer: number | boolean) {
    if (phase !== 'question') return
    setSelected(answer)
    setPhase('feedback')

    const correct = answer === q.a
    if (!correct) {
      sounds.wrong()
      setMistakes(m => m + 1)
      setHearts(h => {
        const next = Math.max(0, h - 1)
        if (user) setUser({ ...user, state: { ...user.state, hearts: next } })
        return next
      })
    } else {
      sounds.correct()
      setXpEarned(x => x + 10)
    }
  }

  function next() {
    if (idx + 1 >= questions.length) {
      const isReview = user?.state.completedLessons?.includes(lesson!.id) ?? false
      sounds.victory()
      setPhase('complete')
      api.completeLesson({ lessonId: lesson!.id, mistakes, isReview })
        .then(r => {
          setUser(r.user)
          setReward(r.reward)
        })
        .catch(() => setSaveError(true))
    } else {
      setIdx(i => i + 1)
      setSelected(null)
      setPhase('question')
    }
  }

  /* ── Complete screen ──────────────────────────────────── */
  if (phase === 'complete') {
    const perfect = mistakes === 0
    const xpToShow = reward?.xp ?? (xpEarned + (perfect ? 5 : 0))
    const gemsToShow = reward?.gems ?? null

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 gap-5">

        {/* Trophy */}
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center animate-scale-in"
          style={{
            background: perfect
              ? 'linear-gradient(135deg, rgba(252,211,77,.15), rgba(251,146,60,.1))'
              : 'linear-gradient(135deg, rgba(91,110,240,.15), rgba(167,139,250,.1))',
            border: `2px solid ${perfect ? 'rgba(252,211,77,.5)' : 'rgba(91,110,240,.5)'}`,
            boxShadow: perfect
              ? '0 0 40px rgba(252,211,77,.25)'
              : '0 0 40px rgba(91,110,240,.25)',
          }}
        >
          {perfect
            ? <Trophy size={44} style={{ color: '#FCD34D' }} />
            : <CheckCircle size={44} style={{ color: '#818CF8' }} />
          }
        </div>

        <div className="text-center animate-slide-up">
          <div className="font-display font-bold text-4xl mb-1">
            {perfect ? 'Мыкты!' : 'Бүттү!'}
          </div>
          <div className="text-muted text-sm">
            {perfect ? 'Идеалдуу нетижe!' : 'Жакшы иштедиң!'}
          </div>
        </div>

        {saveError && (
          <div
            className="px-4 py-3 rounded-xl text-sm text-center"
            style={{ background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.3)', color: '#FCA5A5' }}
          >
            Прогресс сакталган жок — интернетти текшер
          </div>
        )}

        {/* Results card */}
        <div className="glass-elevated p-5 w-full max-w-sm animate-slide-up">
          <div className="space-y-3">
            <ResultRow label="Тапкан XP" value={`+${xpToShow}`} color="#FCD34D" />
            {gemsToShow !== null && (
              <ResultRow label="Гем" value={`+${gemsToShow}`} color="#38BDF8" />
            )}
            <ResultRow
              label="Туура жооп"
              value={`${questions.length - mistakes}/${questions.length}`}
              color="#EEF2FF"
            />
            {perfect && (
              <div
                className="flex items-center justify-center gap-2 pt-2 text-xs font-bold uppercase tracking-widest"
                style={{ color: '#FCD34D' }}
              >
                <Star size={12} fill="#FCD34D" /> Идеалдуу сабак
              </div>
            )}
          </div>
        </div>

        <button
          className="btn3d full lg max-w-sm w-full animate-slide-up"
          onClick={() => navigate('/learn')}
        >
          Үйрөнүүгө кайт
        </button>
      </div>
    )
  }

  const isCorrect = selected !== null && selected === q.a

  return (
    <>
      <div
        className="min-h-screen flex flex-col max-w-[620px] mx-auto px-4 pt-5"
        style={{ paddingBottom: phase === 'feedback' ? 200 : 32 }}
      >
        {/* ── Lesson header ───────────────────────────── */}
        <div className="flex items-center gap-3 mb-7">
          <button
            onClick={() => navigate('/learn')}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 text-muted hover:text-text"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <X size={18} />
          </button>

          <div
            className="flex-1 h-2.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.07)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress * 100}%`,
                background: 'linear-gradient(90deg, #5B6EF0, #A78BFA)',
                boxShadow: '0 0 12px rgba(91,110,240,.5)',
              }}
            />
          </div>

          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-sm font-bold"
            style={{
              color: '#F87171',
              background: 'rgba(248,113,113,.1)',
              border: '1px solid rgba(248,113,113,.2)',
            }}
          >
            <Heart size={14} fill="#F87171" />
            {hearts}
          </div>
        </div>

        {/* ── Question ────────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-5">
          <div className="text-xs uppercase tracking-widest font-bold text-muted">
            {idx + 1} / {questions.length}
          </div>

          <h2 className="font-display font-bold text-xl leading-snug text-text">
            {q.q}
          </h2>

          {/* Options */}
          <div className="flex flex-col gap-3 mt-1">
            {q.type === 'tf' ? (
              <>
                {([true, false] as boolean[]).map(val => (
                  <OptionButton
                    key={String(val)}
                    label={val ? 'Туура' : 'Жалган'}
                    phase={phase}
                    isSelected={selected === val}
                    isCorrect={val === q.a}
                    onClick={() => checkAnswer(val)}
                  />
                ))}
              </>
            ) : (
              (q.opts ?? []).map((opt, i) => (
                <OptionButton
                  key={i}
                  label={opt}
                  phase={phase}
                  isSelected={selected === i}
                  isCorrect={i === q.a}
                  onClick={() => checkAnswer(i)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Feedback panel ──────────────────────────── */}
      {phase === 'feedback' && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50"
          style={{
            background: isCorrect
              ? 'linear-gradient(to top, rgba(4,14,36,.98) 0%, rgba(6,18,44,.96) 100%)'
              : 'linear-gradient(to top, rgba(28,6,6,.98) 0%, rgba(36,8,8,.96) 100%)',
            borderTop: `1.5px solid ${isCorrect ? 'rgba(91,110,240,.4)' : 'rgba(248,113,113,.4)'}`,
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
          }}
        >
          <div
            className="max-w-[620px] mx-auto px-4 pt-4 pb-safe"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 80px)' }}
          >
            <div className="flex items-start gap-3 mb-4">
              {isCorrect
                ? <CheckCircle size={26} className="shrink-0 mt-0.5" style={{ color: '#818CF8' }} />
                : <XCircle size={26} className="shrink-0 mt-0.5" style={{ color: '#F87171' }} />
              }
              <div className="flex-1 min-w-0">
                <div
                  className="font-display font-bold text-lg"
                  style={{ color: isCorrect ? '#A5B4FC' : '#FCA5A5' }}
                >
                  {isCorrect ? 'Туура!' : 'Туура эмес'}
                </div>
                {!isCorrect && (
                  <div className="text-sm text-muted mt-0.5">
                    Туура жооп:{' '}
                    <span className="font-bold text-text">
                      {q.type === 'tf'
                        ? (q.a ? 'Туура' : 'Жалган')
                        : q.opts?.[q.a as number]}
                    </span>
                  </div>
                )}
                {q.explanation && (
                  <div className="text-sm text-muted mt-1.5 leading-relaxed">
                    {q.explanation}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={next}
              className={`btn3d full lg ${isCorrect ? '' : 'rose'}`}
            >
              {idx + 1 >= questions.length ? 'Бүттү' : (
                <span className="flex items-center gap-2">
                  Кийинки <ArrowRight size={16} />
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function ResultRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="flex items-center justify-between py-2"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      <span className="text-sm text-muted">{label}</span>
      <span className="font-display font-bold text-base" style={{ color }}>{value}</span>
    </div>
  )
}

interface OptionButtonProps {
  label: string
  phase: Phase
  isSelected: boolean
  isCorrect: boolean
  onClick: () => void
}

function OptionButton({ label, phase, isSelected, isCorrect, onClick }: OptionButtonProps) {
  const revealed = phase === 'feedback'

  let style: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1.5px solid rgba(255,255,255,0.08)',
    color: '#EEF2FF',
  }

  if (revealed && isCorrect) {
    style = {
      background: 'rgba(91,110,240,0.15)',
      border: '1.5px solid rgba(91,110,240,0.5)',
      color: '#A5B4FC',
      boxShadow: '0 0 24px rgba(91,110,240,.12)',
    }
  } else if (revealed && isSelected && !isCorrect) {
    style = {
      background: 'rgba(248,113,113,0.12)',
      border: '1.5px solid rgba(248,113,113,0.5)',
      color: '#FCA5A5',
    }
  } else if (!revealed && isSelected) {
    style = {
      background: 'rgba(91,110,240,0.15)',
      border: '1.5px solid rgba(91,110,240,0.5)',
      color: '#A5B4FC',
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={phase !== 'question'}
      className="w-full text-left px-4 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200 active:scale-[.985]"
      style={style}
    >
      {label}
    </button>
  )
}
