import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes fresh cache
      gcTime: 1000 * 60 * 15, // 15 minutes garbage collection
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Do not retry 401, 403, 404, or validation errors
        if (
          error?.status === 401 ||
          error?.status === 403 ||
          error?.status === 404 ||
          error?.status === 422
        ) {
          return false
        }
        return failureCount < 2
      },
    },
    mutations: {
      retry: false,
    },
  },
})

export default queryClient
