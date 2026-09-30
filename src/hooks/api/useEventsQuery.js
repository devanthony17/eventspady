import { useQuery, useMutation } from '@tanstack/react-query'
import { eventsApi } from '@api/events.api'
import queryClient from '@api/queryClient'

export function useEvents(params = {}, options = {}) {
  return useQuery({
    queryKey: ['events', params],
    queryFn: () => eventsApi.getEvents(params),
    ...options,
  })
}

export function useSearchEvents(params = {}, options = {}) {
  const queryStr = params?.q || params?.query || ''
  return useQuery({
    queryKey: ['events', 'search', params],
    queryFn: () => eventsApi.searchEvents(params),
    enabled: Boolean(queryStr.trim()),
    ...options,
  })
}

export function useEvent(slugOrId, options = {}) {
  return useQuery({
    queryKey: ['event', slugOrId],
    queryFn: () => eventsApi.getEvent(slugOrId),
    enabled: Boolean(slugOrId),
    ...options,
  })
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
