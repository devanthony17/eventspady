import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { Sparkles } from '@components/icons/AppIcons'
import { Container, Section, SectionHeading } from '@components/ui/Section'
import { Button } from '@components/ui/Button'
import { Badge } from '@components/ui/Badge'
import { Avatar } from '@components/ui/Avatar'
import { useBlogPosts } from '@hooks/api'
import { useStore } from '@context/StoreContext'
import { formatDate, readingTime } from '@lib/utils'

export function BlogPreview() {
  const { cms: storeCms } = useStore()
  const { data: blogData } = useBlogPosts()
  const apiPosts = Array.isArray(blogData) ? blogData : (blogData?.posts || blogData?.data || [])
  const allPosts = (apiPosts.length > 0 ? apiPosts : (storeCms?.blogPosts || [])).slice(0, 6)

  // Top 3 dynamic stories for the upper featured hero card
  const featuredStories = allPosts.slice(0, 3)
  // Additional posts to display in the secondary 3-column row below
  const secondaryPosts = allPosts.slice(3, 6)

  const [activeStory, setActiveStory] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // 5-second automatic rotation through the 3 dynamic featured stories
  useEffect(() => {
    if (isPaused || featuredStories.length <= 1) return
    const timer = setInterval(() => {
      setActiveStory((prev) => (prev + 1) % featuredStories.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [isPaused, featuredStories.length])

  const getReadTime = (post) => {
    if (!post?.body) return 4
    if (typeof post.body === 'string') return readingTime(post.body)
    if (Array.isArray(post.body)) {
      return readingTime(post.body.map((b) => (typeof b === 'string' ? b : b.text || '')).join(' '))
    }
    return 4
  }

  const currentStory = featuredStories[activeStory] || featuredStories[0]

  if (allPosts.length === 0) return null

  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="From the blog"
          title="Ideas for people who run events"
          description="Practical writing on selling tickets, running doors and getting paid in Ghana — no fluff."
          action={
            <Button to="/blog" variant="outline" iconRight={ArrowRight}>
              Explore all guides
            </Button>
          }
        />

        <div className="grid gap-6">
          {/* Upper Featured Card with 3 Dynamic Stories changing every 5 sec */}
          {currentStory && (
            <article
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="surface group relative overflow-hidden rounded-3xl border border-ink-200/80 shadow-card transition-all duration-300 dark:border-white/10 lg:grid lg:grid-cols-2"
            >
              {/* Left Side: Synchronized cover photo with smooth cross-fade */}
              <div className="relative aspect-[16/10] overflow-hidden bg-ink-950 sm:aspect-[16/9] lg:aspect-auto">
                {featuredStories.map((story, idx) => (
                  <img
                    key={story.id}
                    src={story.cover}
                    alt={story.title}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    className={`absolute inset-0 size-full object-cover transition-all duration-700 ease-out ${
                      idx === activeStory
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-105 pointer-events-none'
                    }`}
                  />
                ))}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent lg:hidden" />
              </div>

              {/* Right Side: 3 Dynamic Rotating Content Slides */}
              <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10">
                {/* Upper Selector Tabs for the 3 Stories */}
                <div>
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-ink-200/60 pb-4 dark:border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="relative flex size-2">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-400 opacity-75" />
                        <span className="relative inline-flex size-2 rounded-full bg-brand-500" />
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                        Featured Story {activeStory + 1} of 3
                      </span>
                    </div>

                    {/* 3 Story Selector Tabs */}
                    <div className="flex items-center gap-1.5">
                      {featuredStories.map((story, idx) => (
                        <button
                          key={story.id}
                          type="button"
                          onClick={() => setActiveStory(idx)}
                          className={`relative flex items-center justify-center rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                            idx === activeStory
                              ? 'bg-brand-500 text-white shadow-sm'
                              : 'bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-white/10 dark:text-ink-300 dark:hover:bg-white/15'
                          }`}
                          aria-label={`Switch to story ${idx + 1}`}
                        >
                          0{idx + 1}
                        </button>
                      ))}
                      <div className="ml-1 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveStory((prev) => (prev - 1 + featuredStories.length) % featuredStories.length)
                          }
                          aria-label="Previous story"
                          className="grid size-6 place-items-center rounded-md text-ink-400 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-white/10 dark:hover:text-white"
                        >
                          <ChevronLeft className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveStory((prev) => (prev + 1) % featuredStories.length)}
                          aria-label="Next story"
                          className="grid size-6 place-items-center rounded-md text-ink-400 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-white/10 dark:hover:text-white"
                        >
                          <ChevronRight className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Active Story Details */}
                  <div key={currentStory.id} className="animate-fadeIn">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <Badge tone="brand" size="sm">
                        {currentStory.category}
                      </Badge>
                      <span className="inline-flex items-center gap-1 text-xs text-ink-400">
                        <Clock className="size-3" aria-hidden="true" />
                        {getReadTime(currentStory)} min read
                      </span>
                    </div>

                    <h3 className="text-xl font-extrabold leading-snug sm:text-2xl lg:text-3xl">
                      <Link
                        to={`/blog/${currentStory.slug}`}
                        className="transition hover:text-brand-600 dark:hover:text-brand-400"
                      >
                        {currentStory.title}
                      </Link>
                    </h3>

                    <p className="mt-3 text-pretty text-sm sm:text-base leading-relaxed text-ink-600 dark:text-ink-300">
                      {currentStory.excerpt}
                    </p>
                  </div>
                </div>

                {/* Footer with Author info and Direct CTA */}
                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-ink-200/70 pt-5 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <Avatar src={currentStory.author?.avatar} name={currentStory.author?.name} size="md" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-ink-900 dark:text-white">
                        {currentStory.author?.name}
                      </p>
                      <p className="truncate text-[11px] text-ink-400">
                        {currentStory.author?.role} · {formatDate(currentStory.publishedAt)}
                      </p>
                    </div>
                  </div>

                  <Button
                    to={`/blog/${currentStory.slug}`}
                    variant="outline"
                    size="sm"
                    iconRight={ArrowRight}
                  >
                    Read article
                  </Button>
                </div>
              </div>
            </article>
          )}

          {/* Secondary 3-Column Posts Row */}
          {secondaryPosts.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {secondaryPosts.map((post) => (
                <article
                  key={post.id}
                  className="surface group relative flex flex-col overflow-hidden rounded-2xl border border-ink-200/70 transition duration-300 hover:-translate-y-1 hover:shadow-card dark:border-white/10"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-ink-950">
                    <img
                      src={post.cover}
                      alt={post.title}
                      loading="lazy"
                      className="size-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <div className="mb-2.5 flex flex-wrap items-center gap-2">
                        <Badge tone="brand" size="sm">
                          {post.category}
                        </Badge>
                        <span className="inline-flex items-center gap-1 text-xs text-ink-400">
                          <Clock className="size-3" aria-hidden="true" />
                          {getReadTime(post)} min read
                        </span>
                      </div>

                      <h4 className="text-base font-bold leading-snug">
                        <Link
                          to={`/blog/${post.slug}`}
                          className="transition after:absolute after:inset-0 hover:text-brand-600 dark:hover:text-brand-400"
                        >
                          {post.title}
                        </Link>
                      </h4>

                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-500 dark:text-ink-400">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center gap-3 border-t border-ink-200/70 pt-4 dark:border-white/10">
                      <Avatar src={post.author?.avatar} name={post.author?.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold">{post.author?.name}</p>
                        <p className="truncate text-[11px] text-ink-400">{formatDate(post.publishedAt)}</p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </Container>
    </Section>
  )
}
