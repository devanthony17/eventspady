import { events, getEventBySlug, getEventById } from '../data/events'

export const eventsApi = {
  async getEvents(params = {}) {
    return { data: events, meta: { total: events.length } }
  },

  async searchEvents(params = {}) {
    return { data: events, meta: { total: events.length } }
  },

  async getEvent(slugOrId) {
    const event = getEventBySlug(slugOrId) || getEventById(slugOrId)
    return { data: event }
  },

  async getReviews(id, params = {}) {
    return { data: [] }
  },

  async submitReview(id, data) {
    return { success: true }
  },

  async reportEvent(id, data) {
    return { success: true }
  },

  async submitInquiry(id, data) {
    return { success: true }
  },
}

export default eventsApi
