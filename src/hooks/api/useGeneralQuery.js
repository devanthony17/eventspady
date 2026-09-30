import { useQuery, useMutation } from '@tanstack/react-query'
import { generalApi } from '@api/general.api'

export function useLocations(options = {}) {
  return useQuery({
    queryKey: ['locations'],
    queryFn: () => generalApi.getLocations(),
    staleTime: 1000 * 60 * 30, // 30 minutes
    ...options,
  })
}

export function useFaq(options = {}) {
  return useQuery({
    queryKey: ['faq'],
    queryFn: () => generalApi.getFaq(),
    staleTime: 1000 * 60 * 30,
    ...options,
  })
}

export function usePlans(options = {}) {
  return useQuery({
    queryKey: ['plans'],
    queryFn: () => generalApi.getPlans(),
    staleTime: 1000 * 60 * 30,
    ...options,
  })
}

export function useNewsletterMutation(options = {}) {
  return useMutation({
    mutationFn: (email) => generalApi.subscribeNewsletter(email),
    ...options,
  })
}

export function useContactMutation(options = {}) {
  return useMutation({
    mutationFn: (data) => generalApi.sendContact(data),
    ...options,
  })
}

export function useFeedbackMutation(options = {}) {
  return useMutation({
    mutationFn: (data) => generalApi.sendFeedback(data),
    ...options,
  })
}
