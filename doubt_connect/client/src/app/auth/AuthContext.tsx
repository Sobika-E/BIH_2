import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, setAccessToken } from '../api/http'
import type { User } from './types'

type AuthState =
  | { status: 'loading' }
  | { status: 'anonymous' }
  | { status: 'authenticated'; user: User }

type AuthContextValue = {
  state: AuthState
  login: (identifier: string, password: string) => Promise<void>
  signup: (payload: {
    name: string
    department: string
    year: 1 | 2 | 3 | 4
    rollNumber: string
    email: string
    mobileNumber: string
    password: string
    confirmPassword: string
  }) => Promise<void>
  logout: () => Promise<void>
  refreshMe: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading' })
  const navigate = useNavigate()

  const refreshMe = useCallback(async () => {
    try {
      // Try refresh first (uses httpOnly cookie); server returns 200 with accessToken: null when no session
      let token: string | null = null
      try {
        const r = await api.post<{ accessToken: string | null }>('/api/auth/refresh')
        token = r.data.accessToken ?? null
        if (token) setAccessToken(token)
      } catch {
        setAccessToken(null)
      }

      // If we got a token from refresh, or we have one in memory (from localStorage on load), try /me
      if (token) {
        try {
          const me = await api.get<{ user: User }>('/api/auth/me')
          setState({ status: 'authenticated', user: me.data.user })
          return
        } catch {
          setAccessToken(null)
        }
      } else {
        // Refresh returned null; try /me with existing token (e.g. from localStorage in new tab)
        try {
          const me = await api.get<{ user: User }>('/api/auth/me')
          setState({ status: 'authenticated', user: me.data.user })
          return
        } catch {
          setAccessToken(null)
        }
      }

      setState({ status: 'anonymous' })
    } catch {
      setAccessToken(null)
      setState({ status: 'anonymous' })
    }
  }, [])

  useEffect(() => {
    refreshMe()
  }, [refreshMe])

  const login = useCallback(async (identifier: string, password: string) => {
    const res = await api.post<{ accessToken: string; user: User }>("/api/auth/login", { identifier, password })
    setAccessToken(res.data.accessToken)
    setState({ status: 'authenticated', user: res.data.user })
    // Redirect to community after successful login
    navigate('/community')
  }, [navigate])

  const signup = useCallback(
    async (payload: {
      name: string
      department: string
      year: 1 | 2 | 3 | 4
      rollNumber: string
      email: string
      mobileNumber: string
      password: string
      confirmPassword: string
    }) => {
      await api.post('/api/auth/signup', payload)
      // After signup, we should login the user automatically
      // This would require the backend to return tokens on signup
      // For now, we'll redirect to login page
    },
    [],
  )

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout')
    } finally {
      setAccessToken(null)
      setState({ status: 'anonymous' })
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({ state, login, signup, logout, refreshMe }), [state, login, signup, logout, refreshMe])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

