import apiClient from './client'

export const categoriesApi = {
  /**
   * Fetch all event categories
   */
  async getCategories() {
    const res = await apiClient.get('/api/categories')
    return res.data
  },
}

export default categoriesApi
