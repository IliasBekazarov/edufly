import { useEffect, useState, useCallback } from 'react'
import { Upload, Trash2, Save } from 'lucide-react'
import { api } from '../api'
import { useToast } from '../App'
import type { Module } from '../types'

export function MascotsPage() {
  const { toast } = useToast()
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState<Record<number, File>>({})
  const [urls, setUrls] = useState<Record<number, string>>({})
  const [saving, setSaving] = useState<number | null>(null)

  const load = useCallback(async () => {
    try {
      const mods = await api.modules()
      setModules(mods.sort((a, b) => a.id - b.id))
      const initUrls: Record<number, string> = {}
      mods.forEach(m => { if (m.mascotImage) initUrls[m.id] = m.mascotImage })
      setUrls(initUrls)
    } catch (e) { toast(e instanceof Error ? e.message : 'Ката', 'err') }
    finally { setLoading(false) }
  }, [toast])

  useEffect(() => { load() }, [load])

  function onFile(modId: number, file: File) {
    if (file.size > 6 * 1024 * 1024) { toast('Файл өтө чоң (мак. 6 MB)', 'err'); return }
    setPending(p => ({ ...p, [modId]: file }))
    const reader = new FileReader()
    reader.onload = e => setUrls(u => ({ ...u, [modId]: e.target?.result as string }))
    reader.readAsDataURL(file)
  }

  function onDrop(e: React.DragEvent, modId: number) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) onFile(modId, file)
  }

  async function save(modId: number) {
    setSaving(modId)
    try {
      let imageUrl: string | null = urls[modId] || null

      if (pending[modId]) {
        const reader = new FileReader()
        const b64 = await new Promise<string>(res => {
          reader.onload = e => res(e.target?.result as string)
          reader.readAsDataURL(pending[modId])
        })
        const r = await api.upload(b64, pending[modId].name)
        imageUrl = r.url
        setPending(p => { const n = { ...p }; delete n[modId]; return n })
      }

      await api.updateModule(modId, { mascotImage: imageUrl })
      setModules(ms => ms.map(m => m.id === modId ? { ...m, mascotImage: imageUrl ?? undefined } : m))
      toast('Сакталды ✓')
    } catch (e) { toast(e instanceof Error ? e.message : 'Ката', 'err') }
    finally { setSaving(null) }
  }

  async function remove(modId: number) {
    if (!confirm('Сүрөттү өчүрөсүзбү?')) return
    setSaving(modId)
    try {
      await api.updateModule(modId, { mascotImage: null })
      setUrls(u => { const n = { ...u }; delete n[modId]; return n })
      setModules(ms => ms.map(m => m.id === modId ? { ...m, mascotImage: undefined } : m))
      toast('Өчүрүлдү')
    } catch (e) { toast(e instanceof Error ? e.message : 'Ката', 'err') }
    finally { setSaving(null) }
  }

  if (loading) return <div className="p-8 flex justify-center"><span className="spin text-brand" style={{ width: 28, height: 28, borderWidth: 3 }} /></div>

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold">Дух беруучу сүрөттөр</h1>
        <p className="text-muted text-sm mt-1">Ар бир модулдун башына сүрөт коюңуз</p>
      </div>

      <div className="space-y-4">
        {modules.map(mod => {
          const preview = urls[mod.id]
          const hasPending = !!pending[mod.id]
          const isSaving = saving === mod.id

          return (
            <div key={mod.id} className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: mod.color + '22', border: `1px solid ${mod.color}44` }}>
                  {mod.emoji}
                </div>
                <div>
                  <div className="font-semibold text-sm">{mod.title}</div>
                  <div className="text-xs text-muted">{mod.id}-бөлүм</div>
                </div>
                {mod.mascotImage && !hasPending && (
                  <span className="ml-auto badge bg-brand/10 text-brand text-[10px]">✓ Сүрөт бар</span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Drop zone */}
                <label
                  className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-line rounded-xl p-6 cursor-pointer hover:border-brand/50 hover:bg-brand/5 transition-all text-center"
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => onDrop(e, mod.id)}
                >
                  <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && onFile(mod.id, e.target.files[0])} />
                  <Upload size={20} className="text-muted" />
                  <div className="text-sm text-muted">
                    <span className="text-brand font-semibold">Файл тандоо</span><br />
                    <span className="text-xs">же сүйрөп таштаңыз</span>
                  </div>
                </label>

                {/* Preview */}
                {preview ? (
                  <div className="relative rounded-xl overflow-hidden border border-line bg-ink" style={{ minHeight: 120 }}>
                    <img src={preview} alt="" className="w-full h-full object-contain max-h-40" />
                    {hasPending && (
                      <div className="absolute top-2 right-2 badge bg-warm/10 text-warm text-[10px]">Жүктөлгөн жок</div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center rounded-xl border border-dashed border-line bg-ink" style={{ minHeight: 120 }}>
                    <span className="text-muted text-sm">Preview жок</span>
                  </div>
                )}
              </div>

              {/* URL input */}
              <div className="mt-3">
                <label className="label">URL (же жогорудан файл тандаңыз)</label>
                <input
                  className="input"
                  type="url"
                  placeholder="https://..."
                  value={preview?.startsWith('http') ? preview : ''}
                  onChange={e => {
                    const v = e.target.value
                    setPending(p => { const n = { ...p }; delete n[mod.id]; return n })
                    setUrls(u => ({ ...u, [mod.id]: v }))
                  }}
                />
              </div>

              <div className="flex gap-2 mt-3">
                <button onClick={() => save(mod.id)} disabled={isSaving} className="btn-primary flex-1 justify-center">
                  {isSaving ? <span className="spin" /> : <><Save size={14} /> Сакта</>}
                </button>
                {(mod.mascotImage || preview) && (
                  <button onClick={() => remove(mod.id)} disabled={isSaving} className="btn-danger">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
