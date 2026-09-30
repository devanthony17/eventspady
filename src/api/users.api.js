import apiClient from './client'

export const usersApi = {
  /**
   * Update authenticated user profile details
   */
  async updateProfile(profileData) {
    const res = await apiClient.patch('/api/users/profile', profileData)
    return res.data
  },

  /**
   * Change authenticated user password
   */
  async updatePassword(passwordData) {
    const res = await apiClient.patch('/api/users/password', passwordData)
    return res.data
  },

  /**
   * Fetch authenticated user notifications
   */
  async getNotifications() {
    const res = await apiClient.get('/api/users/notifications')
    return res.data
  },

  /**
   * Mark single notification as read
   */
  async markNotificationRead(id) {
    const res = await apiClient.patch(`/api/users/notifications/${encodeURIComponent(id)}/read`, {})
    return res.data
  },

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsRead() {
    const res = await apiClient.post('/api/users/notifications/read-all', {})
    return res.data
  },

  /**
   * Get user wallet balance and transaction ledger
   */
  async getWallet() {
    const res = await apiClient.get('/api/users/wallet')
    return res.data
  },

  /**
   * Top up user wallet
   */
  async topupWallet(payload) {
    const res = await apiClient.post('/api/users/wallet/topup', payload)
    return res.data
  },

  /**
   * Check user admission gate status and any flags
   */
  async getGateStatus() {
    const res = await apiClient.get('/api/users/gate-status')
    return res.data
  },

  /**
   * Fetch user purchased tickets
   */
  async getUserTickets() {
    const res = await apiClient.get('/api/users/tickets')
    return res.data
  },

  /**
   * Fetch attendee dashboard overview stats
   */
  async getOverview() {
    const res = await apiClient.get('/api/users/overview')
    return res.data
  },

  /**
   * Fetch attendee account preferences and settings
   */
  async getSettings() {
    const res = await apiClient.get('/api/users/settings')
    return res.data
  },

  /**
   * Update attendee settings
   */
  async updateSettings(settings) {
    const res = await apiClient.patch('/api/users/settings', settings)
    return res.data
  },

  /**
   * Upload user avatar
   */
  async uploadAvatar(formDataOrPayload) {
    const isFormData = formDataOrPayload instanceof FormData
    const res = await apiClient.post('/api/users/avatar', formDataOrPayload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    })
    return res.data
  },

  /**
   * Fetch user wallet transactions ledger
   */
  async getWalletTransactions(params = {}) {
    const res = await apiClient.get('/api/users/wallet/transactions', { params })
    return res.data
  },
}

export default usersApi
