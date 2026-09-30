import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  Briefcase,
  Cpu,
  HeartHandshake,
  Landmark,
  Music,
  Palette,
  Ticket,
  Trophy,
  UtensilsCrossed,
} from 'lucide-react'
import { Button } from '@components/ui/Button'
import { Container } from '@components/ui/Section'
import { usePrefersReducedMotion } from '@hooks/useMediaQuery'
import { useLandingCms, useCategories } from '@hooks/api'
import { cn } from '@lib/utils'

const CATEGORY_ICONS = {
  music: Music,
  culture: Landmark,
  business: Briefcase,
  sports: Trophy,
  tech: Cpu,
  arts: Palette,
  food: UtensilsCrossed,
  community: HeartHandshake,
}

const DEFAULT_CATEGORIES = [
  { id: 'music', name: 'Music', icon: Music },
  { id: 'culture', name: 'Culture & Festivals', icon: Landmark },
  { id: 'business', name: 'Business & Networking', icon: Briefcase },
  { id: 'sports', name: 'Sports & Fitness', icon: Trophy },
  { id: 'tech', name: 'Technology & Gaming', icon: Cpu },
  { id: 'arts', name: 'Arts & Theatre', icon: Palette },
  { id: 'food', name: 'Food & Drink', icon: UtensilsCrossed },
  { id: 'community', name: 'Community & Charity', icon: HeartHandshake },
]

/**
 * Three looping clips crossfade behind the hero.
 * Files live in `public/videos` (see the README there); until one loads the
 * animated SVG in `poster` shows through, so the section is never blank.
 */
const HERO_MEDIA = [
  { webp: '/videos/hero.webp', poster: '/images/hero/motion-1.svg' },
  { webp: '/videos/hero2.webp', poster: '/images/hero/motion-2.svg' },
  { webp: '/videos/hero3.webp', poster: '/images/hero/motion-3.svg' },
]

const ROTATE_MS = 7000

/** A single masked line that rises into view. */
function Reveal({ children, delay = 0, className, as: Tag = 'span' }) {
  return (
    <Tag className={cn('block overflow-hidden pb-[0.12em]', className)}>
      <span className="block animate-reveal-up" style={{ animationDelay: `${delay}ms` }}>
        {children}
      </span>
    </Tag>
  )
}

export function Hero() {
  const { data: cmsData } = useLandingCms()
  const { data: categoriesData } = useCategories()

  const categories = useMemo(() => {
    const raw = Array.isArray(categoriesData)
      ? categoriesData
      : Array.isArray(categoriesData?.categories)
        ? categoriesData.categories
        : Array.isArray(categoriesData?.data)
          ? categoriesData.data
          : DEFAULT_CATEGORIES

    return raw.map((cat) => ({
      ...cat,
      icon: cat.icon || CATEGORY_ICONS[cat.id] || Ticket,
    }))
  }, [categoriesData])

  const hero = cmsData?.hero || cmsData?.data?.hero || {
    badge: 'Wa · Upper West Region',
    titleLine1: 'Find your next',
    titleHighlight: 'unforgettable',
    titleLine2: 'event',
    description:
      'Festivals, conferences and community nights across Wa and the Upper West — book in seconds and walk in with a QR code on your phone.',
    primaryCtaText: 'Browse events',
    secondaryCtaText: 'Create an event',
  }

  const [active, setActive] = useState(0)
  const [progress, setProgress] = useState(0)
  const reducedMotion = usePrefersReducedMotion()
  const frame = useRef(0)

  useEffect(() => {
    if (reducedMotion) return
    const id = setInterval(() => setActive((i) => (i + 1) % HERO_MEDIA.length), ROTATE_MS)
    return () => clearInterval(id)
  }, [reducedMotion])

  // Scroll-out parallax: the copy drifts up and fades as the next section arrives.
  useEffect(() => {
    if (reducedMotion) return

    const onScroll = () => {
      cancelAnimationFrame(frame.current)
      frame.current = requestAnimationFrame(() => {
        const travel = window.innerHeight * 0.85
        setProgress(Math.min(1, Math.max(0, window.scrollY / travel)))
      })
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame.current)
    }
  }, [reducedMotion])

  // Copy leaves faster than the backdrop, which is what sells the depth.
  const copyStyle = reducedMotion
    ? undefined
    : {
        transform: `translate3d(0, ${(-progress * 140).toFixed(1)}px, 0)`,
        opacity: Math.max(0, 1 - progress * 1.35),
        filter: progress > 0.35 ? `blur(${((progress - 0.35) * 8).toFixed(1)}px)` : undefined,
      }

  // The video itself drifts a little slower for a layered parallax.
  const mediaStyle = reducedMotion
    ? undefined
    : { transform: `translate3d(0, ${(progress * 48).toFixed(1)}px, 0) scale(${(1 + progress * 0.06).toFixed(3)})` }

  return (
    <>
      {/*
        Fixed backdrop: it stays pinned to the viewport while the page scrolls,
        so every following section slides over it. Sits behind the content
        layer, which is opaque from <StatsStrip> onwards.
      */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 will-change-transform" style={mediaStyle}>
          {HERO_MEDIA.map((media, i) => (
            <div
              key={media.webp}
              className={cn(
                'absolute inset-0 transition-opacity duration-[1600ms] ease-in-out',
                i === active ? 'opacity-100' : 'opacity-0',
              )}
            >
              <img
                src={media.webp}
                alt=""
                loading={i === 0 ? 'eager' : 'lazy'}
                className="absolute inset-0 size-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = media.poster
                }}
              />
            </div>
          ))}
        </div>

        {/* Legibility scrim */}
        <div className="absolute inset-0 bg-gradient-to-br from-ink-950/85 via-ink-950/55 to-ink-950/85" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink-950 to-transparent" />
      </div>

      <section className="relative z-10 flex min-h-[100svh] items-center text-white lg:items-start">
        <Container className="w-full py-24 lg:pt-[17vh]">
          <div
            className="flex flex-col items-center text-center will-change-transform lg:max-w-3xl lg:items-start lg:text-left"
            style={copyStyle}
          >
            <Reveal delay={80}>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[.08] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/80 backdrop-blur-md">
                {hero.badge}
              </span>
            </Reveal>

            <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.06] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
              <Reveal delay={200}>{hero.titleLine1}</Reveal>
              <Reveal delay={330}>
                <span className="bg-gradient-to-r from-brand-200 via-white to-accent-300 bg-clip-text text-transparent">
                  {hero.titleHighlight}
                </span>{' '}
                {hero.titleLine2}
              </Reveal>
            </h1>

            <Reveal delay={470} className="mt-6 max-w-xl">
              <span className="block text-pretty text-base leading-relaxed text-white/70 sm:text-lg">
                {hero.description}
              </span>
            </Reveal>

            <Reveal delay={600} className="mt-9 w-full sm:w-auto">
              <span className="flex flex-col gap-3 sm:flex-row">
                <Button to="/events" size="xl" iconLeft={Ticket}>
                  {hero.primaryCtaText || 'Browse events'}
                </Button>
                <Button
                  to="/organizer"
                  size="xl"
                  variant="outline"
                  iconRight={ArrowRight}
                  className="border-white/25 bg-white/5 text-white backdrop-blur-md hover:border-white/40 hover:bg-white/15 hover:text-white"
                >
                  {hero.secondaryCtaText || 'Create an event'}
                </Button>
              </span>
            </Reveal>

            {/* Category shortcuts */}
            <Reveal delay={720} className="mt-12 w-full">
              <span className="flex flex-wrap justify-center gap-2 lg:justify-start">
                {categories.slice(0, 8).map((category) => (
                  <Button
                    key={category.id}
                    to={`/events?category=${category.id}`}
                    size="xs"
                    variant="ghost"
                    iconLeft={category.icon}
                    className="rounded-full border border-white/20 bg-white/[.06] text-white/80 backdrop-blur-md hover:bg-white/15 hover:text-white"
                  >
                    {category.name}
                  </Button>
                ))}
              </span>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  )
}
