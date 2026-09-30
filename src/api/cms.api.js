import apiClient from './client'

export const cmsApi = {
  /**
   * Fetch landing page CMS configuration (Hero, Spotlight, Testimonials, Categories)
   */
  async getLandingCms() {
    const res = await apiClient.get('/api/cms/landing')
    return res.data
  },
}

export default cmsApi
