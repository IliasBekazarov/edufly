import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { X, Heart, CheckCircle, XCircle, Trophy, Star } from 'lucide-react'
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
  const color = '#0B90E0'

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

  if (phase === 'complete') {
    const perfect = mistakes === 0
    const xpToShow = reward?.xp ?? (xpEarned + (perfect ? 5 : 0))
    const gemsToShow = reward?.gems ?? null
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 gap-6">
        <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: perfect ? '#FFD90022' : '#0B90E022', border: `2px solid ${perfect ? '#FFD900' : '#0B90E0'}` }}>
          {perfect ? <Trophy size={40} style={{ color: '#FFD900' }} /> : <CheckCircle size={40} style={{ color: '#0B90E0' }} />}
        </div>
        <div className="font-display font-bold text-3xl text-center">
          {perfect ? 'Мыкты!' : 'Бүттү!'}
        </div>
        {saveError && (
          <div className="text-rose text-sm text-center px-4">
            Прогресс сакталган жок — интернет байланышын текшер
          </div>
        )}
        <div className="glass p-6 w-full max-w-sm flex flex-col gap-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Тапкан XP</span>
            <span className="font-display font-bold text-sun text-lg">+{xpToShow}</span>
          </div>
          {gemsToShow !== null && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Гем</span>
              <span className="font-display font-bold text-sky text-lg">+{gemsToShow}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Туура жооп</span>
            <span className="font-bold text-text">{questions.length - mistakes}/{questions.length}</span>
          </div>
          {perfect && (
            <div className="text-center text-xs text-brand font-bold uppercase tracking-wider">
              <Star size={12} className="inline mr-1" /> Идеалдуу сабак
            </div>
          )}
        </div>
        <button className="btn3d full lg max-w-sm w-full" onClick={() => navigate('/learn')}>
          Үйрөнүүгө кайт
        </button>
      </div>
    )
  }

  const isCorrect = selected !== null && selected === q.a

  return (
    <>
    <div
      className="min-h-screen flex flex-col max-w-[640px] mx-auto px-4 pt-4"
      style={{ paddingBottom: phase === 'feedback' ? 180 : 32 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/learn')}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-line/60 transition-colors text-muted"
        >
          <X size={20} />
        </button>

        <div className="flex-1 h-3 rounded-full bg-line overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress * 100}%`, background: color }}
          />
        </div>

        <div className="flex items-center gap-1 text-sm font-bold" style={{ color: '#FF4B4B' }}>
          <Heart size={16} fill="#FF4B4B" />
          {hearts}
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col gap-5">
        <div className="text-xs uppercase tracking-wider font-bold text-muted">
          {idx + 1} / {questions.length}
        </div>

        <div className="font-display font-bold text-xl leading-snug">
          {q.type === 'fill'
            ? <FillQuestionText text={q.q} filled={phase === 'feedback' ? String(q.opts?.[q.a as number] ?? '') : null} isCorrect={isCorrect} color={color} />
            : q.q
          }
        </div>

        {/* Answer options */}
        <div className="flex flex-col gap-3 mt-2">
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
                  color={color}
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
                color={color}
              />
            ))
          )}
        </div>
      </div>

    </div>

    {/* ── Fixed feedback panel ─────────────────────────────────── */}
    {phase === 'feedback' && (
      <div
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: isCorrect
            ? 'linear-gradient(to top, rgba(6,18,40,0.98) 0%, rgba(8,22,48,0.95) 100%)'
            : 'linear-gradient(to top, rgba(30,8,8,0.98) 0%, rgba(40,10,10,0.95) 100%)',
          borderTop: `2px solid ${isCorrect ? 'rgba(11,144,224,0.5)' : 'rgba(255,75,75,0.5)'}`,
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="max-w-[640px] mx-auto px-4 pt-4 pb-safe" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 80px)' }}>

          {/* Status row */}
          <div className="flex items-start gap-3 mb-4">
            {isCorrect
              ? <CheckCircle size={26} className="shrink-0 mt-0.5" style={{ color: '#0B90E0' }} />
              : <XCircle size={26} className="text-rose shrink-0 mt-0.5" />
            }
            <div className="flex-1 min-w-0">
              <div
                className="font-display font-bold text-lg"
                style={{ color: isCorrect ? '#0B90E0' : '#FF4B4B' }}
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
                <div className="text-sm text-muted mt-1 leading-relaxed">
                  {q.explanation}
                </div>
              )}
            </div>
          </div>

          {/* Next button — full width, easy to tap */}
          <button
            onClick={next}
            className="btn3d full lg"
            style={{ background: isCorrect ? '#0B90E0' : '#FF4B4B' }}
          >
            {idx + 1 >= questions.length ? 'Бүттү' : 'Кийинки →'}
          </button>

        </div>
      </div>
    )}
    </>
  )
}

function FillQuestionText({
  text,
  filled,
  isCorrect,
  color,
}: {
  text: string
  filled: string | null
  isCorrect: boolean
  color: string
}) {
  const BLANK = '__________'
  const parts = text.split(BLANK)
  if (parts.length < 2) return <>{text}</>

  const blankStyle: React.CSSProperties = filled
    ? {
        display: 'inline-block',
        minWidth: 80,
        borderBottom: `2px solid ${isCorrect ? color : '#FF4B4B'}`,
        color: isCorrect ? color : '#FF4B4B',
        paddingBottom: 1,
        textAlign: 'center',
      }
    : {
        display: 'inline-block',
        minWidth: 80,
        borderBottom: '2px solid #7C8499',
        color: 'transparent',
        userSelect: 'none',
      }

  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <span style={blankStyle}>{filled ?? '     '}</span>
          )}
        </span>
      ))}
    </>
  )
}

interface OptionButtonProps {
  label: string
  phase: Phase
  isSelected: boolean
  isCorrect: boolean
  onClick: () => void
  color: string
}

function OptionButton({ label, phase, isSelected, isCorrect, onClick, color }: OptionButtonProps) {
  const revealed = phase === 'feedback'

  let border = '1px solid #1F2538'
  let bg = '#101524b3'
  let textColor = '#E6E9F2'

  if (revealed && isCorrect) {
    border = `1px solid ${color}`
    bg = `rgba(11,144,224,0.15)`
    textColor = color
  } else if (revealed && isSelected && !isCorrect) {
    border = '1px solid rgba(255,75,75,0.6)'
    bg = 'rgba(255,75,75,0.12)'
    textColor = '#FF4B4B'
  } else if (!revealed && isSelected) {
    border = `1px solid ${color}`
    bg = `rgba(11,144,224,0.15)`
    textColor = color
  }

  return (
    <button
      onClick={onClick}
      disabled={phase !== 'question'}
      className="w-full text-left px-4 py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-[.98]"
      style={{ border, background: bg, color: textColor }}
    >
      {label}
    </button>
  )
}
