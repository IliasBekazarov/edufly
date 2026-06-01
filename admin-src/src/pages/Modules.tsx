import { useEffect, useState, useCallback } from 'react'
import { ChevronDown, ChevronRight, Plus, Trash2, Save, GripVertical, BookOpen, HelpCircle } from 'lucide-react'
import { api } from '../api'
import { useToast } from '../App'
import type { Module, Lesson, Question } from '../types'

// ── Question editor ──────────────────────────────────────────────────────────
function QuestionEditor({ q, idx, onChange, onDelete }: {
  q: Question; idx: number
  onChange: (q: Question) => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const update = (patch: Partial<Question>) => onChange({ ...q, ...patch })

  return (
    <div className="border border-line rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-line/30 transition-colors text-left"
      >
        <HelpCircle size={15} className="text-muted shrink-0" />
        <span className="flex-1 text-sm truncate text-text">{q.q || `${idx + 1}-суроо`}</span>
        <span className="badge bg-brand/10 text-brand text-[10px] shrink-0">{q.type.toUpperCase()}</span>
        <button onClick={e => { e.stopPropagation(); onDelete() }} className="text-muted hover:text-rose p-1 shrink-0 transition-colors">
          <Trash2 size={13} />
        </button>
        {open ? <ChevronDown size={15} className="text-muted shrink-0" /> : <ChevronRight size={15} className="text-muted shrink-0" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-line bg-ink/40">
          <div className="pt-3">
            <label className="label">Суроо тексти</label>
            <textarea className="input resize-none" rows={2} value={q.q} onChange={e => update({ q: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Түрү</label>
              <select className="input" value={q.type} onChange={e => update({ type: e.target.value as Question['type'], a: 0 })}>
                <option value="mc">MC (тандоо)</option>
                <option value="tf">TF (туура/жалган)</option>
                <option value="fill">Fill (толтуруу)</option>
              </select>
            </div>
            {q.type !== 'tf' && (
              <div>
                <label className="label">Туура жооп (индекс)</label>
                <input className="input" type="number" min={0} value={q.a as number} onChange={e => update({ a: +e.target.value })} />
              </div>
            )}
            {q.type === 'tf' && (
              <div>
                <label className="label">Туура жооп</label>
                <select className="input" value={String(q.a)} onChange={e => update({ a: e.target.value === 'true' })}>
                  <option value="true">Туура</option>
                  <option value="false">Жалган</option>
                </select>
              </div>
            )}
          </div>

          {q.type !== 'tf' && (
            <div>
              <label className="label">Варианттар (ар бири жаңы сапта)</label>
              <textarea
                className="input resize-none font-mono text-xs"
                rows={4}
                value={(q.opts ?? []).join('\n')}
                onChange={e => update({ opts: e.target.value.split('\n') })}
              />
            </div>
          )}

          <div>
            <label className="label">Түшүндүрмө (жооп берилгенден кийин)</label>
            <input className="input" value={q.explanation ?? ''} onChange={e => update({ explanation: e.target.value || undefined })} placeholder="Милдеттүү эмес..." />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Lesson editor ─────────────────────────────────────────────────────────────
function LessonEditor({ lesson, onUpdate, onDelete }: {
  lesson: Lesson
  onUpdate: (l: Lesson) => void
  onDelete: () => void
}) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [local, setLocal] = useState(lesson)

  const updateQ = (i: number, q: Question) => setLocal(l => ({ ...l, questions: l.questions.map((x, j) => j === i ? q : x) }))
  const deleteQ = (i: number) => setLocal(l => ({ ...l, questions: l.questions.filter((_, j) => j !== i) }))
  const addQ = () => setLocal(l => ({ ...l, questions: [...l.questions, { type: 'mc', q: '', opts: ['', '', '', ''], a: 0 }] }))

  async function save() {
    setSaving(true)
    try {
      const updated = await api.updateLesson(lesson.id, local)
      onUpdate({ ...local, ...updated })
      toast('Сабак сакталды ✓')
    } catch (e) { toast(e instanceof Error ? e.message : 'Ката', 'err') }
    finally { setSaving(false) }
  }

  async function del() {
    if (!confirm(`"${lesson.title}" сабагын өчүрөсүзбү?`)) return
    try { await api.deleteLesson(lesson.id); onDelete(); toast('Сабак өчүрүлдү') }
    catch (e) { toast(e instanceof Error ? e.message : 'Ката', 'err') }
  }

  return (
    <div className="border border-line rounded-xl overflow-hidden bg-ink/20">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-line/20 transition-colors text-left"
      >
        <GripVertical size={15} className="text-muted/50 shrink-0" />
        <BookOpen size={15} className="text-brand shrink-0" />
        <span className="flex-1 text-sm font-semibold truncate">{lesson.title}</span>
        <span className="text-xs text-muted shrink-0">{lesson.questions.length} суроо</span>
        <button onClick={e => { e.stopPropagation(); del() }} className="text-muted hover:text-rose p-1 shrink-0 transition-colors">
          <Trash2 size={13} />
        </button>
        {open ? <ChevronDown size={15} className="text-muted shrink-0" /> : <ChevronRight size={15} className="text-muted shrink-0" />}
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-line space-y-4">
          <div className="pt-3">
            <label className="label">Сабактын аты</label>
            <input className="input" value={local.title} onChange={e => setLocal(l => ({ ...l, title: e.target.value }))} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="label mb-0">Суроолор</label>
              <button onClick={addQ} className="btn-ghost text-xs px-2.5 py-1.5">
                <Plus size={13} /> Суроо кош
              </button>
            </div>
            {local.questions.map((q, i) => (
              <QuestionEditor key={i} q={q} idx={i} onChange={q => updateQ(i, q)} onDelete={() => deleteQ(i)} />
            ))}
            {local.questions.length === 0 && (
              <div className="text-center py-6 text-muted text-sm border border-dashed border-line rounded-xl">Суроо жок</div>
            )}
          </div>

          <button onClick={save} disabled={saving} className="btn-primary w-full justify-center">
            {saving ? <span className="spin" /> : <><Save size={14} /> Сакта</>}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Module card ───────────────────────────────────────────────────────────────
function ModuleCard({ mod, onUpdate, onDelete }: {
  mod: Module
  onUpdate: (m: Module) => void
  onDelete: () => void
}) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [local, setLocal] = useState(mod)

  async function saveModule() {
    setSaving(true)
    try {
      await api.updateModule(mod.id, { emoji: local.emoji, title: local.title, color: local.color })
      onUpdate({ ...mod, ...local })
      toast('Модул сакталды ✓')
    } catch (e) { toast(e instanceof Error ? e.message : 'Ката', 'err') }
    finally { setSaving(false) }
  }

  async function addLesson() {
    try {
      const updated = await api.addLesson(mod.id, { title: 'Жаңы сабак' })
      onUpdate(updated)
      toast('Сабак кошулду')
    } catch (e) { toast(e instanceof Error ? e.message : 'Ката', 'err') }
  }

  async function del() {
    if (!confirm(`"${mod.title}" модулун өчүрөсүзбү? Бардык сабактар жок болот!`)) return
    try { await api.deleteModule(mod.id); onDelete(); toast('Модул өчүрүлдү') }
    catch (e) { toast(e instanceof Error ? e.message : 'Ката', 'err') }
  }

  const updateLesson = (i: number, l: Lesson) => onUpdate({ ...mod, lessons: mod.lessons.map((x, j) => j === i ? l : x) })
  const deleteLesson = (i: number) => onUpdate({ ...mod, lessons: mod.lessons.filter((_, j) => j !== i) })

  return (
    <div className="card fade-in">
      {/* Module header */}
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-4 text-left">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 font-bold text-white" style={{ background: mod.color || '#0B90E0' }}>
          {mod.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display font-bold truncate">{mod.title}</div>
          <div className="text-xs text-muted mt-0.5">{mod.lessons.length} сабак · {mod.id}-бөлүм</div>
        </div>
        <button onClick={e => { e.stopPropagation(); del() }} className="text-muted hover:text-rose p-2 transition-colors">
          <Trash2 size={16} />
        </button>
        {open ? <ChevronDown size={18} className="text-muted shrink-0" /> : <ChevronRight size={18} className="text-muted shrink-0" />}
      </button>

      {open && (
        <div className="mt-4 pt-4 border-t border-line space-y-4">
          {/* Module fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Аты</label>
              <input className="input" value={local.title} onChange={e => setLocal(l => ({ ...l, title: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label">Emoji</label>
                <input className="input" value={local.emoji} onChange={e => setLocal(l => ({ ...l, emoji: e.target.value }))} />
              </div>
              <div>
                <label className="label">Түс</label>
                <div className="flex gap-2 items-center">
                  <input type="color" className="h-10 w-12 rounded-lg border border-line bg-ink cursor-pointer" value={local.color} onChange={e => setLocal(l => ({ ...l, color: e.target.value }))} />
                  <input className="input flex-1" value={local.color} onChange={e => setLocal(l => ({ ...l, color: e.target.value }))} />
                </div>
              </div>
            </div>
          </div>
          <button onClick={saveModule} disabled={saving} className="btn-primary">
            {saving ? <span className="spin" /> : <><Save size={14} /> Модулду сакта</>}
          </button>

          {/* Lessons */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-sm">Сабактар ({mod.lessons.length})</div>
              <button onClick={addLesson} className="btn-primary text-xs px-3 py-1.5">
                <Plus size={13} /> Сабак кош
              </button>
            </div>
            <div className="space-y-2">
              {mod.lessons.map((l, i) => (
                <LessonEditor key={l.id} lesson={l}
                  onUpdate={nl => updateLesson(i, nl)}
                  onDelete={() => deleteLesson(i)}
                />
              ))}
              {mod.lessons.length === 0 && (
                <div className="text-center py-8 text-muted text-sm border border-dashed border-line rounded-xl">Сабак жок — кошуңуз</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Modules page ──────────────────────────────────────────────────────────────
export function Modules() {
  const { toast } = useToast()
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const mods = await api.modules()
      setModules(mods.sort((a, b) => a.id - b.id))
    } catch (e) { toast(e instanceof Error ? e.message : 'Ката', 'err') }
    finally { setLoading(false) }
  }, [toast])

  useEffect(() => { load() }, [load])

  async function addModule() {
    try {
      const list = await api.addModule({ emoji: '📚', title: 'Жаңы модул', color: '#0B90E0' })
      setModules((list as Module[]).sort((a, b) => a.id - b.id))
      toast('Модул кошулду')
    } catch (e) { toast(e instanceof Error ? e.message : 'Ката', 'err') }
  }

  if (loading) return <div className="p-8 flex justify-center"><span className="spin text-brand" style={{ width: 28, height: 28, borderWidth: 3 }} /></div>

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Контент</h1>
          <p className="text-muted text-sm mt-1">{modules.length} модул · {modules.reduce((a, m) => a + m.lessons.length, 0)} сабак</p>
        </div>
        <button onClick={addModule} className="btn-primary">
          <Plus size={16} /> Модул кош
        </button>
      </div>

      <div className="space-y-4">
        {modules.map(mod => (
          <ModuleCard
            key={mod.id}
            mod={mod}
            onUpdate={m => setModules(ms => ms.map(x => x.id === m.id ? m : x))}
            onDelete={() => setModules(ms => ms.filter(x => x.id !== mod.id))}
          />
        ))}
        {modules.length === 0 && (
          <div className="card text-center py-12 text-muted">Модулдар жок — кошуңуз</div>
        )}
      </div>
    </div>
  )
}
