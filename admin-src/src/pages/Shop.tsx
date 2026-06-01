import { useEffect, useState, useCallback } from 'react'
import { Save, Trash2 } from 'lucide-react'
import { api } from '../api'
import { useToast } from '../App'
import type { ShopItem, Achievement, League } from '../types'

function JsonEditor<T extends object>({ title, data, onSave, fields }: {
  title: string
  data: T[]
  onSave: (items: T[]) => Promise<void>
  fields: { key: keyof T; label: string; type?: string }[]
}) {
  const { toast } = useToast()
  const [items, setItems] = useState<T[]>(data)
  const [saving, setSaving] = useState(false)

  useEffect(() => { setItems(data) }, [data])

  const update = (i: number, key: keyof T, val: string) =>
    setItems(list => list.map((x, j) => j === i ? { ...x, [key]: key === 'price' || key === 'xp' || key === 'minXp' ? +val : val } : x))

  const del = (i: number) => setItems(list => list.filter((_, j) => j !== i))

  async function save() {
    setSaving(true)
    try { await onSave(items); toast(`${title} сакталды ✓`) }
    catch (e) { toast(e instanceof Error ? e.message : 'Ката', 'err') }
    finally { setSaving(false) }
  }

  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-lg">{title}</h2>
        <button onClick={save} disabled={saving} className="btn-primary">
          {saving ? <span className="spin" /> : <><Save size={14} /> Сакта</>}
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="bg-ink border border-line rounded-xl p-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {fields.map(f => (
                <div key={String(f.key)}>
                  <label className="label">{f.label}</label>
                  <input
                    className="input"
                    type={f.type ?? 'text'}
                    value={String(item[f.key] ?? '')}
                    onChange={e => update(i, f.key, e.target.value)}
                  />
                </div>
              ))}
              <div className="flex items-end">
                <button onClick={() => del(i)} className="btn-danger w-full justify-center">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-6 text-muted text-sm border border-dashed border-line rounded-xl">Бош</div>
        )}
      </div>
    </div>
  )
}

export function ShopPage() {
  const { toast } = useToast()
  const [shop, setShop] = useState<ShopItem[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [leagues, setLeagues] = useState<League[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const c = await api.content() as { shop_items: ShopItem[]; achievements: Achievement[]; leagues: League[] }
      setShop(c.shop_items ?? [])
      setAchievements(c.achievements ?? [])
      setLeagues(c.leagues ?? [])
    } catch (e) { toast(e instanceof Error ? e.message : 'Ката', 'err') }
    finally { setLoading(false) }
  }, [toast])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="p-8 flex justify-center"><span className="spin text-brand" style={{ width: 28, height: 28, borderWidth: 3 }} /></div>

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-display font-bold mb-6">Дүкөн · Жетишкендиктер · Лигалар</h1>

      <JsonEditor
        title="Дүкөн буюмдары"
        data={shop}
        onSave={items => api.updateShop(items).then(() => setShop(items as ShopItem[]))}
        fields={[
          { key: 'id', label: 'ID' },
          { key: 'emoji', label: 'Emoji' },
          { key: 'title', label: 'Аты' },
          { key: 'desc', label: 'Сүрөттөмө' },
          { key: 'price', label: 'Баасы (гем)', type: 'number' },
        ]}
      />

      <JsonEditor
        title="Жетишкендиктер"
        data={achievements}
        onSave={items => api.updateAchievements(items).then(() => setAchievements(items as Achievement[]))}
        fields={[
          { key: 'id', label: 'ID' },
          { key: 'emoji', label: 'Emoji' },
          { key: 'title', label: 'Аты' },
          { key: 'desc', label: 'Сүрөттөмө' },
          { key: 'xp', label: 'Бонус XP', type: 'number' },
        ]}
      />

      <JsonEditor
        title="Лигалар"
        data={leagues}
        onSave={items => api.updateLeagues(items).then(() => setLeagues(items as League[]))}
        fields={[
          { key: 'id', label: 'ID' },
          { key: 'emoji', label: 'Emoji' },
          { key: 'name', label: 'Аты' },
          { key: 'minXp', label: 'Мин XP', type: 'number' },
          { key: 'color', label: 'Түс' },
        ]}
      />
    </div>
  )
}
