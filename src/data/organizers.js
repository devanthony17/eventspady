/**
 * Production organizers repository — clean initial state.
 * Organizers registered and verified in production will be populated dynamically.
 */
export const organizers = []

export const getOrganizer = (id) => {
  if (!id) return null
  return organizers.find((o) => o.id === id) || null
}
