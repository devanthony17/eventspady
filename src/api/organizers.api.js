import { organizers, getOrganizer } from '../data/organizers'

export const organizersApi = {
  async getOrganizers(params = {}) {
    return { data: organizers, meta: { total: organizers.length } }
  },

  async getOrganizerById(id) {
    const organizer = getOrganizer(id)
    return { data: organizer }
  },
}

export default organizersApi
