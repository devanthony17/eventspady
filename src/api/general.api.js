import apiClient from './client'

export const generalApi = {
  /**
   * Subscribe an email to the newsletter
   */
  async subscribeNewsletter(email) {
    const payload = typeof email === 'string' ? { email } : email
    const res = await apiClient.post('/api/newsletter/subscribe', payload)
    return res.data
  },

  /**
   * Send contact us message
   */
  async sendContact(data) {
    const res = await apiClient.post('/api/contact', data)
    return res.data
  },

  /**
   * Submit platform feedback
   */
  async sendFeedback(data) {
    const res = await apiClient.post('/api/feedback', data)
    return res.data
  },

  /**
   * Fetch regional locations
   */
  async getLocations() {
    const res = await apiClient.get('/api/locations')
    return res.data
  },

  /**
   * Fetch help centre FAQ items
   */
  async getFaq() {
    const res = await apiClient.get('/api/faq')
    return res.data
  },

  /**
   * Fetch subscription and pricing plans
   */
  async getPlans() {
    const res = await apiClient.get('/api/plans')
    return res.data
  },
}

export default generalApi
