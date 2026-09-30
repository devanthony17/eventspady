import apiClient from './client'

export const ordersApi = {
  /**
   * Process checkout order
   * @param {Object} orderData
   * {
   *   eventId: string,
   *   tickets: Array<{ ticketId: string, quantity: number, price: number }>,
   *   attendees: Array<{ name: string, email: string, ticketName: string }>,
   *   couponCode?: string,
   *   paymentMethod: string,
   *   momoDetails?: { network: string, phone: string },
   *   subtotal: number,
   *   discount: number,
   *   total: number
   * }
   */
  async checkout(orderData) {
    const res = await apiClient.post('/api/orders/checkout', orderData)
    return res.data
  },

  /**
   * Fetch order details by orderId
   */
  async getOrder(orderId) {
    const res = await apiClient.get(`/api/orders/${encodeURIComponent(orderId)}`)
    return res.data
  },

  /**
   * Download ticket PDF for an order
   */
  async getTicketsPdf(orderId) {
    const res = await apiClient.get(`/api/orders/${encodeURIComponent(orderId)}/tickets.pdf`, {
      responseType: 'blob',
    })
    return res.data
  },

  /**
   * Download calendar .ics invite for an order
   */
  async getCalendarIcs(orderId) {
    const res = await apiClient.get(`/api/orders/${encodeURIComponent(orderId)}/calendar.ics`, {
      responseType: 'text',
    })
    return res.data
  },

  /**
   * Transfer a ticket to another attendee
   */
  async transferTicket(ticketCode, payload) {
    const res = await apiClient.post(
      `/api/tickets/${encodeURIComponent(ticketCode)}/transfer`,
      payload,
    )
    return res.data
  },

  /**
   * Validate discount coupon code
   */
  async validateCoupon(payload) {
    const res = await apiClient.post('/api/coupons/validate', payload)
    return res.data
  },
}

export default ordersApi
