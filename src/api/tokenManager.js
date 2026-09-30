/**
 * Eventspady Token & Auth Storage Manager
 * Handles access token, refresh token, and token expiration events.
 */

const ACCESS_TOKEN_KEY = 'eventspady:access_token'
const REFRESH_TOKEN_KEY = 'eventspady:refresh_token'
const USER_KEY = 'eventspady:user'

// In-memory token cache for fast access
let inMemoryAccessToken = null
let inMemoryRefreshToken = null

// Subscribers to auth expiration event
const authExpiredListeners = new Set()

export const tokenManager = {
  getAccessToken() {
    if (inMemoryAccessToken) return inMemoryAccessToken
    try {
      inMemoryAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
      return inMemoryAccessToken
    } catch {
      return null
    }
  },

  getRefreshToken() {
    if (inMemoryRefreshToken) return inMemoryRefreshToken
    try {
      inMemoryRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
      return inMemoryRefreshToken
    } catch {
      return null
    }
  },

  setTokens({ accessToken, refreshToken } = {}) {
    if (accessToken !== undefined) {
      inMemoryAccessToken = accessToken
      if (accessToken) {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
      } else {
        localStorage.removeItem(ACCESS_TOKEN_KEY)
      }
    }

    if (refreshToken !== undefined) {
      inMemoryRefreshToken = refreshToken
      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
      } else {
        localStorage.removeItem(REFRESH_TOKEN_KEY)
      }
    }
  },

  getUser() {
    try {
      const raw = localStorage.getItem(USER_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },

  setUser(user) {
    try {
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user))
      } else {
        localStorage.removeItem(USER_KEY)
      }
    } catch {
      // ignore storage errors
    }
  },

  clearTokens() {
    inMemoryAccessToken = null
    inMemoryRefreshToken = null
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    } catch {
      // ignore storage errors
    }
  },

  hasAccessToken() {
    return Boolean(this.getAccessToken())
  },

  onAuthExpired(callback) {
    authExpiredListeners.add(callback)
    return () => authExpiredListeners.delete(callback)
  },

  emitAuthExpired() {
    this.clearTokens()
    authExpiredListeners.forEach((callback) => {
      try {
        callback()
      } catch (err) {
        console.error('Error in authExpired listener:', err)
      }
    })
  },
}

export default tokenManager
