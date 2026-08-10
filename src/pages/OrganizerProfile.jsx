import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { BadgeCheck, CalendarDays, Heart, MapPin, Share2, Users } from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { Container, Section } from '@components/ui/Section'
import { Breadcrumbs } from '@components/ui/Breadcrumbs'
import { Badge } from '@components/ui/Badge'
import { Button } from '@components/ui/Button'
import { Rating } from '@components/ui/Rating'
import { Tabs } from '@components/ui/Tabs'
import { EmptyState } from '@components/ui/EmptyState'
import { EventCard } from '@components/events/EventCard'
import { useToast } from '@context/ToastContext'
import { getOrganizer } from '@data/organizers'
import { eventsByOrganizer } from '@data/events'
import { SITE } from '@lib/constants'
import { formatCompact } from '@lib/utils'
import NotFound from '@pages/NotFound'

export default function OrganizerProfile() {
  const { organizerId } = useParams()
  const organizer = getOrganizer(organizerId)
  const [tab, setTab] = useState('upcoming')
  const [following, setFollowing] = useState(false)
  const toast = useToast()

  if (!organizer) return <NotFound />

  const all = eventsByOrganizer(organizer.id)
  const upcoming = all.filter((e) => new Date(e.start) > new Date())
  const past = all.filter((e) => new Date(e.start) <= new Date())
  const list = tab === 'upcoming' ? upcoming : past

  const onFollow = () => {
    setFollowing((v) => !v)
    toast.success(following ? `Unfollowed ${organizer.name}.` : `Following ${organizer.name} — you will hear about new events first.`)
  }

  const onShare = async () => {
    try {
      await navigator.clipboard.writeText(`${SITE.url}/organizers/${organizer.id}`)
      toast.success('Profile link copied.')
    } catch {
      toast.error('Could not copy the link.')
    }
  }

  return (
    <>
      <Seo
        title={organizer.name}
        description={organizer.bio}
        image={organizer.logo}
        type="profile"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: organizer.name,
          description: organizer.bio,
          url: `${SITE.url}/organizers/${organizer.id}`,
          logo: `${SITE.url}${organizer.logo}`,
          address: { '@type': 'PostalAddress', addressLocality: organizer.location },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: organizer.rating,
            reviewCount: organizer.reviews,
          },
        }}
      />

      {/* Profile header */}
      <div className="relative overflow-hidden bg-ink-950 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-ink-950 to-ink-950" aria-hidden="true" />
        <div
          className="absolute inset-0 bg-grid-dark [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_40%_0%,black,transparent_70%)]"
          aria-hidden="true"
        />

        <Container className="relative py-10 sm:py-14">
          <Breadcrumbs
            tone="inverse"
            items={[{ label: 'Organizers', to: '/organizers' }, { label: organizer.name }]}
            className="mb-8"
          />

          <div className="flex flex-wrap items-start gap-6">
            <img
              src={organizer.logo}
              alt=""
              className="size-24 shrink-0 rounded-3xl object-cover ring-4 ring-white/10 sm:size-28"
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-extrabold sm:text-4xl">{organizer.name}</h1>
                {organizer.verified && (
                  <Badge tone="info" size="md" icon={BadgeCheck}>
                    Verified
                  </Badge>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/70">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" aria-hidden="true" />
                  {organizer.location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-4" aria-hidden="true" />
                  Organizing since {organizer.since}
                </span>
                <Rating value={organizer.rating} count={organizer.reviews} className="text-white" />
              </div>

              <p className="mt-4 max-w-2xl text-pretty text-white/70">{organizer.bio}</p>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <Button
                  onClick={onFollow}
                  variant={following ? 'accent' : 'primary'}
                  iconLeft={Heart}
                >
                  {following ? 'Following' : 'Follow'}
                </Button>
                <Button
                  onClick={onShare}
                  variant="outline"
                  iconLeft={Share2}
                  className="border-white/20 bg-white/5 text-white hover:bg-white/15 hover:text-white"
                >
                  Share profile
                </Button>
              </div>
            </div>

            {/* Stats */}
            <dl className="grid w-full grid-cols-3 gap-4 border-t border-white/10 pt-6 sm:w-auto sm:border-0 sm:pt-0 lg:gap-8">
              {[
                { label: 'Events hosted', value: organizer.events },
                { label: 'Followers', value: formatCompact(organizer.followers) },
                { label: 'Reviews', value: formatCompact(organizer.reviews) },
              ].map((stat) => (
                <div key={stat.label} className="text-center sm:text-right">
                  <dd className="text-2xl font-extrabold sm:text-3xl">{stat.value}</dd>
                  <dt className="mt-0.5 text-xs text-white/50">{stat.label}</dt>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </div>

      <Section size="tight">
        <Container>
          <Tabs
            tabs={[
              { id: 'upcoming', label: 'Upcoming events', count: upcoming.length },
              { id: 'past', label: 'Past events', count: past.length },
            ]}
            active={tab}
            onChange={setTab}
            variant="pill"
            className="mb-8 w-full sm:w-auto"
          />

          {list.length === 0 ? (
            <EmptyState
              icon={Users}
              title={tab === 'upcoming' ? 'No events on sale right now' : 'No past events listed'}
              description={
                tab === 'upcoming'
                  ? `Follow ${organizer.name} and we will let you know the moment something new goes live.`
                  : 'Past events will be archived here once they have happened.'
              }
              action={
                tab === 'upcoming' && (
                  <Button onClick={onFollow} variant="outline" iconLeft={Heart}>
                    {following ? 'Following' : `Follow ${organizer.name}`}
                  </Button>
                )
              }
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  )
}
