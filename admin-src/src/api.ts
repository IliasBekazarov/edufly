const BASE = '/admin/api'
let _token: string | null = localStorage.getItem('fl_admin_token')

export const auth = {
  get token() { return _token },
  set(t: string) { _token = t; localStorage.setItem('fl_admin_token', t) },
  clear() { _token = null; localStorage.removeItem('fl_admin_token') },
}

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(_token ? { Authorization: `Bearer ${_token}` } : {}),
      ...opts?.headers,
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Ката чыкты')
  return data as T
}

export const api = {
  login:   (password: string) => req<{ token: string }>('/login', { method: 'POST', body: JSON.stringify({ password }) }),
  me:      () => req<{ ok: boolean; role: string }>('/me'),
  stats:   () => req<Record<string, number | string>>('/stats'),
  content: () => req<Record<string, unknown>>('/content'),

  modules:      () => req<import('./types').Module[]>('/modules'),
  addModule:    (d: object) => req<import('./types').Module[]>('/modules', { method: 'POST', body: JSON.stringify(d) }),
  updateModule: (id: number, d: object) => req<import('./types').Module>(`/modules/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  deleteModule: (id: number) => req<{ ok: boolean }>(`/modules/${id}`, { method: 'DELETE' }),

  addLesson:    (mid: number, d: object) => req<import('./types').Module>(`/modules/${mid}/lessons`, { method: 'POST', body: JSON.stringify(d) }),
  updateLesson: (lid: string, d: object) => req<import('./types').Lesson>(`/lessons/${lid}`, { method: 'PUT', body: JSON.stringify(d) }),
  deleteLesson: (lid: string) => req<{ ok: boolean }>(`/lessons/${lid}`, { method: 'DELETE' }),

  updateShop:         (items: object) => req<unknown>('/shop', { method: 'PUT', body: JSON.stringify(items) }),
  updateAchievements: (items: object) => req<unknown>('/achievements', { method: 'PUT', body: JSON.stringify(items) }),
  updateLeagues:      (items: object) => req<unknown>('/leagues', { method: 'PUT', body: JSON.stringify(items) }),

  users:      (q?: string, sort?: string) => req<import('./types').AdminUser[]>(`/users?${new URLSearchParams({ ...(q ? { q } : {}), ...(sort ? { sort } : {}) })}`),
  userStats:  () => req<Record<string, unknown>>('/users/stats'),
  updateUser: (id: string, d: object) => req<import('./types').AdminUser>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  deleteUser: (id: string) => req<{ ok: boolean }>(`/users/${id}`, { method: 'DELETE' }),
  resetUser:  (id: string) => req<import('./types').AdminUser>(`/users/${id}/reset`, { method: 'POST' }),

  upload: (data: string, name: string) => req<{ url: string }>('/upload', { method: 'POST', body: JSON.stringify({ data, name }) }),
}
