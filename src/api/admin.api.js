import apiClient from './client'

export const adminApi = {
  /**
   * Fetch platform-wide administrator KPIs and summary
   */
  async getOverview() {
    const res = await apiClient.get('/api/admin/overview')
    return res.data
  },

  /**
   * Fetch all registered organizers with approval statuses
   */
  async getOrganizers(params = {}) {
    const res = await apiClient.get('/api/admin/organizers', { params })
    return res.data
  },

  /**
   * Verify and approve an organizer account
   */
  async verifyOrganizer(id) {
    const res = await apiClient.patch(`/api/admin/organizers/${encodeURIComponent(id)}/verify`, {})
    return res.data
  },

  /**
   * Reject organizer verification application
   */
  async rejectOrganizer(id, reasonData = {}) {
    const res = await apiClient.patch(
      `/api/admin/organizers/${encodeURIComponent(id)}/reject`,
      reasonData,
    )
    return res.data
  },

  /**
   * Suspend organizer account
   */
  async suspendOrganizer(id, reasonData = {}) {
    const res = await apiClient.patch(
      `/api/admin/organizers/${encodeURIComponent(id)}/suspend`,
      reasonData,
    )
    return res.data
  },

  /**
   * Fetch platform events for moderation
   */
  async getEvents(params = {}) {
    const res = await apiClient.get('/api/admin/events', { params })
    return res.data
  },

  /**
   * Toggle event featured spotlight status
   */
  async setEventFeatured(id, payload = {}) {
    const res = await apiClient.patch(
      `/api/admin/events/${encodeURIComponent(id)}/featured`,
      payload,
    )
    return res.data
  },

  /**
   * Change event moderation status (published, unlisted, suspended, rejected)
   */
  async updateEventStatus(id, payload) {
    const res = await apiClient.patch(
      `/api/admin/events/${encodeURIComponent(id)}/status`,
      payload,
    )
    return res.data
  },

  /**
   * Fetch registered users
   */
  async getUsers(params = {}) {
    const res = await apiClient.get('/api/admin/users', { params })
    return res.data
  },

  /**
   * Update user status (active, suspended, banned)
   */
  async updateUserStatus(id, payload) {
    const res = await apiClient.patch(
      `/api/admin/users/${encodeURIComponent(id)}/status`,
      payload,
    )
    return res.data
  },

  /**
   * Log a gate admission violation (fraud, ticket reuse, etc.)
   */
  async addGateViolation(payload) {
    const res = await apiClient.post('/api/admin/gate-violations', payload)
    return res.data
  },

  /**
   * Clear gate violation for a user
   */
  async removeGateViolation(userId) {
    const res = await apiClient.delete(`/api/admin/gate-violations/${encodeURIComponent(userId)}`)
    return res.data
  },

  /**
   * Fetch all platform ticket orders
   */
  async getOrders(params = {}) {
    const res = await apiClient.get('/api/admin/orders', { params })
    return res.data
  },

  /**
   * Process refund for an order
   */
  async refundOrder(id, payload = {}) {
    const res = await apiClient.post(`/api/admin/orders/${encodeURIComponent(id)}/refund`, payload)
    return res.data
  },

  /**
   * Fetch landing page CMS configuration
   */
  async getCms() {
    const res = await apiClient.get('/api/admin/cms')
    return res.data
  },

  /**
   * Update Hero section config
   */
  async updateCmsHero(payload) {
    const res = await apiClient.put('/api/admin/cms/hero', payload)
    return res.data
  },

  /**
   * Update Spotlight section config
   */
  async updateCmsSpotlight(payload) {
    const res = await apiClient.put('/api/admin/cms/spotlight', payload)
    return res.data
  },

  /**
   * Create landing page testimonial
   */
  async createCmsTestimonial(payload) {
    const res = await apiClient.post('/api/admin/cms/testimonials', payload)
    return res.data
  },

  /**
   * Update landing page testimonial
   */
  async updateCmsTestimonial(id, payload) {
    const res = await apiClient.put(
      `/api/admin/cms/testimonials/${encodeURIComponent(id)}`,
      payload,
    )
    return res.data
  },

  /**
   * Delete landing page testimonial
   */
  async deleteCmsTestimonial(id) {
    const res = await apiClient.delete(`/api/admin/cms/testimonials/${encodeURIComponent(id)}`)
    return res.data
  },

  /**
   * Create CMS blog post
   */
  async createCmsBlogPost(payload) {
    const res = await apiClient.post('/api/admin/cms/blog', payload)
    return res.data
  },

  /**
   * Update CMS blog post
   */
  async updateCmsBlogPost(id, payload) {
    const res = await apiClient.put(`/api/admin/cms/blog/${encodeURIComponent(id)}`, payload)
    return res.data
  },

  /**
   * Delete CMS blog post
   */
  async deleteCmsBlogPost(id) {
    const res = await apiClient.delete(`/api/admin/cms/blog/${encodeURIComponent(id)}`)
    return res.data
  },

  /**
   * Reset CMS configuration to system defaults
   */
  async resetCms() {
    const res = await apiClient.post('/api/admin/cms/reset', {})
    return res.data
  },

  /**
   * Fetch all recorded gate violations across platform
   */
  async getGateViolations() {
    const res = await apiClient.get('/api/admin/gate-violations')
    return res.data
  },

  /**
   * Fetch a single user by ID
   */
  async getUserById(id) {
    const res = await apiClient.get(`/api/admin/users/${encodeURIComponent(id)}`)
    return res.data
  },

  /**
   * Delete a user account
   */
  async deleteUser(id) {
    const res = await apiClient.delete(`/api/admin/users/${encodeURIComponent(id)}`)
    return res.data
  },

  /**
   * Change user role (attendee, organizer, admin)
   */
  async updateUserRole(id, payload) {
    const res = await apiClient.patch(`/api/admin/users/${encodeURIComponent(id)}/role`, payload)
    return res.data
  },

  /**
   * Delete an event from platform moderation
   */
  async deleteEvent(id) {
    const res = await apiClient.delete(`/api/admin/events/${encodeURIComponent(id)}`)
    return res.data
  },

  /**
   * Fetch order details by ID
   */
  async getOrderById(id) {
    const res = await apiClient.get(`/api/admin/orders/${encodeURIComponent(id)}`)
    return res.data
  },

  /**
   * Export all platform orders as CSV blob
   */
  async exportOrdersCsv(params = {}) {
    const res = await apiClient.get('/api/admin/orders/export-csv', {
      params,
      responseType: 'blob',
    })
    return res.data
  },

  /**
   * Update organizer commission rate
   */
  async updateOrganizerCommission(id, payload) {
    const res = await apiClient.patch(`/api/admin/organizers/${encodeURIComponent(id)}/commission`, payload)
    return res.data
  },
}

export default adminApi
