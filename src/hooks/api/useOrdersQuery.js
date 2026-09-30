import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '@api/orders.api'
import { paymentsApi } from '@api/payments.api'

export function useOrder(orderId, options = {}) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersApi.getOrder(orderId),
    enabled: Boolean(orderId),
    ...options,
  })
}

export function useCheckoutMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (orderData) => ordersApi.checkout(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'tickets'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useValidateCouponMutation() {
  return useMutation({
    mutationFn: (couponData) => ordersApi.validateCoupon(couponData),
  })
}

export function useTransferTicketMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ticketCode, payload }) => ordersApi.transferTicket(ticketCode, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'tickets'] })
    },
  })
}

export function useMomoPromptMutation() {
  return useMutation({
    mutationFn: (payload) => paymentsApi.triggerMomoPrompt(payload),
  })
}

export function usePaystackInitMutation() {
  return useMutation({
    mutationFn: (payload) => paymentsApi.initializePaystack(payload),
  })
}

export function usePaystackVerify(reference, options = {}) {
  return useQuery({
    queryKey: ['payments', 'paystack', reference],
    queryFn: () => paymentsApi.verifyPaystack(reference),
    enabled: Boolean(reference),
    ...options,
  })
}

export function useFlutterwaveInitMutation() {
  return useMutation({
    mutationFn: (payload) => paymentsApi.initializeFlutterwave(payload),
  })
}

export function useFlutterwaveVerify(txRef, options = {}) {
  return useQuery({
    queryKey: ['payments', 'flutterwave', txRef],
    queryFn: () => paymentsApi.verifyFlutterwave(txRef),
    enabled: Boolean(txRef),
    ...options,
  })
}
