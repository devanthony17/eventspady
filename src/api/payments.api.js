import apiClient from './client'

export const paymentsApi = {
  /**
   * Trigger Mobile Money (MTN, Telecel, AT) USSD authorization prompt
   * @param {Object} payload { orderId, network, phone, amount }
   */
  async triggerMomoPrompt(payload) {
    const res = await apiClient.post('/api/payments/momo/ussd-prompt', payload)
    return res.data
  },

  /**
   * Notify payment webhook (if client simulates or relays)
   */
  async webhook(payload) {
    const res = await apiClient.post('/api/payments/webhook', payload)
    return res.data
  },

  /**
   * Initialize Paystack transaction for card / alternative channels
   * @param {Object} payload - { orderId, email, amount, callback_url }
   */
  async initializePaystack(payload) {
    const res = await apiClient.post('/api/payments/paystack/initialize', payload)
    return res.data
  },

  /**
   * Verify Paystack transaction by reference
   * @param {string} reference
   */
  async verifyPaystack(reference) {
    const res = await apiClient.get(`/api/payments/paystack/verify/${encodeURIComponent(reference)}`)
    return res.data
  },

  /**
   * Initialize Flutterwave transaction
   * @param {Object} payload - { orderId, email, amount, redirect_url }
   */
  async initializeFlutterwave(payload) {
    const res = await apiClient.post('/api/payments/flutterwave/initialize', payload)
    return res.data
  },

  /**
   * Verify Flutterwave transaction by transaction reference
   * @param {string} txRef
   */
  async verifyFlutterwave(txRef) {
    const res = await apiClient.get(`/api/payments/flutterwave/verify/${encodeURIComponent(txRef)}`)
    return res.data
  },
}

export default paymentsApi
