import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  BadgeCheck,
  CalendarDays,
  Check,
  Clock,
  Copy,
  Facebook,
  Flag,
  Globe,
  Heart,
  Link2,
  MapPin,
  Share2,
  Twitter,
  Users,
  Video,
} from 'lucide-react'
import { Seo, eventJsonLd } from '@components/ui/Seo'
import { Container, Section } from '@components/ui/Section'
import { Breadcrumbs } from '@components/ui/Breadcrumbs'
import { Badge } from '@components/ui/Badge'
import { Button } from '@components/ui/Button'
import { Rating } from '@components/ui/Rating'
import { Tabs } from '@components/ui/Tabs'
import { Accordion } from '@components/ui/Accordion'
import { EventCard } from '@components/events/EventCard'
import { MobileTicketBar, TicketSelector } from '@components/events/TicketSelector'
import { ReportEventModal } from '@components/events/ReportEventModal'
import { useWishlist } from '@hooks/useWishlist'
import { useToast } from '@context/ToastContext'
import { getEventBySlug, relatedEvents } from '@data/events'
import { SITE } from '@lib/constants'
import { cn, formatDate, formatDateRange, formatTime } from '@lib/utils'
import NotFound from '@pages/NotFound'

export default function EventDetail() {
  const { slug } = useParams()
  const event = getEventBySlug(slug)

  const [scheduleDay, setScheduleDay] = useState(0)
  const [reportOpen, setReportOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const { has, toggle } = useWishlist()
  const toast = useToast()

  if (!event) return <NotFound />

  const saved = has(event.id)
  const isOnline = event.type === 'online'
  const shareUrl = `${SITE.url}/events/${event.slug}`
  const related = relatedEvents(event, 3)
  const soldPercent = Math.round((event.sold / event.capacity) * 100)

  const onCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('Event link copied to your clipboard.')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy the link — you can copy it from the address bar.')
    }
  }

  const onToggleSave = () => {
    const added = toggle(event.id)
    toast.success(added ? 'Added to your saved events.' : 'Removed from your saved events.')
  }

  return (
    <>
      <Seo
        title={event.title}
        description={event.tagline}
        image={event.cover}
        type="article"
        keywords={[event.title, event.categoryMeta?.name, event.venue?.city, ...event.tags].filter(Boolean).join(', ')}
        jsonLd={eventJsonLd(event)}
      />

      {/* Hero */}
      <div className="relative overflow-hidden bg-ink-950 text-white">
        <img src={event.cover} alt="" className="absolute inset-0 size-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/85 to-ink-950/50" aria-hidden="true" />

        <Container className="relative py-10 sm:py-14 lg:py-16">
          <Breadcrumbs
            tone="inverse"
            items={[
              { label: 'Events', to: '/events' },
              { label: event.categoryMeta?.name ?? 'Category', to: `/events?category=${event.category}` },
              { label: event.title },
            ]}
            className="mb-6"
          />

          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand" size="md">
              {event.categoryMeta?.name}
            </Badge>
            <Badge tone="glass" size="md" icon={isOnline ? Video : MapPin}>
              {isOnline ? 'Online event' : `${event.venue.city}, ${event.venue.country}`}
            </Badge>
            {event.soldOut && (
              <Badge tone="danger" size="md">
                Sold out
              </Badge>
            )}
            {event.ageLimit !== 'All ages' && (
              <Badge tone="glass" size="md">
                {event.ageLimit}
              </Badge>
            )}
          </div>

          <h1 className="mt-4 max-w-4xl text-balance text-3xl font-extrabold leading-[1.12] sm:text-4xl lg:text-[3.25rem]">
            {event.title}
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-base text-white/70 sm:text-lg">{event.tagline}</p>

          <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-4">
            <div className="flex items-center gap-2.5">
              <CalendarDays className="size-5 shrink-0 text-accent-400" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold">{formatDateRange(event.start, event.end)}</p>
                <p className="text-xs text-white/55">Local time at the venue</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {isOnline ? (
                <Globe className="size-5 shrink-0 text-accent-400" aria-hidden="true" />
              ) : (
                <MapPin className="size-5 shrink-0 text-accent-400" aria-hidden="true" />
              )}
              <div>
                <p className="text-sm font-semibold">{isOnline ? event.online.platform : event.venue.name}</p>
                <p className="text-xs text-white/55">
                  {isOnline ? 'Join link on your ticket' : event.venue.address}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Users className="size-5 shrink-0 text-accent-400" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold">{event.sold.toLocaleString()} going</p>
                <p className="text-xs text-white/55">{soldPercent}% of capacity booked</p>
              </div>
            </div>

            <Rating value={event.rating} count={event.reviewsCount} className="text-white" />
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-2">
            <Button
              variant={saved ? 'accent' : 'outline'}
              size="sm"
              iconLeft={Heart}
              onClick={onToggleSave}
              className={cn(!saved && 'border-white/20 bg-white/5 text-white hover:bg-white/15 hover:text-white')}
            >
              {saved ? 'Saved' : 'Save event'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              iconLeft={copied ? Check : Link2}
              onClick={onCopyLink}
              className="border-white/20 bg-white/5 text-white hover:bg-white/15 hover:text-white"
            >
              {copied ? 'Link copied' : 'Copy link'}
            </Button>

            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(event.title)}`}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Share on Twitter"
              className="grid size-9 place-items-center rounded-xl border border-white/20 bg-white/5 text-white transition hover:bg-white/15"
            >
              <Twitter className="size-4" aria-hidden="true" />
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Share on Facebook"
              className="grid size-9 place-items-center rounded-xl border border-white/20 bg-white/5 text-white transition hover:bg-white/15"
            >
              <Facebook className="size-4" aria-hidden="true" />
            </a>

            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-white/50 transition hover:text-rose-300"
            >
              <Flag className="size-3.5" aria-hidden="true" />
              Report event
            </button>
          </div>
        </Container>
      </div>

      <Section size="tight" className="pb-28 lg:pb-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-12">
            {/* Main column */}
            <div className="min-w-0 space-y-12">
              {/* About */}
              <section>
                <h2 className="text-2xl font-extrabold">About this event</h2>
                <div className="mt-4 space-y-4 text-pretty leading-relaxed text-ink-600 dark:text-ink-300">
                  {event.description.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>

                {event.highlights?.length > 0 && (
                  <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                    {event.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-start gap-2.5">
                        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                          <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                        </span>
                        <span className="text-sm text-ink-600 dark:text-ink-300">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {event.tags?.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <Link
                        key={tag}
                        to={`/events?q=${encodeURIComponent(tag)}`}
                        className="rounded-full bg-ink-100 px-3 py-1.5 text-xs font-semibold text-ink-600 transition hover:bg-brand-100 hover:text-brand-700 dark:bg-white/[.06] dark:text-ink-300 dark:hover:bg-brand-500/20"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                )}
              </section>

              {/* Gallery */}
              {event.gallery?.length > 0 && (
                <section>
                  <h2 className="text-2xl font-extrabold">Gallery</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {event.gallery.map((image, i) => (
                      <img
                        key={image}
                        src={image}
                        alt={`${event.title} — photo ${i + 1}`}
                        loading="lazy"
                        className="aspect-[4/3] w-full rounded-2xl object-cover transition duration-300 hover:scale-[1.02]"
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Schedule */}
              {event.schedule?.length > 0 && (
                <section>
                  <h2 className="text-2xl font-extrabold">Schedule</h2>
                  <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
                    {event.schedule.length > 1
                      ? `${event.schedule.length} days of programming — pick a day to see its agenda.`
                      : 'The full agenda for the day.'}
                  </p>

                  {event.schedule.length > 1 && (
                    <Tabs
                      tabs={event.schedule.map((day, i) => ({ id: i, label: day.day }))}
                      active={scheduleDay}
                      onChange={setScheduleDay}
                      variant="pill"
                      className="mt-5"
                    />
                  )}

                  <ol className="mt-6 space-y-1">
                    {event.schedule[scheduleDay]?.items.map((item, i) => (
                      <li
                        key={`${item.time}-${i}`}
                        className="group relative flex gap-5 rounded-2xl p-4 transition hover:bg-ink-50 dark:hover:bg-white/[.03]"
                      >
                        <div className="flex w-16 shrink-0 flex-col items-center">
                          <span className="text-sm font-extrabold tabular-nums text-brand-600 dark:text-brand-400">
                            {item.time}
                          </span>
                          <span className="mt-2 w-px flex-1 bg-ink-200 group-last:hidden dark:bg-white/10" />
                        </div>
                        <div className="min-w-0 flex-1 pb-2">
                          <h3 className="text-sm font-bold sm:text-base">{item.title}</h3>
                          {item.speaker && (
                            <p className="mt-0.5 text-xs font-semibold text-ink-500 dark:text-ink-400">
                              {item.speaker}
                            </p>
                          )}
                          {item.description && (
                            <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-400">{item.description}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {/* Location */}
              <section>
                <h2 className="text-2xl font-extrabold">{isOnline ? 'How to join' : 'Location'}</h2>

                {isOnline ? (
                  <div className="surface mt-4 flex items-start gap-4 p-5">
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
                      <Video className="size-6" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-bold">{event.online.platform}</p>
                      <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{event.online.joinNote}</p>
                    </div>
                  </div>
                ) : (
                  <div className="surface mt-4 overflow-hidden">
                    {/* Static map placeholder — swap for your map provider's embed */}
                    <div className="relative aspect-[21/9] bg-gradient-to-br from-brand-100 to-accent-100 dark:from-brand-950 dark:to-ink-900">
                      <div
                        className="absolute inset-0 bg-grid-light [background-size:32px_32px] dark:bg-grid-dark"
                        aria-hidden="true"
                      />
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <span className="relative grid size-12 place-items-center rounded-full bg-brand-600 text-white shadow-lift">
                          <MapPin className="size-6" aria-hidden="true" />
                          <span className="absolute inset-0 animate-ping rounded-full bg-brand-500/40" />
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 p-5">
                      <div>
                        <p className="font-bold">{event.venue.name}</p>
                        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{event.venue.address}</p>
                      </div>
                      <Button
                        href={`https://www.google.com/maps/search/?api=1&query=${event.venue.lat},${event.venue.lng}`}
                        target="_blank"
                        rel="noreferrer noopener"
                        variant="outline"
                        size="sm"
                        iconLeft={MapPin}
                      >
                        Get directions
                      </Button>
                    </div>
                  </div>
                )}
              </section>

              {/* Organizer */}
              <section>
                <h2 className="text-2xl font-extrabold">Organized by</h2>
                <div className="surface mt-4 p-6">
                  <div className="flex flex-wrap items-start gap-5">
                    <img
                      src={event.organizer.logo}
                      alt=""
                      className="size-16 shrink-0 rounded-2xl object-cover"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold">{event.organizer.name}</h3>
                        {event.organizer.verified && (
                          <Badge tone="info" size="sm" icon={BadgeCheck}>
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
                        {event.organizer.location} · organizing since {event.organizer.since}
                      </p>
                      <p className="mt-3 text-pretty text-sm leading-relaxed text-ink-600 dark:text-ink-300">
                        {event.organizer.bio}
                      </p>

                      <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
                        {[
                          { label: 'Events', value: event.organizer.events },
                          { label: 'Followers', value: event.organizer.followers.toLocaleString() },
                          { label: 'Rating', value: `${event.organizer.rating} / 5` },
                        ].map((stat) => (
                          <div key={stat.label}>
                            <dd className="text-lg font-extrabold">{stat.value}</dd>
                            <dt className="text-xs text-ink-400">{stat.label}</dt>
                          </div>
                        ))}
                      </dl>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <Button to={`/organizers/${event.organizerId}`} size="sm" variant="outline">
                          View profile
                        </Button>
                        <Button to="/contact" size="sm" variant="ghost">
                          Contact organizer
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* FAQ */}
              {event.faq?.length > 0 && (
                <section>
                  <h2 className="text-2xl font-extrabold">Frequently asked</h2>
                  <Accordion items={event.faq} defaultOpen={[0]} className="mt-2" />
                </section>
              )}
            </div>

            {/* Sidebar */}
            <aside className="min-w-0">
              <div className="sticky top-24 space-y-5">
                <div id="tickets" className="scroll-mt-24">
                  <TicketSelector event={event} />
                </div>

                {/* Availability */}
                <div className="surface p-5">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold">Tickets sold</span>
                    <span className="font-bold text-brand-600 dark:text-brand-400">{soldPercent}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-ink-100 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all"
                      style={{ width: `${soldPercent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-ink-500 dark:text-ink-400">
                    {event.sold.toLocaleString()} of {event.capacity.toLocaleString()} tickets claimed
                  </p>
                </div>

                {/* Quick facts */}
                <div className="surface divide-y divide-ink-200/70 p-5 dark:divide-white/10">
                  {[
                    { icon: CalendarDays, label: 'Starts', value: formatDate(event.start, { weekday: 'short' }) },
                    { icon: Clock, label: 'Doors', value: formatTime(event.start) },
                    { icon: isOnline ? Video : MapPin, label: 'Format', value: isOnline ? 'Online' : 'In person' },
                    { icon: Users, label: 'Age limit', value: event.ageLimit },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                      <row.icon className="size-4 shrink-0 text-ink-400" aria-hidden="true" />
                      <span className="text-sm text-ink-500 dark:text-ink-400">{row.label}</span>
                      <span className="ml-auto text-sm font-semibold">{row.value}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={onCopyLink}
                  className="surface flex w-full items-center gap-3 p-4 text-left transition hover:border-brand-300 dark:hover:border-brand-500/40"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                    <Share2 className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">Share this event</span>
                    <span className="block truncate text-xs text-ink-400">{shareUrl}</span>
                  </span>
                  {copied ? (
                    <Check className="size-4 shrink-0 text-emerald-500" aria-hidden="true" />
                  ) : (
                    <Copy className="size-4 shrink-0 text-ink-400" aria-hidden="true" />
                  )}
                </button>
              </div>
            </aside>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div className="mt-16 border-t border-ink-200/70 pt-12 dark:border-white/10">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold">You might also like</h2>
                  <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-400">
                    More events in {event.categoryMeta?.name} and beyond.
                  </p>
                </div>
                <Button to="/events" variant="outline" size="sm">
                  Browse all
                </Button>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <EventCard key={item.id} event={item} />
                ))}
              </div>
            </div>
          )}
        </Container>
      </Section>

      <MobileTicketBar event={event} />
      <ReportEventModal open={reportOpen} onClose={() => setReportOpen(false)} event={event} />
    </>
  )
}
