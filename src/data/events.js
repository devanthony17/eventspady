import { getOrganizer } from '@data/organizers'
import { getCategory } from '@data/categories'

/**
 * Production events repository — clean initial state for live operations.
 * Events created by organizers in production will be populated dynamically.
 */
export const events = []

/* ------------------------------------------------------------- selectors */

export const getEventBySlug = (slug) => events.find((e) => e.slug === slug)
export const getEventById = (id) => events.find((e) => e.id === id)

export const featuredEvents = () => events.filter((e) => e.featured)
export const trendingEvents = () => events.filter((e) => e.trending)
export const freeEvents = () => events.filter((e) => e.isFree)
export const onlineEvents = () => events.filter((e) => e.type === 'online')

export const upcomingEvents = () =>
  [...events].sort((a, b) => new Date(a.start) - new Date(b.start))

export const eventsByOrganizer = (organizerId) =>
  events.filter((e) => e.organizerId === organizerId)

export const eventsByCategory = (categoryId) =>
  events.filter((e) => (typeof e.category === 'object' ? e.category?.id : e.category) === categoryId)

/** Same category first, then anything else upcoming. Never returns the source event. */
export function relatedEvents(event, limit = 3) {
  if (!event) return []
  const eventCat = typeof event.category === 'object' ? event.category?.id : event.category
  const sameCategory = events.filter((e) => e.id !== event.id && (typeof e.category === 'object' ? e.category?.id : e.category) === eventCat)
  const rest = events.filter((e) => e.id !== event.id && (typeof e.category === 'object' ? e.category?.id : e.category) !== eventCat)
  return [...sameCategory, ...rest].slice(0, limit)
}

/** Distinct towns for the location filter. */
export const eventCities = () =>
  [...new Set(events.filter((e) => e.venue?.city).map((e) => e.venue.city))].sort()
