import { Link } from 'react-router-dom'
import { ArrowRight, Clock } from 'lucide-react'
import { Container, Section, SectionHeading } from '@components/ui/Section'
import { Button } from '@components/ui/Button'
import { Badge } from '@components/ui/Badge'
import { Avatar } from '@components/ui/Avatar'
import { recentPosts } from '@data/blog'
import { formatDate, readingTime } from '@lib/utils'

export function BlogPreview() {
  const posts = recentPosts(3)

  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="From the blog"
          title="Ideas for people who run events"
          description="Practical writing on selling tickets, running doors and getting paid — no fluff."
          action={
            <Button to="/blog" variant="outline" iconRight={ArrowRight}>
              Read the blog
            </Button>
          }
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {posts.map((post, i) => (
            <article
              key={post.id}
              className={
                i === 0
                  ? 'surface group relative flex flex-col overflow-hidden lg:col-span-3 lg:grid lg:grid-cols-2'
                  : 'surface group relative flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-card'
              }
            >
              <div className={i === 0 ? 'relative aspect-[16/9] overflow-hidden lg:aspect-auto' : 'relative aspect-[16/9] overflow-hidden'}>
                <img
                  src={post.cover}
                  alt=""
                  loading="lazy"
                  className="size-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              <div className={i === 0 ? 'flex flex-col justify-center p-7 lg:p-10' : 'flex flex-1 flex-col p-5'}>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge tone="brand" size="sm">
                    {post.category}
                  </Badge>
                  <span className="inline-flex items-center gap-1 text-xs text-ink-400">
                    <Clock className="size-3" aria-hidden="true" />
                    {readingTime(post.body.map((b) => b.text).join(' '))} min read
                  </span>
                </div>

                <h3 className={i === 0 ? 'text-2xl font-extrabold leading-tight lg:text-3xl' : 'text-lg font-bold leading-snug'}>
                  <Link to={`/blog/${post.slug}`} className="transition after:absolute after:inset-0 hover:text-brand-600 dark:hover:text-brand-400">
                    {post.title}
                  </Link>
                </h3>

                <p className={i === 0 ? 'mt-3 text-pretty text-base text-ink-500 dark:text-ink-400' : 'mt-2 line-clamp-2 text-sm text-ink-500 dark:text-ink-400'}>
                  {post.excerpt}
                </p>

                <div className="mt-5 flex items-center gap-3 border-t border-ink-200/70 pt-4 dark:border-white/10">
                  <Avatar src={post.author.avatar} name={post.author.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold">{post.author.name}</p>
                    <p className="truncate text-xs text-ink-400">{formatDate(post.publishedAt)}</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  )
}
