import type { Content, User, UserState, LeaderboardEntry, ShopItem } from './types'

const BASE = '/admin/api'

function authHeader(): Record<string, string> {
  const token = localStorage.getItem('fl_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json', ...authHeader(), ...opts?.headers },
    ...opts,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data as T
}

export const api = {
  content: (): Promise<Content> => req('/public/content'),

  signup: (body: { name: string; email: string; password: string }) =>
    req<{ token: string; user: User }>('/u/signup', { method: 'POST', body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    req<{ token: string; user: User }>('/u/login', { method: 'POST', body: JSON.stringify(body) }),

  me: (): Promise<User> => req('/u/me'),

  patchState: (patch: Partial<UserState>): Promise<User> =>
    req('/u/me/state', { method: 'PATCH', body: JSON.stringify(patch) }),

  completeLesson: (body: { lessonId: string; mistakes: number; isReview: boolean }) =>
    req<{ user: User; reward: { xp: number; gems: number; perfect: boolean; isReview: boolean } }>('/u/me/lesson', { method: 'POST', body: JSON.stringify(body) }),

  buyItem: (item: ShopItem): Promise<User> =>
    req('/u/me/buy', { method: 'POST', body: JSON.stringify({ itemId: item.id, price: item.price, kind: item.id }) }),

  claimDaily: (): Promise<{ user: User; bonus: { applied: boolean; gems: number } }> =>
    req('/u/me/daily', { method: 'POST' }),

  leaderboard: (limit = 30): Promise<LeaderboardEntry[]> =>
    req(`/u/leaderboard?limit=${limit}`),
}
