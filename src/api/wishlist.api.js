import apiClient from './client'

export const wishlistApi = {
  /**
   * Fetch authenticated user's wishlist / saved event IDs
   */
  async getWishlist() {
    const res = await apiClient.get('/api/wishlist')
    return res.data
  },

  /**
   * Add event to wishlist
   */
  async addToWishlist(eventId) {
    const res = await apiClient.post(`/api/wishlist/${encodeURIComponent(eventId)}`, {})
    return res.data
  },

  /**
   * Remove event from wishlist
   */
  async removeFromWishlist(eventId) {
    const res = await apiClient.delete(`/api/wishlist/${encodeURIComponent(eventId)}`)
    return res.data
  },

  /**
   * Clear all events from wishlist
   */
  async clearWishlist() {
    const res = await apiClient.delete('/api/wishlist')
    return res.data
  },
}

export default wishlistApi
