import { useState, useEffect, useCallback } from 'react'
import { api } from '../api'
import type { Content, User } from '../types'

interface AppState {
  content: Content | null
  user: User | null
  token: string | null
  loading: boolean
  contentLoading: boolean
}

const INITIAL: AppState = {
  content: null,
  user: null,
  token: localStorage.getItem('fl_token'),
  loading: true,
  contentLoading: true,
}

let _setState: React.Dispatch<React.SetStateAction<AppState>> | null = null

export function setUser(user: User) {
  _setState?.(s => ({ ...s, user }))
}

export function useApp() {
  const [state, setState] = useState<AppState>(INITIAL)
  _setState = setState

  const loadContent = useCallback(async () => {
    try {
      const content = await api.content()
      setState(s => ({ ...s, content, contentLoading: false }))
    } catch {
      setState(s => ({ ...s, contentLoading: false }))
    }
  }, [])

  const loadUser = useCallback(async () => {
    if (!state.token) { setState(s => ({ ...s, loading: false })); return }
    try {
      const user = await api.me()
      setState(s => ({ ...s, user, loading: false }))
      // Auto-claim daily bonus silently; update user if gems were added
      api.claimDaily().then(r => {
        if (r.bonus.applied) setState(s => ({ ...s, user: r.user }))
      }).catch(() => {})
    } catch {
      localStorage.removeItem('fl_token')
      setState(s => ({ ...s, token: null, user: null, loading: false }))
    }
  }, [state.token])

  useEffect(() => { loadContent() }, [loadContent])
  useEffect(() => { loadUser() }, [loadUser])

  const login = useCallback(async (email: string, password: string) => {
    const { token, user } = await api.login({ email, password })
    localStorage.setItem('fl_token', token)
    setState(s => ({ ...s, token, user }))
  }, [])

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const { token, user } = await api.signup({ name, email, password })
    localStorage.setItem('fl_token', token)
    setState(s => ({ ...s, token, user }))
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('fl_token')
    setState(s => ({ ...s, token: null, user: null }))
  }, [])

  return { ...state, login, signup, logout, reloadUser: loadUser }
}
