export const blogCategories = ['Organizer tips', 'Product', 'Marketing', 'Payments', 'Community']

/** Production initial posts: starts empty and populates dynamically from APIs or Admin CMS */
export const posts = []

export const getPost = (slug) => posts.find((p) => p.slug === slug)
export const featuredPosts = () => posts.filter((p) => p.featured)
export const recentPosts = (limit = 3) =>
  [...posts].sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt)).slice(0, limit)
export const relatedPosts = (post, limit = 3) =>
  posts.filter((p) => p.id !== post.id && p.category === post.category).slice(0, limit)
