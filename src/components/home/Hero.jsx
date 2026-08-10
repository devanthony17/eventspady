import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, MapPin, Search, Sparkles, Star, Ticket } from 'lucide-react'
import { Button } from '@components/ui/Button'
import { Badge } from '@components/ui/Badge'
import { Container } from '@components/ui/Section'
import { AvatarGroup } from '@components/ui/Avatar'
import { categories } from '@data/categories'
import { eventCities, events } from '@data/events'
import { calendarChip, formatCompact, formatCurrency } from '@lib/utils'

const ATTENDEES = [
  { name: 'Ada', avatar: '/images/avatars/avatar-1.svg' },
  { name: 'Liam', avatar: '/images/avatars/avatar-2.svg' },
  { name: 'Zoe', avatar: '/images/avatars/avatar-3.svg' },
  { name: 'Noah', avatar: '/images/avatars/avatar-4.svg' },
  { name: 'Mia', avatar: '/images/avatars/avatar-5.svg' },
  { name: 'Kai', avatar: '/images/avatars/avatar-6.svg' },
]

export function Hero() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('')
  const [when, setWhen] = useState('')

  const onSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (city) params.set('city', city)
    if (when) params.set('when', when)
    navigate(`/events${params.toString() ? `?${params}` : ''}`)
  }

  const spotlight = events.find((e) => e.featured) ?? events[0]
  const chip = calendarChip(spotlight.start)

  return (
    <section className="relative overflow-hidden bg-ink-950 text-white">
      {/* Layered background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-ink-950 to-ink-950" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-grid-dark [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_50%_0%,black,transparent_72%)]"
        aria-hidden="true"
      />
      <div
        className="absolute -left-32 -top-40 size-[36rem] rounded-full bg-brand-600/30 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-56 -right-24 size-[34rem] rounded-full bg-accent-500/20 blur-[120px]"
        aria-hidden="true"
      />

      <Container className="relative py-16 sm:py-20 lg:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          {/* Copy */}
          <div className="animate-fade-up">
            <Badge tone="glass" size="lg" icon={Sparkles} className="mb-6">
              Over {formatCompact(2400000)} tickets issued worldwide
            </Badge>

            <h1 className="text-balance text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl xl:text-[4.1rem]">
              Find your next{' '}
              <span className="relative whitespace-nowrap">
                <span className="bg-gradient-to-r from-brand-300 via-brand-200 to-accent-300 bg-clip-text text-transparent">
                  unforgettable
                </span>
                <svg
                  className="absolute -bottom-2 left-0 h-3 w-full text-accent-400"
                  viewBox="0 0 300 12"
                  fill="none"
                  aria-hidden="true"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 9C60 3 120 2 180 4c40 1.5 80 4 118 5"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{' '}
              event
            </h1>

            <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-white/70 sm:text-lg">
              Concerts, conferences, dinners and everything between — discover what is happening near you,
              book in seconds and walk in with a QR code on your phone.
            </p>

            {/* Search */}
            <form
              onSubmit={onSearch}
              className="mt-8 rounded-2xl border border-white/15 bg-white/[.07] p-2 backdrop-blur-xl sm:rounded-[1.4rem]"
            >
              <div className="grid gap-2 sm:grid-cols-[1.4fr_1fr_1fr_auto]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/50" aria-hidden="true" />
                  <label htmlFor="hero-q" className="sr-only">
                    Search events
                  </label>
                  <input
                    id="hero-q"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search events…"
                    className="h-12 w-full rounded-xl border-0 bg-white/[.06] pl-10 pr-3 text-sm text-white placeholder:text-white/45 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
                  />
                </div>

                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/50" aria-hidden="true" />
                  <label htmlFor="hero-city" className="sr-only">
                    City
                  </label>
                  <select
                    id="hero-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="h-12 w-full cursor-pointer appearance-none rounded-xl border-0 bg-white/[.06] pl-10 pr-3 text-sm text-white focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
                  >
                    <option value="" className="text-ink-900">
                      Anywhere
                    </option>
                    {eventCities().map((c) => (
                      <option key={c} value={c} className="text-ink-900">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/50" aria-hidden="true" />
                  <label htmlFor="hero-when" className="sr-only">
                    When
                  </label>
                  <select
                    id="hero-when"
                    value={when}
                    onChange={(e) => setWhen(e.target.value)}
                    className="h-12 w-full cursor-pointer appearance-none rounded-xl border-0 bg-white/[.06] pl-10 pr-3 text-sm text-white focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
                  >
                    <option value="" className="text-ink-900">
                      Any date
                    </option>
                    <option value="today" className="text-ink-900">
                      Today
                    </option>
                    <option value="weekend" className="text-ink-900">
                      This weekend
                    </option>
                    <option value="month" className="text-ink-900">
                      This month
                    </option>
                  </select>
                </div>

                <Button type="submit" size="lg" className="h-12 sm:px-6" iconLeft={Search}>
                  <span className="sm:hidden lg:inline">Search</span>
                </Button>
              </div>
            </form>

            {/* Category shortcuts */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/45">Popular:</span>
              {categories.slice(0, 5).map((category) => (
                <Button
                  key={category.id}
                  to={`/events?category=${category.id}`}
                  size="xs"
                  variant="ghost"
                  iconLeft={category.icon}
                  className="rounded-full border border-white/15 text-white/80 hover:bg-white/10 hover:text-white"
                >
                  {category.name}
                </Button>
              ))}
            </div>

            {/* Social proof */}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <div className="flex items-center gap-3">
                <AvatarGroup people={ATTENDEES} max={5} size="sm" />
                <p className="text-sm text-white/70">
                  <span className="font-bold text-white">92,000+</span> people booked this month
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="size-4 text-amber-400" fill="currentColor" aria-hidden="true" />
                ))}
                <span className="ml-1 text-sm text-white/70">
                  <span className="font-bold text-white">4.9</span>/5 average rating
                </span>
              </div>
            </div>
          </div>

         
        </div>
      </Container>
    </section>
  )
}
