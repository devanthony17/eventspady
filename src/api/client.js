import axios from 'axios'
import tokenManager from './tokenManager'

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Primary Axios instance for all application API calls
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000,
})

// Fresh unintercepted Axios instance specifically for refresh-token calls to avoid recursive interception
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Request Interceptor: Attach Bearer token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken()
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response Interceptor: Handle automatic token refresh and request retrying
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (!originalRequest) {
      return Promise.reject(error)
    }

    const is401 = error.response && error.response.status === 401
    const isAuthRoute =
      originalRequest.url?.includes('/api/auth/login') ||
      originalRequest.url?.includes('/api/auth/register') ||
      originalRequest.url?.includes('/api/auth/refresh-token')

    // If not a 401 or request is already auth endpoint or already retried
    if (!is401 || isAuthRoute || originalRequest._retry) {
      return Promise.reject(normalizeApiError(error))
    }

    const refreshToken = tokenManager.getRefreshToken()

    // No refresh token available -> expire session immediately
    if (!refreshToken) {
      tokenManager.emitAuthExpired()
      return Promise.reject(normalizeApiError(error))
    }

    // If another refresh is already in progress, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        })
        .catch((err) => {
          return Promise.reject(normalizeApiError(err))
        })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const response = await refreshClient.post('/api/auth/refresh-token', {
        refreshToken,
      })

      const data = response.data || {}
      // Support various standard response envelopes
      const newAccessToken =
        data.accessToken || data.token || data.data?.accessToken || data.data?.token
      const newRefreshToken =
        data.refreshToken || data.data?.refreshToken || refreshToken

      if (!newAccessToken) {
        throw new Error('Refresh token response missing access token')
      }

      tokenManager.setTokens({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      })

      apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

      processQueue(null, newAccessToken)
      return apiClient(originalRequest)
    } catch (refreshErr) {
      processQueue(refreshErr, null)
      tokenManager.emitAuthExpired()
      return Promise.reject(normalizeApiError(refreshErr))
    } finally {
      isRefreshing = false
    }
  },
)

/**
 * Standardize API error payload for UI consumption
 */
export function normalizeApiError(error) {
  if (error.response) {
    const data = error.response.data
    const message =
      (typeof data === 'string' && data) ||
      data?.message ||
      data?.error ||
      (Array.isArray(data?.errors) ? data.errors.join(', ') : null) ||
      error.message ||
      `Request failed with status ${error.response.status}`

    const normalized = new Error(message)
    normalized.status = error.response.status
    normalized.data = data
    normalized.headers = error.response.headers
    return normalized
  }

  if (error.request) {
    const networkErr = new Error(
      'Unable to connect to the Eventspady server. Please ensure the backend is running.',
    )
    networkErr.status = 0
    networkErr.isNetworkError = true
    return networkErr
  }

  return error
}

export default apiClient
