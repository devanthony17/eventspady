import apiClient from './client'
import { categories as defaultCategories } from '../data/categories'

export const categoriesApi = {
  /**
   * Fetch all event categories from backend API with fallback to system categories
   */
  async getCategories() {
    try {
      const res = await apiClient.get('/api/categories')
      return res.data
    } catch {
      return defaultCategories
    }
  },
}

export default categoriesApi
