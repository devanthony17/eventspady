import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Clock, Facebook, Link2, Linkedin, Twitter } from 'lucide-react'
import { Seo, articleJsonLd } from '@components/ui/Seo'
import { Container, Section } from '@components/ui/Section'
import { Breadcrumbs } from '@components/ui/Breadcrumbs'
import { Badge } from '@components/ui/Badge'
import { Button } from '@components/ui/Button'
import { Avatar } from '@components/ui/Avatar'
import { useToast } from '@context/ToastContext'
import { useBlogPost, useBlogPosts } from '@hooks/api'
import { SITE } from '@lib/constants'
import { formatDate, readingTime } from '@lib/utils'
import NotFound from '@pages/NotFound'

export default function BlogPost() {
  const { slug } = useParams()
  const { data: postData, isLoading: postLoading } = useBlogPost(slug)
  const { data: allPostsData } = useBlogPosts()
  const [copied, setCopied] = useState(false)
  const toast = useToast()

  const post = postData?.post || postData?.data || postData
  const allPosts = Array.isArray(allPostsData) ? allPostsData : (allPostsData?.posts || allPostsData?.data || [])

  if (postLoading && !post) {
    return (
      <div className="grid min-h-[60vh] place-items-center" role="status" aria-label="Loading post">
        <div className="size-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  if (!post) return <NotFound />

  const url = `${SITE.url}/blog/${post.slug || post.id}`
  const bodyText = Array.isArray(post.body)
    ? post.body.map((b) => (typeof b === 'string' ? b : b.text || '')).join(' ')
    : typeof post.body === 'string'
      ? post.body
      : post.content || ''
  const minutes = readingTime(bodyText)
  const fallback = allPosts.filter((p) => p.slug !== post.slug && p.id !== post.id).slice(0, 3)

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Article link copied.')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy the link.')
    }
  }

  return (
    <>
      <Seo
        title={post.title}
        description={post.excerpt}
        image={post.cover}
        type="article"
        keywords={post.tags.join(', ')}
        jsonLd={articleJsonLd(post)}
      />

      <article>
        {/* Header */}
        <div className="border-b border-ink-200/70 bg-ink-50 dark:border-white/10 dark:bg-white/[.02]">
          <Container size="prose" className="py-10 sm:py-14">
            <Breadcrumbs items={[{ label: 'Blog', to: '/blog' }, { label: post.title }]} className="mb-6" />

            <Badge tone="brand" size="md" className="mb-4">
              {post.category}
            </Badge>

            <h1 className="text-balance text-3xl font-extrabold leading-[1.15] sm:text-4xl lg:text-[2.9rem]">
              {post.title}
            </h1>

            <p className="mt-4 text-pretty text-lg leading-relaxed text-ink-500 dark:text-ink-300">
              {post.excerpt}
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-between gap-5">
              <div className="flex items-center gap-3">
                <Avatar src={post.author.avatar} name={post.author.name} size="lg" />
                <div>
                  <p className="text-sm font-bold">{post.author.name}</p>
                  <p className="text-xs text-ink-500 dark:text-ink-400">{post.author.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-ink-500 dark:text-ink-400">
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, { month: 'long' })}</time>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-4" aria-hidden="true" />
                  {minutes} min read
                </span>
              </div>
            </div>
          </Container>
        </div>

        {/* Cover */}
        <Container size="narrow" className="-mt-2 pt-10">
          <img
            src={post.cover}
            alt=""
            className="aspect-[21/9] w-full rounded-3xl object-cover shadow-card"
            loading="eager"
          />
        </Container>

        {/* Body */}
        <Section size="tight">
          <Container size="prose">
            <div className="space-y-6">
              {post.body.map((block, i) => {
                if (block.type === 'h2') {
                  return (
                    <h2 key={i} className="pt-4 text-2xl font-extrabold sm:text-[1.75rem]">
                      {block.text}
                    </h2>
                  )
                }
                if (block.type === 'quote') {
                  return (
                    <blockquote
                      key={i}
                      className="border-l-4 border-brand-500 bg-brand-50/60 py-4 pl-6 pr-4 text-lg font-semibold italic text-ink-800 dark:bg-brand-500/10 dark:text-ink-100"
                    >
                      {block.text}
                    </blockquote>
                  )
                }
                return (
                  <p key={i} className="text-pretty text-[1.05rem] leading-[1.75] text-ink-600 dark:text-ink-300">
                    {block.text}
                  </p>
                )
              })}
            </div>

            {/* Tags + share */}
            <div className="mt-12 flex flex-wrap items-center justify-between gap-6 border-y border-ink-200/70 py-6 dark:border-white/10">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-ink-100 px-3 py-1.5 text-xs font-semibold text-ink-600 dark:bg-white/[.06] dark:text-ink-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-ink-500 dark:text-ink-400">Share</span>
                {[
                  { label: 'Twitter', icon: Twitter, href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}` },
                  { label: 'Facebook', icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
                  { label: 'LinkedIn', icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={`Share on ${social.label}`}
                    className="grid size-9 place-items-center rounded-xl border border-ink-200 text-ink-500 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600 dark:border-white/10 dark:text-ink-400 dark:hover:bg-white/5"
                  >
                    <social.icon className="size-4" aria-hidden="true" />
                  </a>
                ))}
                <button
                  type="button"
                  onClick={onCopy}
                  aria-label="Copy article link"
                  className="grid size-9 place-items-center rounded-xl border border-ink-200 text-ink-500 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600 dark:border-white/10 dark:text-ink-400 dark:hover:bg-white/5"
                >
                  {copied ? <Check className="size-4 text-emerald-500" /> : <Link2 className="size-4" />}
                </button>
              </div>
            </div>

            {/* Author card */}
            <div className="surface mt-10 flex flex-wrap items-center gap-5 p-6">
              <Avatar src={post.author.avatar} name={post.author.name} size="2xl" />
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold">{post.author.name}</p>
                <p className="mt-0.5 text-sm text-ink-500 dark:text-ink-400">{post.author.role} at Eventspady</p>
                <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
                  Writing about the practical side of running events — what actually moves tickets and keeps a
                  door calm.
                </p>
              </div>
            </div>

            <Button to="/blog" variant="ghost" iconLeft={ArrowLeft} className="mt-8">
              Back to all articles
            </Button>
          </Container>
        </Section>
      </article>

      {/* Related */}
      {fallback.length > 0 && (
        <Section size="tight" className="border-t border-ink-200/70 bg-ink-50 dark:border-white/10 dark:bg-white/[.02]">
          <Container>
            <h2 className="mb-8 text-2xl font-extrabold">Keep reading</h2>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {fallback.map((item) => (
                <article
                  key={item.id}
                  className="surface group relative flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-card"
                >
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={item.cover}
                      alt=""
                      loading="lazy"
                      className="size-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <Badge tone="brand" size="sm" className="mb-3 self-start">
                      {item.category}
                    </Badge>
                    <h3 className="text-base font-bold leading-snug">
                      <Link
                        to={`/blog/${item.slug}`}
                        className="transition after:absolute after:inset-0 hover:text-brand-600 dark:hover:text-brand-400"
                      >
                        {item.title}
                      </Link>
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-ink-500 dark:text-ink-400">{item.excerpt}</p>
                    <p className="mt-4 text-xs text-ink-400">{formatDate(item.publishedAt)}</p>
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </Section>
      )}
    </>
  )
}
