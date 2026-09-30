import apiClient from './client'

export const eventsApi = {
  /**
   * Fetch paginated and filterable events
   * @param {Object} params - Query params (category, city, date, page, limit, etc.)
   */
  async getEvents(params = {}) {
    const res = await apiClient.get('/api/events', { params })
    return res.data
  },

  /**
   * Search events by keyword, location, date, etc.
   * @param {Object} params - Search params ({ q, query, category, city })
   */
  async searchEvents(params = {}) {
    const res = await apiClient.get('/api/events/search', { params })
    return res.data
  },

  /**
   * Fetch event details by slug or ID
   * @param {string} slugOrId
   */
  async getEvent(slugOrId) {
    const res = await apiClient.get(`/api/events/${encodeURIComponent(slugOrId)}`)
    return res.data
  },

  /**
   * Fetch reviews for an event
   * @param {string} id
   * @param {Object} params
   */
  async getReviews(id, params = {}) {
    const res = await apiClient.get(`/api/events/${encodeURIComponent(id)}/reviews`, { params })
    return res.data
  },

  /**
   * Submit a review for an event
   * @param {string} id
   * @param {Object} data - { rating, comment }
   */
  async submitReview(id, data) {
    const res = await apiClient.post(`/api/events/${encodeURIComponent(id)}/reviews`, data)
    return res.data
  },

  /**
   * Report an event
   * @param {string} id
   * @param {Object} data - { reason, details, email }
   */
  async reportEvent(id, data) {
    const res = await apiClient.post(`/api/events/${encodeURIComponent(id)}/report`, data)
    return res.data
  },

  /**
   * Submit direct inquiry to organizer
   * @param {string} id
   * @param {Object} data - { name, email, message }
   */
  async submitInquiry(id, data) {
    const res = await apiClient.post(`/api/events/${encodeURIComponent(id)}/inquiries`, data)
    return res.data
  },
}

export default eventsApi
