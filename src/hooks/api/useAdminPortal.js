import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@api/admin.api'

export function useAdminOverview(options = {}) {
  return useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: () => adminApi.getOverview(),
    ...options,
  })
}

export function useAdminOrganizers(params = {}, options = {}) {
  return useQuery({
    queryKey: ['admin', 'organizers', params],
    queryFn: () => adminApi.getOrganizers(params),
    ...options,
  })
}

export function useVerifyOrganizerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => adminApi.verifyOrganizer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'organizers'] })
      queryClient.invalidateQueries({ queryKey: ['organizers'] })
    },
  })
}

export function useRejectOrganizerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }) => adminApi.rejectOrganizer(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'organizers'] })
    },
  })
}

export function useSuspendOrganizerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }) => adminApi.suspendOrganizer(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'organizers'] })
    },
  })
}

export function useAdminEvents(params = {}, options = {}) {
  return useQuery({
    queryKey: ['admin', 'events', params],
    queryFn: () => adminApi.getEvents(params),
    ...options,
  })
}

export function useSetEventFeaturedMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, featured }) => adminApi.setEventFeatured(id, { featured }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useUpdateEventStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, reason }) => adminApi.updateEventStatus(id, { status, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useAdminUsers(params = {}, options = {}) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminApi.getUsers(params),
    ...options,
  })
}

export function useUpdateUserStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, reason }) => adminApi.updateUserStatus(id, { status, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useAdminOrders(params = {}, options = {}) {
  return useQuery({
    queryKey: ['admin', 'orders', params],
    queryFn: () => adminApi.getOrders(params),
    ...options,
  })
}

export function useRefundOrderMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }) => adminApi.refundOrder(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
    },
  })
}

export function useAdminCms(options = {}) {
  return useQuery({
    queryKey: ['admin', 'cms'],
    queryFn: () => adminApi.getCms(),
    ...options,
  })
}

export function useUpdateCmsHeroMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => adminApi.updateCmsHero(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cms'] })
      queryClient.invalidateQueries({ queryKey: ['cms'] })
    },
  })
}

export function useUpdateCmsSpotlightMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => adminApi.updateCmsSpotlight(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cms'] })
      queryClient.invalidateQueries({ queryKey: ['cms'] })
    },
  })
}

export function useResetCmsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => adminApi.resetCms(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cms'] })
      queryClient.invalidateQueries({ queryKey: ['cms'] })
    },
  })
}

export function useCreateCmsTestimonialMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => adminApi.createCmsTestimonial(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cms'] })
      queryClient.invalidateQueries({ queryKey: ['cms'] })
    },
  })
}

export function useUpdateCmsTestimonialMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }) => adminApi.updateCmsTestimonial(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cms'] })
      queryClient.invalidateQueries({ queryKey: ['cms'] })
    },
  })
}

export function useDeleteCmsTestimonialMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => adminApi.deleteCmsTestimonial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cms'] })
      queryClient.invalidateQueries({ queryKey: ['cms'] })
    },
  })
}

export function useCreateCmsBlogPostMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => adminApi.createCmsBlogPost(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cms'] })
      queryClient.invalidateQueries({ queryKey: ['cms'] })
      queryClient.invalidateQueries({ queryKey: ['blog'] })
    },
  })
}

export function useUpdateCmsBlogPostMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }) => adminApi.updateCmsBlogPost(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cms'] })
      queryClient.invalidateQueries({ queryKey: ['cms'] })
      queryClient.invalidateQueries({ queryKey: ['blog'] })
    },
  })
}

export function useDeleteCmsBlogPostMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => adminApi.deleteCmsBlogPost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cms'] })
      queryClient.invalidateQueries({ queryKey: ['cms'] })
      queryClient.invalidateQueries({ queryKey: ['blog'] })
    },
  })
}

export function useAdminGateViolations(options = {}) {
  return useQuery({
    queryKey: ['admin', 'gate-violations'],
    queryFn: () => adminApi.getGateViolations(),
    ...options,
  })
}

export function useAddGateViolationMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => adminApi.addGateViolation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'gate-violations'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useRemoveGateViolationMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId) => adminApi.removeGateViolation(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'gate-violations'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useAdminUser(id, options = {}) {
  return useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: () => adminApi.getUserById(id),
    enabled: Boolean(id),
    ...options,
  })
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useUpdateUserRoleMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }) => adminApi.updateUserRole(id, { role }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', id] })
    },
  })
}

export function useAdminDeleteEventMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => adminApi.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useAdminOrder(id, options = {}) {
  return useQuery({
    queryKey: ['admin', 'orders', id],
    queryFn: () => adminApi.getOrderById(id),
    enabled: Boolean(id),
    ...options,
  })
}

export function useUpdateOrganizerCommissionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, commissionRate }) => adminApi.updateOrganizerCommission(id, { commissionRate }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'organizers'] })
      queryClient.invalidateQueries({ queryKey: ['organizers', id] })
    },
  })
}
