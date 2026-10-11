import apiClient from './client'

export const eventsApi = {
  /**
   * Fetch all published events with optional filtering & pagination
   */
  async getEvents(params = {}) {
    const res = await apiClient.get('/api/events', { params })
    return res.data
  },

  /**
   * Search events by keyword, location, date, price
   */
  async searchEvents(params = {}) {
    const res = await apiClient.get('/api/events/search', { params })
    return res.data
  },

  /**
   * Fetch a single event by slug or ID
   */
  async getEvent(slugOrId) {
    const res = await apiClient.get(`/api/events/${encodeURIComponent(slugOrId)}`)
    return res.data
  },

  /**
   * Fetch reviews for an event
   */
  async getReviews(id, params = {}) {
    const res = await apiClient.get(`/api/events/${encodeURIComponent(id)}/reviews`, { params })
    return res.data
  },

  /**
   * Submit an attendee review for an event
   */
  async submitReview(id, data) {
    const res = await apiClient.post(`/api/events/${encodeURIComponent(id)}/reviews`, data)
    return res.data
  },

  /**
   * Report an event listing to admin moderation
   */
  async reportEvent(id, data) {
    const res = await apiClient.post(`/api/events/${encodeURIComponent(id)}/report`, data)
    return res.data
  },

  /**
   * Submit an attendee inquiry to the event organizer
   */
  async submitInquiry(id, data) {
    const res = await apiClient.post(`/api/events/${encodeURIComponent(id)}/inquiry`, data)
    return res.data
  },
}

export default eventsApi
