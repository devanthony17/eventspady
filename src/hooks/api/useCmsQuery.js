import { useQuery } from '@tanstack/react-query'
import { cmsApi } from '@api/cms.api'

export function useLandingCms(options = {}) {
  return useQuery({
    queryKey: ['cms', 'landing'],
    queryFn: () => cmsApi.getLandingCms(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    ...options,
  })
}
