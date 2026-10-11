import { useQuery, useMutation } from '@tanstack/react-query'
import { eventsApi } from '@api/events.api'
import queryClient from '@api/queryClient'
import { useStore } from '@context/StoreContext'
import { useMemo } from 'react'

export function useEvents(params = {}, options = {}) {
  let storeEvents = []
  try {
    const store = useStore()
    if (Array.isArray(store?.events)) storeEvents = store.events
  } catch {
    // outside StoreProvider context
  }

  const query = useQuery({
    queryKey: ['events', params],
    queryFn: async () => {
      try {
        const res = await eventsApi.getEvents(params)
        return res
      } catch (err) {
        // Fallback to store events when server is offline or returns error
        return { events: storeEvents, total: storeEvents.length }
      }
    },
    ...options,
  })

  // Seamlessly merge server events with any admin or organizer events in local store
  const combinedData = useMemo(() => {
    const apiList = Array.isArray(query.data)
      ? query.data
      : Array.isArray(query.data?.events)
        ? query.data.events
        : Array.isArray(query.data?.data)
          ? query.data.data
          : []

    const map = new Map()
    apiList.forEach((e) => {
      if (e?.id || e?.slug) map.set(e.id || e.slug, e)
    })
    storeEvents.forEach((e) => {
      if (e?.id || e?.slug) {
        const key = e.id || e.slug
        map.set(key, { ...map.get(key), ...e })
      }
    })

    const merged = Array.from(map.values())
    return {
      events: merged,
      total: merged.length,
      data: merged,
    }
  }, [query.data, storeEvents])

  return {
    ...query,
    data: combinedData,
  }
}

export function useSearchEvents(params = {}, options = {}) {
  const queryStr = params?.q || params?.query || ''
  let storeEvents = []
  try {
    const store = useStore()
    if (Array.isArray(store?.events)) storeEvents = store.events
  } catch {}

  const query = useQuery({
    queryKey: ['events', 'search', params],
    queryFn: async () => {
      try {
        const res = await eventsApi.searchEvents(params)
        return res
      } catch (err) {
        const q = (queryStr || '').toLowerCase()
        const matches = storeEvents.filter(
          (e) =>
            e.title?.toLowerCase().includes(q) ||
            e.tagline?.toLowerCase().includes(q) ||
            e.description?.toLowerCase().includes(q) ||
            e.venue?.city?.toLowerCase().includes(q) ||
            e.organizer?.name?.toLowerCase().includes(q),
        )
        return { events: matches, total: matches.length }
      }
    },
    enabled: Boolean(queryStr.trim()),
    ...options,
  })

  return query
}

export function useEvent(slugOrId, options = {}) {
  let storeEvents = []
  try {
    const store = useStore()
    if (Array.isArray(store?.events)) storeEvents = store.events
  } catch {}

  const localEvent = useMemo(() => {
    if (!slugOrId) return null
    return (
      storeEvents.find((e) => e.slug === slugOrId || e.id === slugOrId) ||
      null
    )
  }, [storeEvents, slugOrId])

  const query = useQuery({
    queryKey: ['event', slugOrId],
    queryFn: async () => {
      try {
        const res = await eventsApi.getEvent(slugOrId)
        return res
      } catch (err) {
        if (localEvent) {
          return { event: localEvent, data: localEvent }
        }
        throw err
      }
    },
    enabled: Boolean(slugOrId),
    ...options,
  })

  const eventData = query.data || (localEvent ? { event: localEvent, data: localEvent } : null)

  return {
    ...query,
    data: eventData,
    isLoading: query.isLoading && !localEvent,
  }
}

export function useEventReviews(id, params = {}, options = {}) {
  return useQuery({
    queryKey: ['event', id, 'reviews', params],
    queryFn: () => eventsApi.getReviews(id, params),
    enabled: Boolean(id),
    ...options,
  })
}

export function useSubmitReviewMutation(options = {}) {
  return useMutation({
    mutationFn: ({ id, ...data }) => eventsApi.submitReview(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['event', id, 'reviews'] })
      queryClient.invalidateQueries({ queryKey: ['event', id] })
    },
    ...options,
  })
}

export function useReportEventMutation(options = {}) {
  return useMutation({
    mutationFn: ({ id, ...data }) => eventsApi.reportEvent(id, data),
    ...options,
  })
}

export function useSubmitInquiryMutation(options = {}) {
  return useMutation({
    mutationFn: ({ id, ...data }) => eventsApi.submitInquiry(id, data),
    ...options,
  })
}
