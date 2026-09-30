import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@api/categories.api'

export function useCategories(options = {}) {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getCategories(),
    staleTime: 1000 * 60 * 10, // 10 minutes cache
    ...options,
  })
}
