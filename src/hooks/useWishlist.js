import { useWishlistContext } from '@context/WishlistContext'

/**
 * Hook providing reactive saved events state.
 * Syncs in real time across the Navbar counter, event card heart buttons,
 * dashboard counters, and saved events list without requiring a page refresh.
 */
export function useWishlist() {
  return useWishlistContext()
}
