import apiClient from './client'

export const organizerApi = {
  /**
   * Fetch organizer dashboard metrics & KPIs
   */
  async getOverview() {
    const res = await apiClient.get('/api/organizer/overview')
    return res.data
  },

  /**
   * Fetch organizer created events
   */
  async getEvents(params = {}) {
    const res = await apiClient.get('/api/organizer/events', { params })
    return res.data
  },

  /**
   * Create and publish a new event
   */
  async createEvent(eventData) {
    const res = await apiClient.post('/api/organizer/events', eventData)
    return res.data
  },

  /**
   * Save event draft
   */
  async saveDraft(eventData) {
    const res = await apiClient.post('/api/organizer/events/draft', eventData)
    return res.data
  },

  /**
   * Update existing event
   */
  async updateEvent(id, eventData) {
    const res = await apiClient.put(`/api/organizer/events/${encodeURIComponent(id)}`, eventData)
    return res.data
  },

  /**
   * Delete an event
   */
  async deleteEvent(id) {
    const res = await apiClient.delete(`/api/organizer/events/${encodeURIComponent(id)}`)
    return res.data
  },

  /**
   * Unpublish an event
   */
  async unpublishEvent(id) {
    const res = await apiClient.patch(`/api/organizer/events/${encodeURIComponent(id)}/unpublish`, {})
    return res.data
  },

  /**
   * Upload event media (poster, banner, gallery)
   * @param {FormData} formData
   */
  async uploadMedia(formData) {
    const res = await apiClient.post('/api/organizer/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return res.data
  },

  /**
   * Fetch ticket orders across organizer events
   */
  async getOrders(params = {}) {
    const res = await apiClient.get('/api/organizer/orders', { params })
    return res.data
  },

  /**
   * Export organizer orders as CSV file blob
   */
  async exportOrdersCsv(params = {}) {
    const res = await apiClient.get('/api/organizer/orders/export-csv', {
      params,
      responseType: 'blob',
    })
    return res.data
  },

  /**
   * Fetch organizer promo coupons
   */
  async getCoupons(params = {}) {
    const res = await apiClient.get('/api/organizer/coupons', { params })
    return res.data
  },

  /**
   * Create a new discount coupon
   */
  async createCoupon(data) {
    const res = await apiClient.post('/api/organizer/coupons', data)
    return res.data
  },

  /**
   * Delete a discount coupon
   */
  async deleteCoupon(id) {
    const res = await apiClient.delete(`/api/organizer/coupons/${encodeURIComponent(id)}`)
    return res.data
  },

  /**
   * Fetch guest / attendee roster
   */
  async getGuests(params = {}) {
    const res = await apiClient.get('/api/organizer/guests', { params })
    return res.data
  },

  /**
   * Export guest roster as CSV file blob
   */
  async exportGuestsCsv(params = {}) {
    const res = await apiClient.get('/api/organizer/guests/export-csv', {
      params,
      responseType: 'blob',
    })
    return res.data
  },

  /**
   * Issue complimentary VIP/Staff tickets
   */
  async createComps(data) {
    const res = await apiClient.post('/api/organizer/guests/comps', data)
    return res.data
  },

  /**
   * Gate ticket check-in verification via QR code
   * @param {Object} payload { code: string, eventId: string }
   */
  async checkInTicket(payload) {
    const res = await apiClient.post('/api/organizer/scanner/check-in', payload)
    return res.data
  },

  /**
   * Request payout for ticket revenues
   */
  async requestPayout(data) {
    const res = await apiClient.post('/api/organizer/payouts/request', data)
    return res.data
  },

  /**
   * Fetch unpublished event drafts
   */
  async getDrafts(params = {}) {
    const res = await apiClient.get('/api/organizer/events/drafts', { params })
    return res.data
  },

  /**
   * Delete event draft
   */
  async deleteDraft(id) {
    const res = await apiClient.delete(`/api/organizer/events/drafts/${encodeURIComponent(id)}`)
    return res.data
  },

  /**
   * Fetch event analytics and ticket sales timeseries
   */
  async getEventAnalytics(id) {
    const res = await apiClient.get(`/api/organizer/events/${encodeURIComponent(id)}/analytics`)
    return res.data
  },

  /**
   * Undo / cancel ticket check-in
   */
  async undoCheckIn(ticketCode) {
    const res = await apiClient.delete(`/api/organizer/scanner/check-in/${encodeURIComponent(ticketCode)}`)
    return res.data
  },

  /**
   * Record gate violation (no-show on pay-at-gate)
   */
  async recordGateViolation(data) {
    const res = await apiClient.post('/api/organizer/gate-violations', data)
    return res.data
  },

  /**
   * Fetch payouts history and available balance
   */
  async getPayouts() {
    const res = await apiClient.get('/api/organizer/payouts')
    return res.data
  },
}

export default organizerApi
