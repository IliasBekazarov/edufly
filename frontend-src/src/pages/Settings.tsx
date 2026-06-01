import { useState } from 'react'
import { Volume2, Sparkles, Globe, Mail, Shield, Info } from 'lucide-react'
import type { User } from '../types'

interface SettingsProps {
  user: User | null
  onLogout: () => void
}

export function Settings({ user, onLogout }: SettingsProps) {
  const [sound, setSound] = useState(() => localStorage.getItem('fl_sound') !== 'off')
  const [anim, setAnim] = useState(() => localStorage.getItem('fl_anim') !== 'off')

  function toggle(key: string, val: boolean, set: (v: boolean) => void) {
    set(val)
    localStorage.setItem(key, val ? 'on' : 'off')
  }

  return (
    <div className="max-w-[480px] mx-auto px-4 lg:px-6 pt-4 lg:pt-8">
      <div className="font-display font-bold text-2xl mb-6">Орнотуулар</div>

      {/* Preferences */}
      <div className="glass overflow-hidden mb-6">
        <div className="px-4 py-2 text-[11px] uppercase tracking-wider font-bold text-muted border-b border-line">
          Колдонмо
        </div>
        <ToggleRow
          icon={<Volume2 size={18} />}
          label="Үн эффекттери"
          desc="Туура/туура эмес жооптого үн"
          value={sound}
          onChange={v => toggle('fl_sound', v, setSound)}
        />
        <ToggleRow
          icon={<Sparkles size={18} />}
          label="Анимациялар"
          desc="Конфетти, буулуу эффекттери"
          value={anim}
          onChange={v => toggle('fl_anim', v, setAnim)}
        />
      </div>

      {/* About */}
      <div className="glass overflow-hidden mb-6">
        <div className="px-4 py-2 text-[11px] uppercase tracking-wider font-bold text-muted border-b border-line">
          Жөнүндө
        </div>
        <InfoRow icon={<Globe size={18} />} label="Сайт" value="may.caim.dev" />
        <InfoRow icon={<Mail size={18} />} label="Кат" value="developercaim@gmail.com" />
        <InfoRow icon={<Shield size={18} />} label="Купуялык" value="Маалыматыңды эч кимге бербейбиз." />
        <InfoRow icon={<Info size={18} />} label="Версия" value="2026.05" />
      </div>

      {user && (
        <button className="btn3d rose full" onClick={onLogout}>
          Чыгуу
        </button>
      )}

      <div className="text-center text-[11px] text-muted mt-8">
        FinLingvo · Кыргызча финансылык сабатуулук
      </div>
    </div>
  )
}

function ToggleRow({
  icon, label, desc, value, onChange,
}: {
  icon: React.ReactNode
  label: string
  desc: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="px-4 py-3 flex items-center justify-between border-b border-line last:border-b-0">
      <div className="flex items-center gap-3">
        <span className="text-muted">{icon}</span>
        <div>
          <div className="text-sm font-semibold text-text">{label}</div>
          <div className="text-[11px] text-muted">{desc}</div>
        </div>
      </div>
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full relative transition-colors ${value ? 'bg-brand' : 'bg-line2'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : ''}`}
        />
      </button>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="px-4 py-3 flex items-center gap-3 border-b border-line last:border-b-0">
      <span className="text-muted">{icon}</span>
      <div className="flex-1">
        <div className="text-sm font-semibold text-text">{label}</div>
        <div className="text-[11px] text-muted">{value}</div>
      </div>
    </div>
  )
}
