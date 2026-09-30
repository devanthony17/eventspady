import { useQuery } from '@tanstack/react-query'
import { organizersApi } from '@api/organizers.api'

export function useOrganizers(params = {}, options = {}) {
  return useQuery({
    queryKey: ['organizers', params],
    queryFn: () => organizersApi.getOrganizers(params),
    ...options,
  })
}

export function useOrganizer(id, options = {}) {
  return useQuery({
    queryKey: ['organizer', id],
    queryFn: () => organizersApi.getOrganizerById(id),
    enabled: Boolean(id),
    ...options,
  })
}
