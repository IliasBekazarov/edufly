import { useState } from 'react'
import { Gem, Zap } from 'lucide-react'
import { EmojiIcon } from '../components/EmojiIcon'
import { api } from '../api'
import { setUser } from '../hooks/useApp'
import type { ShopItem, User } from '../types'

interface ShopProps {
  items: ShopItem[]
  user: User | null
}

export function Shop({ items, user }: ShopProps) {
  const [buying, setBuying] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const gems = user?.state.gems ?? 0
  const owned = new Set(user?.state.ownedShop ?? [])
  const boostActive = !!(user?.state.boostExpiresAt && user.state.boostExpiresAt > Date.now())

  async function buy(item: ShopItem) {
    if (!user) return
    setBuying(item.id)
    setError(null)
    try {
      const updated = await api.buyItem(item)
      setUser(updated)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ката чыкты')
    } finally {
      setBuying(null)
    }
  }

  return (
    <div className="max-w-[640px] mx-auto px-4 lg:px-6 pt-4 lg:pt-8">
      {/* Header */}
      <div className="glass p-5 mb-6 flex items-center justify-between">
        <div>
          <div className="text-xs text-muted uppercase tracking-wider font-bold">ДҮКӨН</div>
          <div className="font-display font-bold text-xl">Гемдериңди жумша</div>
        </div>
        <div className="stat-pill" style={{ color: '#1CB0F6' }}>
          <Gem size={18} fill="#1CB0F6" />
          {gems}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-2xl bg-rose/15 border border-rose/40 text-rose text-sm">
          {error}
        </div>
      )}

      {/* Items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {items.map(item => {
          const canAfford = gems >= item.price
          const isConsumable = item.id === 'hearts' || item.id === 'xp2x'
          const isBoostItem = item.id === 'xp2x'
          const alreadyOwned = !isConsumable && owned.has(item.id)
          const isLoading = buying === item.id
          const blocked = alreadyOwned || (isBoostItem && boostActive)

          return (
            <div key={item.id} className="glass p-4 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand/15 flex items-center justify-center shrink-0">
                  <EmojiIcon emoji={item.emoji} size={22} color="#0B90E0" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-text">{item.title}</div>
                  <div className="text-[11px] text-muted mt-0.5">{item.desc}</div>
                </div>
              </div>
              <button
                disabled={!user || !canAfford || blocked || isLoading}
                onClick={() => buy(item)}
                className={`btn3d full text-xs py-2.5 ${blocked ? 'ghost' : !canAfford ? 'ghost opacity-60' : ''}`}
              >
                {isLoading
                  ? <span className="spin" />
                  : alreadyOwned
                  ? 'Сатып алынган'
                  : isBoostItem && boostActive
                  ? <><Zap size={13} /> Активдүү</>
                  : (
                    <>
                      <Gem size={14} />
                      {item.price}
                      {!canAfford && ' · ЖЕТПЕЙТ'}
                    </>
                  )
                }
              </button>
            </div>
          )
        })}
      </div>

      <div className="glass p-4 text-sm text-muted">
        <div className="font-bold text-text mb-1">Гемди кантип табам?</div>
        Сабак өткөргөндө +20 гем, кемчиликсиз өткөнүн үчүн +5.
        Күнүмдүк баштоого +30 гем кошулат.
      </div>
    </div>
  )
}
