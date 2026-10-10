/** Production initial organizers catalogue: starts empty and populates dynamically from APIs or organizer portal */
export const organizers = []

export const getOrganizer = (id) => {
  if (!id) return null
  return organizers.find((o) => o.id === id) || null
}
