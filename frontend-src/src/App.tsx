import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './hooks/useApp'
import { Layout } from './components/Layout'
import { Learn } from './pages/Learn'
import { League } from './pages/League'
import { Shop } from './pages/Shop'
import { Profile } from './pages/Profile'
import { Settings } from './pages/Settings'
import { Lesson } from './pages/Lesson'
import { Auth } from './pages/Auth'
import { Mascot } from './components/Mascot'

export default function App() {
  const { user, content, loading, contentLoading, login, signup, logout } = useApp()

  if (loading || contentLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Mascot size={72} className="animate-floaty" />
        <div className="text-muted text-sm">Жүктөлүүдө...</div>
      </div>
    )
  }

  const modules = content?.modules ?? []
  const achievements = content?.achievements ?? []
  const leagues = content?.leagues ?? []
  const shopItems = content?.shop_items ?? []
  const authed = !!user

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={authed ? <Navigate to="/learn" replace /> : <Auth onLogin={login} onSignup={signup} />} />
        <Route element={authed ? <Layout user={user} /> : <Navigate to="/login" replace />}>
          <Route index element={<Navigate to="/learn" replace />} />
          <Route path="/learn" element={<Learn modules={modules} user={user} />} />
          <Route path="/lesson/:id" element={<Lesson modules={modules} user={user} />} />
          <Route path="/leaderboard" element={<League leagues={leagues} user={user} />} />
          <Route path="/shop" element={<Shop items={shopItems} user={user} />} />
          <Route path="/profile" element={<Profile user={user} achievements={achievements} modules={modules} leagues={leagues} />} />
          <Route path="/settings" element={<Settings user={user} onLogout={logout} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
