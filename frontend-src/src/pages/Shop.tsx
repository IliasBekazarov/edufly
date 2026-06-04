import { useState } from 'react'
import { Gem, Zap, ShoppingBag } from 'lucide-react'
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
    <div className="max-w-[640px] mx-auto px-4 lg:px-6 pt-5 lg:pt-8">

      {/* ── Header ────────────────────────────────── */}
      <div className="glass-elevated p-5 mb-5 flex items-center justify-between animate-slide-up">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #38BDF8, #5B6EF0)' }}
          >
            <ShoppingBag size={20} className="text-white" />
          </div>
          <div>
            <div className="text-[11px] text-muted uppercase tracking-widest font-bold">ДҮКӨН</div>
            <div className="font-display font-bold text-lg text-text">Гемдериңди жумша</div>
          </div>
        </div>
        <div
          className="stat-pill text-base"
          style={{ color: '#38BDF8', borderColor: 'rgba(56,189,248,.25)', background: 'rgba(56,189,248,.1)' }}
        >
          <Gem size={17} fill="#38BDF8" />
          {gems}
        </div>
      </div>

      {error && (
        <div
          className="mb-4 p-3.5 rounded-xl text-sm flex items-center gap-2 animate-slide-up"
          style={{ background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.3)', color: '#FCA5A5' }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* ── Items grid ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {items.map(item => {
          const canAfford = gems >= item.price
          const isConsumable = item.id === 'hearts' || item.id === 'xp2x'
          const isBoostItem = item.id === 'xp2x'
          const alreadyOwned = !isConsumable && owned.has(item.id)
          const isLoading = buying === item.id
          const blocked = alreadyOwned || (isBoostItem && boostActive)

          return (
            <div
              key={item.id}
              className="glass p-4 flex flex-col gap-3 transition-all duration-200 hover:border-white/[0.12] animate-slide-up"
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(91,110,240,.2), rgba(167,139,250,.15))', border: '1px solid rgba(91,110,240,.2)' }}
                >
                  <EmojiIcon emoji={item.emoji} size={22} color="#818CF8" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-text">{item.title}</div>
                  <div className="text-[11px] text-muted mt-0.5 leading-snug">{item.desc}</div>
                </div>
              </div>
              <button
                disabled={!user || !canAfford || blocked || isLoading}
                onClick={() => buy(item)}
                className={`btn3d full text-xs py-2.5 ${blocked ? 'ghost' : !canAfford ? 'ghost opacity-50' : ''}`}
              >
                {isLoading
                  ? <span className="spin" />
                  : alreadyOwned
                  ? '✓ Сатып алынган'
                  : isBoostItem && boostActive
                  ? <><Zap size={13} /> Активдүү</>
                  : (
                    <>
                      <Gem size={13} />
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

      {/* ── Info card ─────────────────────────────── */}
      <div
        className="glass p-4 text-sm animate-fade-in"
        style={{ border: '1px solid rgba(56,189,248,.15)', background: 'rgba(56,189,248,.05)' }}
      >
        <div className="font-bold text-text mb-1 flex items-center gap-1.5">
          <Gem size={14} style={{ color: '#38BDF8' }} /> Гемди кантип табам?
        </div>
        <div className="text-muted text-xs leading-relaxed">
          Сабак өткөргөндө <span className="text-sky font-bold">+20 гем</span>, кемчиликсиз өткөнүн үчүн{' '}
          <span className="text-sky font-bold">+5</span>. Күнүмдүк баштоого{' '}
          <span className="text-sky font-bold">+30 гем</span> кошулат.
        </div>
      </div>

    </div>
  )
}
