import { useEffect, useState, useCallback } from 'react'
import { Search, Trash2, RotateCcw, ChevronDown, ChevronRight, Flame, Star, BookOpen } from 'lucide-react'
import { api } from '../api'
import { useToast } from '../App'
import type { AdminUser } from '../types'

function UserRow({ user, onUpdate, onDelete }: {
  user: AdminUser
  onUpdate: (u: AdminUser) => void
  onDelete: () => void
}) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)

  async function reset() {
    if (!confirm(`${user.name} колдонуучусунун прогрессин нөлдөтөсүзбү?`)) return
    try { const u = await api.resetUser(user.id); onUpdate(u); toast('Прогресс нөлдөтүлдү') }
    catch (e) { toast(e instanceof Error ? e.message : 'Ката', 'err') }
  }

  async function del() {
    if (!confirm(`${user.name} колдонуучусун өчүрөсүзбү?`)) return
    try { await api.deleteUser(user.id); onDelete(); toast('Колдонуучу өчүрүлдү') }
    catch (e) { toast(e instanceof Error ? e.message : 'Ката', 'err') }
  }

  const initials = user.name.slice(0, 2).toUpperCase()

  return (
    <div className="border-b border-line last:border-0">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-line/20 transition-colors text-left">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ background: '#0B90E0' }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate">{user.name}</div>
          <div className="text-xs text-muted truncate">{user.email}</div>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-xs text-muted shrink-0">
          <span className="flex items-center gap-1"><Star size={11} className="text-sun" /> {user.state.xp} XP</span>
          <span className="flex items-center gap-1"><Flame size={11} className="text-warm" /> {user.state.streak}</span>
          <span className="flex items-center gap-1"><BookOpen size={11} className="text-sky" /> {user.state.completedLessons.length}</span>
        </div>
        {open ? <ChevronDown size={15} className="text-muted shrink-0" /> : <ChevronRight size={15} className="text-muted shrink-0" />}
      </button>

      {open && (
        <div className="px-5 pb-4 border-t border-line bg-ink/30">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4">
            {[
              { label: 'XP', value: user.state.xp, color: 'text-sun' },
              { label: 'Гем', value: user.state.gems, color: 'text-sky' },
              { label: 'Жан', value: user.state.hearts, color: 'text-rose' },
              { label: 'Серия', value: user.state.streak, color: 'text-warm' },
            ].map(s => (
              <div key={s.label} className="bg-ink rounded-xl p-3 border border-line text-center">
                <div className={`font-display font-bold text-xl ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="text-xs text-muted mb-3">
            Катталган: {new Date(user.createdAt).toLocaleDateString('ky')} ·
            Акыркы: {new Date(user.lastSeenAt).toLocaleDateString('ky')}
          </div>
          <div className="flex gap-2">
            <button onClick={reset} className="btn-ghost text-xs">
              <RotateCcw size={13} /> Прогрессти нөлдөт
            </button>
            <button onClick={del} className="btn-danger text-xs">
              <Trash2 size={13} /> Өчүр
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function UsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('xp')

  const load = useCallback(async () => {
    setLoading(true)
    try { setUsers(await api.users(q || undefined, sort)) }
    catch (e) { toast(e instanceof Error ? e.message : 'Ката', 'err') }
    finally { setLoading(false) }
  }, [q, sort, toast])

  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
  }, [load])

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Колдонуучулар</h1>
          <p className="text-muted text-sm mt-1">{users.length} колдонуучу</p>
        </div>
      </div>

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input pl-9" placeholder="Аты же email..." value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <select className="input w-40" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="xp">XP боюнча</option>
          <option value="recent">Акыркы</option>
          <option value="newest">Жаңы</option>
          <option value="streak">Серия</option>
        </select>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading
          ? <div className="p-8 flex justify-center"><span className="spin text-brand" style={{ width: 24, height: 24, borderWidth: 3 }} /></div>
          : users.length === 0
          ? <div className="p-8 text-center text-muted text-sm">Колдонуучу табылган жок</div>
          : users.map(u => (
              <UserRow key={u.id} user={u}
                onUpdate={nu => setUsers(us => us.map(x => x.id === nu.id ? nu : x))}
                onDelete={() => setUsers(us => us.filter(x => x.id !== u.id))}
              />
            ))
        }
      </div>
    </div>
  )
}
