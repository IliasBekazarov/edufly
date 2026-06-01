import { useEffect, useState } from 'react'
import { Users, BookOpen, Star, Gem, Activity, TrendingUp, type LucideIcon } from 'lucide-react'
import { api } from '../api'

interface Stats {
  modules: number; lessons: number; questions: number
  users: number; active_users_7d: number; active_users_1d: number
  total_user_xp: number; total_user_lessons: number
  achievements: number; shop_items: number; leagues: number
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: LucideIcon
  label: string
  value: string | number
  color: string
}) {
  return (
    <div className="card flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: color + '18' }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div className="text-2xl font-display font-bold text-text">{value}</div>
        <div className="text-xs text-muted font-medium mt-0.5">{label}</div>
      </div>
    </div>
  )
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.stats()
      .then(s => { setStats(s as unknown as Stats); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8 flex items-center justify-center"><span className="spin text-brand" style={{ width: 28, height: 28, borderWidth: 3 }} /></div>
  if (!stats) return <div className="p-8 text-muted text-center">Маалымат жүктөлгөн жок</div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold">Башкы бет</h1>
        <p className="text-muted text-sm mt-1">Платформанын жалпы абалы</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon={Users}      label="Колдонуучулар"     value={stats.users}           color="#0B90E0" />
        <StatCard icon={Activity}   label="Акт. (7 күн)"      value={stats.active_users_7d} color="#1CB0F6" />
        <StatCard icon={Activity}   label="Акт. (бүгүн)"      value={stats.active_users_1d} color="#CE82FF" />
        <StatCard icon={BookOpen}   label="Модулдар"           value={stats.modules}         color="#FF9600" />
        <StatCard icon={BookOpen}   label="Сабактар"           value={stats.lessons}         color="#FF9600" />
        <StatCard icon={Star}       label="Суроолор"           value={stats.questions}       color="#FFD900" />
        <StatCard icon={TrendingUp} label="Жалпы XP"          value={stats.total_user_xp.toLocaleString()} color="#0B90E0" />
        <StatCard icon={BookOpen}   label="Аяктаган сабактар" value={stats.total_user_lessons} color="#0B90E0" />
        <StatCard icon={Gem}        label="Дүкөн буюмдары"    value={stats.shop_items}       color="#1CB0F6" />
      </div>

      <div className="card">
        <div className="font-display font-bold mb-4">Контент</div>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: 'Модулдар', value: stats.modules },
            { label: 'Сабактар', value: stats.lessons },
            { label: 'Суроолор', value: stats.questions },
          ].map(s => (
            <div key={s.label} className="bg-ink rounded-xl p-3 border border-line">
              <div className="font-display font-bold text-2xl text-brand">{s.value}</div>
              <div className="text-xs text-muted mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
