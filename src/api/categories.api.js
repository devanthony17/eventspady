import { categories } from '../data/categories'

export const categoriesApi = {
  /**
   * Fetch all event categories (MOCK)
   */
  async getCategories() {
    return categories
  },
}

export default categoriesApi
