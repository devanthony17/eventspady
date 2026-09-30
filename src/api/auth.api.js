import apiClient from './client'
import tokenManager from './tokenManager'

export const authApi = {
  /**
   * Register a new user (attendee or organizer)
   */
  async register(data) {
    const res = await apiClient.post('/api/auth/register', data)
    return res.data
  },

  /**
   * Log in user with email & password
   */
  async login(credentials) {
    const res = await apiClient.post('/api/auth/login', credentials)
    const data = res.data

    // If tokens are returned directly in response
    const accessToken = data.accessToken || data.token || data.data?.accessToken
    const refreshToken = data.refreshToken || data.data?.refreshToken
    const user = data.user || data.data?.user || data

    if (accessToken) {
      tokenManager.setTokens({ accessToken, refreshToken })
    }
    if (user) {
      tokenManager.setUser(user)
    }

    return data
  },

  /**
   * Authenticate with Google OAuth payload
   */
  async loginWithGoogle(payload) {
    const res = await apiClient.post('/api/auth/google', payload)
    const data = res.data
    const accessToken = data.accessToken || data.token || data.data?.accessToken
    const refreshToken = data.refreshToken || data.data?.refreshToken
    const user = data.user || data.data?.user || data

    if (accessToken) {
      tokenManager.setTokens({ accessToken, refreshToken })
    }
    if (user) {
      tokenManager.setUser(user)
    }

    return data
  },

  /**
   * Initiate forgot password flow
   */
  async forgotPassword(data) {
    const res = await apiClient.post('/api/auth/forgot-password', data)
    return res.data
  },

  /**
   * Reset password with reset token
   */
  async resetPassword(data) {
    const res = await apiClient.post('/api/auth/reset-password', data)
    return res.data
  },

  /**
   * Manually trigger refresh token
   */
  async refreshToken(refreshToken) {
    const token = refreshToken || tokenManager.getRefreshToken()
    const res = await apiClient.post('/api/auth/refresh-token', { refreshToken: token })
    const data = res.data

    const newAccessToken = data.accessToken || data.token || data.data?.accessToken
    const newRefreshToken = data.refreshToken || data.data?.refreshToken || token

    if (newAccessToken) {
      tokenManager.setTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken })
    }
    return data
  },

  /**
   * Logout current authenticated user
   */
  async logout() {
    try {
      await apiClient.post('/api/auth/logout', {})
    } finally {
      tokenManager.clearTokens()
    }
  },

  /**
   * Fetch currently authenticated user profile
   */
  async getMe() {
    const res = await apiClient.get('/api/auth/me')
    const user = res.data?.user || res.data?.data || res.data
    if (user) {
      tokenManager.setUser(user)
    }
    return user
  },
}

export default authApi
