import apiClient from './client'

export const organizersApi = {
  /**
   * Fetch all published organizers
   */
  async getOrganizers(params = {}) {
    const res = await apiClient.get('/api/organizers', { params })
    return res.data
  },

  /**
   * Fetch organizer profile by id
   */
  async getOrganizerById(id) {
    const res = await apiClient.get(`/api/organizers/${encodeURIComponent(id)}`)
    return res.data
  },
}

export default organizersApi
