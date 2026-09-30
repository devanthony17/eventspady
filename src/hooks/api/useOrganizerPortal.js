import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { organizerApi } from '@api/organizer.api'

export function useOrganizerOverview(options = {}) {
  return useQuery({
    queryKey: ['organizer', 'overview'],
    queryFn: () => organizerApi.getOverview(),
    ...options,
  })
}

export function useOrganizerEvents(params = {}, options = {}) {
  return useQuery({
    queryKey: ['organizer', 'events', params],
    queryFn: () => organizerApi.getEvents(params),
    ...options,
  })
}

export function useCreateEventMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (eventData) => organizerApi.createEvent(eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizer', 'events'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useSaveDraftMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (eventData) => organizerApi.saveDraft(eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizer', 'events'] })
    },
  })
}

export function useUpdateEventMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => organizerApi.updateEvent(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['organizer', 'events'] })
      queryClient.invalidateQueries({ queryKey: ['event', id] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useDeleteEventMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => organizerApi.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizer', 'events'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useUnpublishEventMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => organizerApi.unpublishEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizer', 'events'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useUploadMediaMutation() {
  return useMutation({
    mutationFn: (formData) => organizerApi.uploadMedia(formData),
  })
}

export function useOrganizerOrders(params = {}, options = {}) {
  return useQuery({
    queryKey: ['organizer', 'orders', params],
    queryFn: () => organizerApi.getOrders(params),
    ...options,
  })
}

export function useOrganizerCoupons(params = {}, options = {}) {
  return useQuery({
    queryKey: ['organizer', 'coupons', params],
    queryFn: () => organizerApi.getCoupons(params),
    ...options,
  })
}

export function useCreateCouponMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => organizerApi.createCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizer', 'coupons'] })
    },
  })
}

export function useDeleteCouponMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => organizerApi.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizer', 'coupons'] })
    },
  })
}

export function useOrganizerGuests(params = {}, options = {}) {
  return useQuery({
    queryKey: ['organizer', 'guests', params],
    queryFn: () => organizerApi.getGuests(params),
    ...options,
  })
}

export function useCreateCompsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => organizerApi.createComps(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizer', 'guests'] })
    },
  })
}

export function useCheckInTicketMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => organizerApi.checkInTicket(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizer', 'guests'] })
    },
  })
}

export function useRequestPayoutMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => organizerApi.requestPayout(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizer', 'overview'] })
      queryClient.invalidateQueries({ queryKey: ['organizer', 'payouts'] })
    },
  })
}

export function useOrganizerDrafts(params = {}, options = {}) {
  return useQuery({
    queryKey: ['organizer', 'events', 'drafts', params],
    queryFn: () => organizerApi.getDrafts(params),
    ...options,
  })
}

export function useDeleteDraftMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => organizerApi.deleteDraft(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizer', 'events', 'drafts'] })
    },
  })
}

export function useEventAnalytics(id, options = {}) {
  return useQuery({
    queryKey: ['organizer', 'events', id, 'analytics'],
    queryFn: () => organizerApi.getEventAnalytics(id),
    enabled: Boolean(id),
    ...options,
  })
}

export function useUndoCheckInMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ticketCode) => organizerApi.undoCheckIn(ticketCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizer', 'guests'] })
    },
  })
}

export function useRecordGateViolationMutation() {
  return useMutation({
    mutationFn: (data) => organizerApi.recordGateViolation(data),
  })
}

export function useOrganizerPayouts(options = {}) {
  return useQuery({
    queryKey: ['organizer', 'payouts'],
    queryFn: () => organizerApi.getPayouts(),
    ...options,
  })
}
