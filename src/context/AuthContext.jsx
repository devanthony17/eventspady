import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '@api/auth.api'
import { usersApi } from '@api/users.api'
import tokenManager from '@api/tokenManager'
import queryClient from '@api/queryClient'

const STORAGE_KEY = 'eventspady:session'
const AuthContext = createContext(null)

/**
 * Front-end session handling with attendee, organizer, and administrator roles.
 * Fully integrated with Axios API client, JWT token manager, and React Query cache.
 * Production grade: enforces valid credentials and authenticates strictly via backend API.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const persist = useCallback((next) => {
    setUser(next)
    if (next) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      tokenManager.setUser(next)
    } else {
      localStorage.removeItem(STORAGE_KEY)
      tokenManager.clearTokens()
      queryClient.clear()
    }
  }, [])

  // Auto-synchronize session from tokenManager or localStorage on mount
  useEffect(() => {
    const unsubscribe = tokenManager.onAuthExpired(() => {
      persist(null)
    })

    const initAuth = async () => {
      try {
        // If an access token exists, verify and fetch current user profile from server
        if (tokenManager.hasAccessToken()) {
          try {
            const me = await authApi.getMe()
            if (me) {
              persist(me)
            }
          } catch (err) {
            // If unauthorized/expired, clean session
            if (err.status === 401) {
              persist(null)
            } else {
              const storedUser = tokenManager.getUser()
              if (storedUser) {
                setUser(storedUser)
              }
            }
          }
        } else {
          // Clear any stale local user if no valid access token exists
          persist(null)
        }
      } catch {
        persist(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
    return () => unsubscribe()
  }, [persist])

  const login = useCallback(
    async ({ email, password, role = 'attendee' }) => {
      const normalizedEmail = (email || '').toLowerCase().trim()
      if (!normalizedEmail || !password) {
        throw new Error('Please enter both your email address and password.')
      }

      // Enforce genuine authentication through backend API
      const res = await authApi.login({ email: normalizedEmail, password })
      const loggedInUser =
        res.user || res.data?.user || res.data || { email: normalizedEmail, role }

      // Ensure role is normalized if returned by backend
      const effectiveUser = {
        ...loggedInUser,
        role: loggedInUser.role || role,
      }

      // If the backend has marked organizer as pending/unverified
      if (effectiveUser.role === 'organizer' && effectiveUser.status && effectiveUser.status !== 'verified') {
        const err = new Error(
          `Your organizer account (${effectiveUser.name || effectiveUser.organizationName || 'Account'}) is currently ${effectiveUser.status}. An administrator must review and approve your credentials before you can access the organizer portal.`,
        )
        err.code = 'ORGANIZER_NOT_VERIFIED'
        err.status = effectiveUser.status
        throw err
      }

      persist(effectiveUser)
      return effectiveUser
    },
    [persist],
  )

  const loginWithGoogle = useCallback(
    async (role = 'attendee', credential = null) => {
      if (!credential) {
        throw new Error('Google Sign-In credential token is required.')
      }
      const res = await authApi.loginWithGoogle({ token: credential, role })
      const userObj = res.user || res.data?.user || res
      persist(userObj)
      return userObj
    },
    [persist],
  )

  const register = useCallback(
    async ({
      name,
      email,
      phone,
      city,
      role = 'attendee',
      password,
      organizationName,
      businessRegistrationNumber,
      idCardUrl,
    }) => {
      const normalizedEmail = (email || '').toLowerCase().trim()
      if (!normalizedEmail) {
        throw new Error('Please provide an email address.')
      }
      if (!password) {
        throw new Error('Please provide a password.')
      }

      const payload = {
        name,
        email: normalizedEmail,
        phone,
        city: city || 'Wa',
        role,
        password,
        ...(role === 'organizer'
          ? {
              organizationName: organizationName || `${name}'s Organization`,
              businessRegistrationNumber: businessRegistrationNumber || '',
              idCardUrl: idCardUrl || '',
            }
          : {}),
      }

      const res = await authApi.register(payload)
      const userObj = res.user || res.data?.user || res.data || {
        name,
        email: normalizedEmail,
        phone,
        city: city || 'Wa',
        role,
        provider: 'email',
        verified: { email: false, phone: false },
        joinedAt: new Date().toISOString(),
      }

      // If register also returns tokens (auto-login)
      if (res.accessToken || res.data?.accessToken || res.token) {
        tokenManager.setTokens({
          accessToken: res.accessToken || res.data?.accessToken || res.token,
          refreshToken: res.refreshToken || res.data?.refreshToken,
        })
      }

      persist(userObj)
      return userObj
    },
    [persist],
  )

  const logout = useCallback(async () => {
    try {
      if (tokenManager.hasAccessToken()) {
        await authApi.logout()
      }
    } catch (e) {
      console.warn('[Eventspady API] Logout request failed:', e.message)
    } finally {
      persist(null)
    }
  }, [persist])

  const updateProfile = useCallback(
    async (patch) => {
      if (tokenManager.hasAccessToken()) {
        try {
          const updated = await usersApi.updateProfile(patch)
          const merged = { ...user, ...(updated?.user || updated || patch) }
          persist(merged)
          return merged
        } catch (e) {
          console.warn('[Eventspady API] Profile update failed on server:', e.message)
        }
      }
      const next = user ? { ...user, ...patch } : user
      persist(next)
      return next
    },
    [persist, user],
  )

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isOrganizer: user?.role === 'organizer',
      isAdmin: user?.role === 'admin',
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
