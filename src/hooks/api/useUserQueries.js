import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@api/auth.api'
import { usersApi } from '@api/users.api'
import { wishlistApi } from '@api/wishlist.api'
import tokenManager from '@api/tokenManager'

export function useUserProfile(options = {}) {
  const hasToken = tokenManager.hasAccessToken()
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => authApi.getMe(),
    enabled: hasToken,
    ...options,
  })
}

export function useUserNotifications(options = {}) {
  const hasToken = tokenManager.hasAccessToken()
  return useQuery({
    queryKey: ['user', 'notifications'],
    queryFn: () => usersApi.getNotifications(),
    enabled: hasToken,
    ...options,
  })
}

export function useUserWallet(options = {}) {
  const hasToken = tokenManager.hasAccessToken()
  return useQuery({
    queryKey: ['user', 'wallet'],
    queryFn: () => usersApi.getWallet(),
    enabled: hasToken,
    ...options,
  })
}

export function useUserTickets(options = {}) {
  const hasToken = tokenManager.hasAccessToken()
  return useQuery({
    queryKey: ['user', 'tickets'],
    queryFn: () => usersApi.getUserTickets(),
    enabled: hasToken,
    ...options,
  })
}

export function useUserGateStatus(options = {}) {
  const hasToken = tokenManager.hasAccessToken()
  return useQuery({
    queryKey: ['user', 'gateStatus'],
    queryFn: () => usersApi.getGateStatus(),
    enabled: hasToken,
    ...options,
  })
}

export function useWishlistQuery(options = {}) {
  const hasToken = tokenManager.hasAccessToken()
  return useQuery({
    queryKey: ['user', 'wishlist'],
    queryFn: () => wishlistApi.getWishlist(),
    enabled: hasToken,
    ...options,
  })
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => usersApi.updateProfile(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['user', 'profile'], data)
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
    },
  })
}

export function useUpdatePasswordMutation() {
  return useMutation({
    mutationFn: (data) => usersApi.updatePassword(data),
  })
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => usersApi.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'notifications'] })
    },
  })
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => usersApi.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'notifications'] })
    },
  })
}

export function useTopupWalletMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => usersApi.topupWallet(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'wallet'] })
    },
  })
}

export function useToggleWishlistMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ eventId, isSaved }) => {
      if (isSaved) {
        return await wishlistApi.removeFromWishlist(eventId)
      } else {
        return await wishlistApi.addToWishlist(eventId)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'wishlist'] })
    },
  })
}

export function useClearWishlistMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => wishlistApi.clearWishlist(),
    onSuccess: () => {
      queryClient.setQueryData(['user', 'wishlist'], [])
      queryClient.invalidateQueries({ queryKey: ['user', 'wishlist'] })
    },
  })
}

export function useUserOverview(options = {}) {
  const hasToken = tokenManager.hasAccessToken()
  return useQuery({
    queryKey: ['user', 'overview'],
    queryFn: () => usersApi.getOverview(),
    enabled: hasToken,
    ...options,
  })
}

export function useUserSettings(options = {}) {
  const hasToken = tokenManager.hasAccessToken()
  return useQuery({
    queryKey: ['user', 'settings'],
    queryFn: () => usersApi.getSettings(),
    enabled: hasToken,
    ...options,
  })
}

export function useUpdateSettingsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (settings) => usersApi.updateSettings(settings),
    onSuccess: (data) => {
      queryClient.setQueryData(['user', 'settings'], data)
      queryClient.invalidateQueries({ queryKey: ['user', 'settings'] })
    },
  })
}

export function useUploadAvatarMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData) => usersApi.uploadAvatar(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
    },
  })
}

export function useWalletTransactions(params = {}, options = {}) {
  const hasToken = tokenManager.hasAccessToken()
  return useQuery({
    queryKey: ['user', 'wallet', 'transactions', params],
    queryFn: () => usersApi.getWalletTransactions(params),
    enabled: hasToken,
    ...options,
  })
}
