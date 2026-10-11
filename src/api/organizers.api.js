import apiClient from './client'

export const organizersApi = {
  /**
   * Fetch registered organizers
   */
  async getOrganizers(params = {}) {
    const res = await apiClient.get('/api/organizers', { params })
    return res.data
  },

  /**
   * Fetch a single organizer by ID or slug
   */
  async getOrganizerById(id) {
    const res = await apiClient.get(`/api/organizers/${encodeURIComponent(id)}`)
    return res.data
  },
}

export default organizersApi
