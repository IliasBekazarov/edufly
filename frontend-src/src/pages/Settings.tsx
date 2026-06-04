import { useState } from 'react'
import { Volume2, Sparkles, Globe, Mail, Shield, Info, LogOut } from 'lucide-react'
import type { User } from '../types'

interface SettingsProps {
  user: User | null
  onLogout: () => void
}

export function Settings({ user, onLogout }: SettingsProps) {
  const [sound, setSound] = useState(() => localStorage.getItem('fl_sound') !== 'off')
  const [anim, setAnim]   = useState(() => localStorage.getItem('fl_anim')  !== 'off')

  function toggle(key: string, val: boolean, set: (v: boolean) => void) {
    set(val)
    localStorage.setItem(key, val ? 'on' : 'off')
  }

  return (
    <div className="max-w-[480px] mx-auto px-4 lg:px-6 pt-5 lg:pt-8 pb-10">

      <h1 className="font-display font-bold text-2xl mb-6 text-text animate-slide-up">
        Орнотуулар
      </h1>

      {/* ── App preferences ───────────────────────── */}
      <div className="mb-4 animate-slide-up">
        <div
          className="px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-muted mb-1"
        >
          Колдонмо
        </div>
        <div className="glass overflow-hidden">
          <ToggleRow
            icon={<Volume2 size={17} />}
            label="Үн эффекттери"
            desc="Туура/туура эмес жооптого үн"
            value={sound}
            onChange={v => toggle('fl_sound', v, setSound)}
          />
          <ToggleRow
            icon={<Sparkles size={17} />}
            label="Анимациялар"
            desc="Конфетти, буулуу эффекттери"
            value={anim}
            onChange={v => toggle('fl_anim', v, setAnim)}
            last
          />
        </div>
      </div>

      {/* ── About ─────────────────────────────────── */}
      <div className="mb-6 animate-slide-up">
        <div className="px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-muted mb-1">
          Жөнүндө
        </div>
        <div className="glass overflow-hidden">
          <InfoRow icon={<Globe   size={17} />} label="Сайт"      value="may.caim.dev" />
          <InfoRow icon={<Mail    size={17} />} label="Кат"       value="developercaim@gmail.com" />
          <InfoRow icon={<Shield  size={17} />} label="Купуялык"  value="Маалыматыңды эч кимге бербейбиз." />
          <InfoRow icon={<Info    size={17} />} label="Версия"    value="2026.05" last />
        </div>
      </div>

      {user && (
        <button
          className="btn3d rose full animate-slide-up"
          onClick={onLogout}
        >
          <LogOut size={16} />
          Чыгуу
        </button>
      )}

      <div className="text-center text-[11px] text-muted mt-8 animate-fade-in">
        FinLingvo · Кыргызча финансылык сабатуулук
      </div>
    </div>
  )
}

function ToggleRow({
  icon, label, desc, value, onChange, last = false,
}: {
  icon: React.ReactNode
  label: string
  desc: string
  value: boolean
  onChange: (v: boolean) => void
  last?: boolean
}) {
  return (
    <div
      className="px-4 py-3.5 flex items-center justify-between"
      style={{ borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'rgba(255,255,255,0.07)', color: '#5E7194' }}
        >
          {icon}
        </div>
        <div>
          <div className="text-sm font-semibold text-text">{label}</div>
          <div className="text-[11px] text-muted">{desc}</div>
        </div>
      </div>
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className="toggle-track shrink-0 ml-4"
        style={{
          background: value
            ? 'linear-gradient(135deg, #5B6EF0, #A78BFA)'
            : 'rgba(255,255,255,0.09)',
          boxShadow: value ? '0 0 16px rgba(91,110,240,.35)' : 'none',
        }}
      >
        <span
          className="toggle-thumb"
          style={{ transform: value ? 'translateX(20px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  )
}

function InfoRow({
  icon, label, value, last = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  last?: boolean
}) {
  return (
    <div
      className="px-4 py-3.5 flex items-center gap-3"
      style={{ borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.06)' }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: 'rgba(255,255,255,0.07)', color: '#5E7194' }}
      >
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-text">{label}</div>
        <div className="text-[11px] text-muted">{value}</div>
      </div>
    </div>
  )
}
