import apiClient from './client'

export const blogApi = {
  /**
   * Fetch all published blog posts
   */
  async getPosts(params = {}) {
    const res = await apiClient.get('/api/blog', { params })
    return res.data
  },

  /**
   * Fetch single blog post by slug
   */
  async getPostBySlug(slug) {
    const res = await apiClient.get(`/api/blog/${encodeURIComponent(slug)}`)
    return res.data
  },
}

export default blogApi
