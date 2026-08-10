import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { demoOrganizer, demoUser } from '@data/account'

const STORAGE_KEY = 'eventspady:session'
const AuthContext = createContext(null)

/**
 * Front-end session handling. Swap the `login`/`register` bodies for real API
 * calls — the rest of the app only depends on the shape returned here.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setUser(JSON.parse(raw))
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
    setLoading(false)
  }, [])

  const persist = useCallback((next) => {
    setUser(next)
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    else localStorage.removeItem(STORAGE_KEY)
  }, [])

  const login = useCallback(
    async ({ email, role = 'attendee' }) => {
      await new Promise((r) => setTimeout(r, 500))
      const base = role === 'organizer' ? demoOrganizer : demoUser
      const next = { ...base, email: email || base.email, provider: 'email' }
      persist(next)
      return next
    },
    [persist],
  )

  const loginWithGoogle = useCallback(
    async (role = 'attendee') => {
      await new Promise((r) => setTimeout(r, 700))
      const base = role === 'organizer' ? demoOrganizer : demoUser
      const next = { ...base, provider: 'google' }
      persist(next)
      return next
    },
    [persist],
  )

  const register = useCallback(
    async ({ name, email, role = 'attendee' }) => {
      await new Promise((r) => setTimeout(r, 600))
      const base = role === 'organizer' ? demoOrganizer : demoUser
      const next = {
        ...base,
        name: name || base.name,
        email: email || base.email,
        role,
        provider: 'email',
        verified: { email: false, phone: false },
        joinedAt: new Date().toISOString(),
      }
      persist(next)
      return next
    },
    [persist],
  )

  const logout = useCallback(() => persist(null), [persist])

  const updateProfile = useCallback(
    (patch) => persist(user ? { ...user, ...patch } : user),
    [persist, user],
  )

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isOrganizer: user?.role === 'organizer',
      login,
      loginWithGoogle,
      register,
      logout,
      updateProfile,
    }),
    [user, loading, login, loginWithGoogle, register, logout, updateProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
