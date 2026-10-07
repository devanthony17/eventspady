import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Clock, Search } from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { PageHero } from '@components/layout/PageHero'
import { Container, Section } from '@components/ui/Section'
import { Badge } from '@components/ui/Badge'
import { Button } from '@components/ui/Button'
import { Avatar } from '@components/ui/Avatar'
import { EmptyState } from '@components/ui/EmptyState'
import { useBlogPosts } from '@hooks/api'
import { useStore } from '@context/StoreContext'
import { cn, formatDate, readingTime } from '@lib/utils'

export default function Blog() {
  const { cms: storeCms } = useStore()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const { data: blogData, isLoading: blogLoading } = useBlogPosts()

  const posts = useMemo(() => {
    if (Array.isArray(blogData) && blogData.length > 0) return blogData
    if (Array.isArray(blogData?.posts) && blogData.posts.length > 0) return blogData.posts
    if (Array.isArray(blogData?.data) && blogData.data.length > 0) return blogData.data
    return storeCms?.blogPosts || []
  }, [blogData, storeCms])

  const blogCategories = useMemo(() => {
    const set = new Set(posts.map((p) => p.category).filter(Boolean))
    return ['All', ...Array.from(set)]
  }, [posts])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts
      .filter((post) => (category === 'All' ? true : post.category === category))
      .filter((post) =>
        q ? `${post.title} ${post.excerpt} ${(post.tags || []).join(' ')}`.toLowerCase().includes(q) : true,
      )
      .sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt))
  }, [posts, query, category])

  const [lead, ...rest] = filtered

  return (
    <>
      <Seo
        title="Blog"
        description="Practical writing for people who run events — selling tickets, running doors, payments, accessibility and product updates from Eventspady."
        keywords="event marketing blog, sell more tickets, event management tips, organizer guides"
      />

      <PageHero
        eyebrow="The Eventspady blog"
        title="Ideas for people who run events"
        description="Selling tickets, running a calm door, getting paid and everything else we have learned from 3,400 events across the Upper West."
        breadcrumbs={[{ label: 'Blog' }]}
      >
        <div className="relative max-w-lg">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ink-400" aria-hidden="true" />
          <label htmlFor="blog-search" className="sr-only">
            Search articles
          </label>
          <input
            id="blog-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            className="field h-12 pl-12"
          />
        </div>
      </PageHero>

      <Section>
        <Container>
          {/* Category filter */}
          <div className="mb-10 flex flex-wrap gap-2">
            {['All', ...blogCategories].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-semibold transition',
                  category === item
                    ? 'bg-brand-600 text-white shadow-lift'
                    : 'bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-white/[.06] dark:text-ink-300 dark:hover:bg-white/10',
                )}
              >
                {item}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title="No articles found"
              description="Try a different search term or clear the category filter."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuery('')
                    setCategory('All')
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <>
              {/* Lead article */}
              <article className="surface group relative mb-10 grid overflow-hidden lg:grid-cols-2">
                <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto">
                  <img
                    src={lead.cover}
                    alt=""
                    loading="lazy"
                    className="size-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-col justify-center p-7 lg:p-12">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <Badge tone="brand" size="md">
                      {lead.category}
                    </Badge>
                    <span className="inline-flex items-center gap-1 text-xs text-ink-400">
                      <Clock className="size-3" aria-hidden="true" />
                      {readingTime(lead.body.map((b) => b.text).join(' '))} min read
                    </span>
                  </div>

                  <h2 className="text-balance text-2xl font-extrabold leading-tight lg:text-4xl">
                    <Link
                      to={`/blog/${lead.slug}`}
                      className="transition after:absolute after:inset-0 hover:text-brand-600 dark:hover:text-brand-400"
                    >
                      {lead.title}
                    </Link>
                  </h2>

                  <p className="mt-4 text-pretty leading-relaxed text-ink-500 dark:text-ink-300">{lead.excerpt}</p>

                  <div className="mt-7 flex items-center gap-3">
                    <Avatar src={lead.author.avatar} name={lead.author.name} size="md" />
                    <div>
                      <p className="text-sm font-bold">{lead.author.name}</p>
                      <p className="text-xs text-ink-400">
                        {lead.author.role} · {formatDate(lead.publishedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </article>

              {/* Grid */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((post) => (
                  <article
                    key={post.id}
                    className="surface group relative flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-card"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img
                        src={post.cover}
                        alt=""
                        loading="lazy"
                        className="size-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <Badge tone="brand" size="sm">
                          {post.category}
                        </Badge>
                        <span className="inline-flex items-center gap-1 text-xs text-ink-400">
                          <Clock className="size-3" aria-hidden="true" />
                          {readingTime(post.body.map((b) => b.text).join(' '))} min
                        </span>
                      </div>

                      <h3 className="text-lg font-bold leading-snug">
                        <Link
                          to={`/blog/${post.slug}`}
                          className="transition after:absolute after:inset-0 hover:text-brand-600 dark:hover:text-brand-400"
                        >
                          {post.title}
                        </Link>
                      </h3>

                      <p className="mt-2 line-clamp-2 text-sm text-ink-500 dark:text-ink-400">{post.excerpt}</p>

                      <div className="mt-5 flex items-center gap-3 border-t border-ink-200/70 pt-4 dark:border-white/10">
                        <Avatar src={post.author.avatar} name={post.author.name} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold">{post.author.name}</p>
                          <p className="truncate text-xs text-ink-400">{formatDate(post.publishedAt)}</p>
                        </div>
                        <ArrowRight className="size-4 shrink-0 text-ink-300 transition group-hover:translate-x-0.5 group-hover:text-brand-500" aria-hidden="true" />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </Container>
      </Section>
    </>
  )
}
