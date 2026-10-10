import { getOrganizer } from '@data/organizers'
import { getCategory } from '@data/categories'

/**
 * Fills derived fields the UI relies on so consumers never recompute them:
 * price range, availability, sold-out state and the resolved organizer.
 */
export function makeEvent(event) {
  const tickets = (event.tickets || []).map((t) => ({
    currency: 'GHS',
    perOrderLimit: 10,
    sold: 0,
    ...t,
    remaining: Math.max(0, (t.quantity || 0) - (t.sold ?? 0)),
  }))

  const now = Date.now()
  const purchasable = tickets.filter((t) => t.remaining > 0 && (!t.salesEnd || new Date(t.salesEnd).getTime() > now))
  const prices = (purchasable.length > 0 ? purchasable : tickets).map((t) => Number(t.price) || 0)

  const capacity = tickets.reduce((sum, t) => sum + (Number(t.quantity) || 0), 0)
  const sold = tickets.reduce((sum, t) => sum + (Number(t.sold) || 0), 0)

  return {
    currency: 'GHS',
    gallery: [],
    tags: [],
    featured: false,
    trending: false,
    ageLimit: 'All ages',
    ...event,
    tickets,
    priceFrom: prices.length > 0 ? Math.min(...prices) : 0,
    priceTo: prices.length > 0 ? Math.max(...prices) : 0,
    isFree: prices.length > 0 ? prices.every((p) => p === 0) : true,
    capacity,
    sold,
    remaining: capacity - sold,
    soldOut: capacity > 0 && capacity - sold <= 0,
    get organizer() {
      const org = getOrganizer(event.organizerId)
      if (org) return org
      return {
        id: event.organizerId || 'organizer-default',
        name: event.organizerName || 'Eventspady Organizer',
        logo: '/images/organizers/organizer-1.svg',
        location: event.venue?.city ? `${event.venue.city}, Ghana` : 'Wa, Ghana',
        since: new Date().getFullYear(),
        rating: 5.0,
        reviews: 0,
        events: 1,
        followers: 0,
        bio: 'Community and cultural event organizer.',
      }
    },
    get categoryMeta() {
      return getCategory(event.category)
    },
  }
}

/** Production initial catalogue: starts empty and populates dynamically from APIs or organizer portal */
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
  events.filter((e) => e.category === categoryId)

/** Same category first, then anything else upcoming. Never returns the source event. */
export function relatedEvents(event, limit = 3) {
  const sameCategory = events.filter((e) => e.id !== event.id && e.category === event.category)
  const rest = events.filter((e) => e.id !== event.id && e.category !== event.category)
  return [...sameCategory, ...rest].slice(0, limit)
}

/** Distinct towns for the location filter. */
export const eventCities = () =>
  [...new Set(events.filter((e) => e.venue).map((e) => e.venue.city))].sort()
