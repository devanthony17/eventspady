import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BadgeCheck, MapPin, Search, Users } from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { PageHero } from '@components/layout/PageHero'
import { Container, Section } from '@components/ui/Section'
import { Badge } from '@components/ui/Badge'
import { Button } from '@components/ui/Button'
import { Rating } from '@components/ui/Rating'
import { EmptyState } from '@components/ui/EmptyState'
import { useOrganizers, useEvents } from '@hooks/api'
import { formatCompact } from '@lib/utils'

export default function Organizers() {
  const [query, setQuery] = useState('')
  const { data: organizersData, isLoading: organizersLoading } = useOrganizers()
  const { data: eventsData } = useEvents()

  const organizers = useMemo(() => {
    if (Array.isArray(organizersData)) return organizersData
    return organizersData?.organizers || organizersData?.data || []
  }, [organizersData])

  const allEvents = useMemo(() => {
    if (Array.isArray(eventsData)) return eventsData
    return eventsData?.events || eventsData?.data || []
  }, [eventsData])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return organizers
    return organizers.filter((o) => `${o.name || ''} ${o.location || o.city || ''} ${o.bio || ''}`.toLowerCase().includes(q))
  }, [query, organizers])

  return (
    <>
      <Seo
        title="Organizers"
        description="Discover the teams behind the best events on Eventspady — festivals, conferences, dinners, retreats and tournaments."
        keywords="event organizers, event companies, promoters, event hosts"
      />

      <PageHero
        eyebrow="Meet the hosts"
        title="Organizers on Eventspady"
        description="From festival producers to chef-led supper clubs — follow the teams whose events you keep coming back to."
        breadcrumbs={[{ label: 'Organizers' }]}
      >
        <div className="relative max-w-lg">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ink-400" aria-hidden="true" />
          <label htmlFor="organizer-search" className="sr-only">
            Search organizers
          </label>
          <input
            id="organizer-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or city…"
            className="field h-12 pl-12"
          />
        </div>
      </PageHero>

      <Section>
        <Container>
          {filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No organizers found"
              description="Try a different name or city."
              action={
                <Button variant="outline" onClick={() => setQuery('')}>
                  Clear search
                </Button>
              }
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((organizer) => {
                const liveEvents = allEvents.filter(
                  (e) => e.organizerId === organizer.id || e.organizer?.id === organizer.id,
                ).length

                return (
                  <article
                    key={organizer.id}
                    className="surface group relative flex flex-col p-6 transition duration-300 hover:-translate-y-1 hover:shadow-card"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={organizer.logo}
                        alt=""
                        loading="lazy"
                        className="size-14 shrink-0 rounded-2xl object-cover"
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h2 className="text-base font-bold">
                            <Link
                              to={`/organizers/${organizer.id}`}
                              className="transition after:absolute after:inset-0 hover:text-brand-600 dark:hover:text-brand-400"
                            >
                              {organizer.name}
                            </Link>
                          </h2>
                          {organizer.verified && (
                            <BadgeCheck className="size-4 shrink-0 text-sky-500" aria-label="Verified organizer" />
                          )}
                        </div>
                        <p className="mt-1 flex items-center gap-1 text-xs text-ink-500 dark:text-ink-400">
                          <MapPin className="size-3 shrink-0" aria-hidden="true" />
                          {organizer.location}
                        </p>
                        <Rating value={organizer.rating} count={organizer.reviews} size="sm" className="mt-2" />
                      </div>
                    </div>

                    <p className="mt-4 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-500 dark:text-ink-400">
                      {organizer.bio}
                    </p>

                    <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-ink-200/70 pt-4 text-center dark:border-white/10">
                      <div>
                        <dd className="text-base font-extrabold">{liveEvents}</dd>
                        <dt className="text-[11px] text-ink-400">On sale</dt>
                      </div>
                      <div>
                        <dd className="text-base font-extrabold">{organizer.events}</dd>
                        <dt className="text-[11px] text-ink-400">Hosted</dt>
                      </div>
                      <div>
                        <dd className="text-base font-extrabold">{formatCompact(organizer.followers)}</dd>
                        <dt className="text-[11px] text-ink-400">Followers</dt>
                      </div>
                    </dl>
                  </article>
                )
              })}
            </div>
          )}

          {/* Become an organizer */}
          <div className="mt-14 flex flex-col items-start gap-6 rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-ink-950 p-8 text-white sm:flex-row sm:items-center sm:justify-between sm:p-12">
            <div>
              <Badge tone="glass" size="md" className="mb-3">
                Free to list
              </Badge>
              <h2 className="text-2xl font-extrabold sm:text-3xl">Want to see your name here?</h2>
              <p className="mt-2 max-w-lg text-sm text-white/75">
                Publish your first event in minutes. You only pay commission on tickets you actually sell.
              </p>
            </div>
            <Button to="/organizer" size="lg" variant="accent" iconRight={ArrowRight} className="shrink-0">
              Start organizing
            </Button>
          </div>
        </Container>
      </Section>
    </>
  )
}
