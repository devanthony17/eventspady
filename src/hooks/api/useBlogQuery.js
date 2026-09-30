import { useQuery } from '@tanstack/react-query'
import { blogApi } from '@api/blog.api'

export function useBlogPosts(params = {}, options = {}) {
  return useQuery({
    queryKey: ['blog', params],
    queryFn: () => blogApi.getPosts(params),
    ...options,
  })
}

export function useBlogPost(slug, options = {}) {
  return useQuery({
    queryKey: ['blog', slug],
    queryFn: () => blogApi.getPostBySlug(slug),
    enabled: Boolean(slug),
    ...options,
  })
}
