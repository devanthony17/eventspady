import { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { CalendarDays, Copy, Eye, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { DashboardShell } from '@components/dashboard/DashboardShell'
import { Button } from '@components/ui/Button'
import { Badge } from '@components/ui/Badge'
import { Tabs } from '@components/ui/Tabs'
import { EmptyState } from '@components/ui/EmptyState'
import { useToast } from '@context/ToastContext'
import { eventsByOrganizer } from '@data/events'
import { cn, formatCurrency, formatDate } from '@lib/utils'

const ORGANIZER_ID = 'nova-collective'

export default function MyEvents() {
  const { nav } = useOutletContext()
  const [tab, setTab] = useState('published')
  const [menuFor, setMenuFor] = useState(null)
  const toast = useToast()

  const all = eventsByOrganizer(ORGANIZER_ID)
  const published = all.filter((e) => new Date(e.start) > new Date())
  const past = all.filter((e) => new Date(e.start) <= new Date())

  const list = tab === 'published' ? published : tab === 'past' ? past : []

  return (
    <>
      <Seo title="My events" noIndex />

      <DashboardShell
        nav={nav}
        eyebrow="Organizer panel"
        title="My events"
        description="Edit listings, watch sales and manage what is published."
        actions={
          <Button to="/organizer/events/new" size="sm" iconLeft={Plus}>
            New event
          </Button>
        }
      >
        <Tabs
          tabs={[
            { id: 'published', label: 'Published', count: published.length },
            { id: 'past', label: 'Past', count: past.length },
            { id: 'drafts', label: 'Drafts', count: 0 },
          ]}
          active={tab}
          onChange={setTab}
          variant="pill"
          className="mb-6 w-full sm:w-auto"
        />

        {list.length === 0 ? (
          <div className="surface">
            <EmptyState
              icon={CalendarDays}
              title={tab === 'drafts' ? 'No drafts saved' : 'Nothing here yet'}
              description="Create an event to start selling tickets — it takes a couple of minutes."
              action={
                <Button to="/organizer/events/new" iconLeft={Plus}>
                  Create an event
                </Button>
              }
            />
          </div>
        ) : (
          <div className="space-y-4">
            {list.map((event) => {
              const percent = Math.round((event.sold / event.capacity) * 100)
              const revenue = event.tickets.reduce((sum, t) => sum + t.price * t.sold, 0)

              return (
                <article key={event.id} className="surface p-4 sm:p-5">
                  <div className="flex flex-wrap items-start gap-4">
                    <img
                      src={event.cover}
                      alt=""
                      loading="lazy"
                      className="h-24 w-full shrink-0 rounded-xl object-cover sm:w-36"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/events/${event.slug}`}
                          className="text-base font-bold transition hover:text-brand-600 dark:hover:text-brand-400"
                        >
                          {event.title}
                        </Link>
                        <Badge tone={event.soldOut ? 'danger' : 'success'} size="sm">
                          {event.soldOut ? 'Sold out' : 'On sale'}
                        </Badge>
                        <Badge tone="neutral" size="sm">
                          {event.type === 'online' ? 'Online' : event.venue.city}
                        </Badge>
                      </div>

                      <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
                        {formatDate(event.start, { weekday: 'short' })} ·{' '}
                        {event.tickets.length} ticket {event.tickets.length === 1 ? 'type' : 'types'}
                      </p>

                      <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-sm">
                        <div>
                          <dd className="font-extrabold">{event.sold.toLocaleString()}</dd>
                          <dt className="text-xs text-ink-400">Sold</dt>
                        </div>
                        <div>
                          <dd className="font-extrabold">{event.remaining.toLocaleString()}</dd>
                          <dt className="text-xs text-ink-400">Remaining</dt>
                        </div>
                        <div>
                          <dd className="font-extrabold">{formatCurrency(revenue)}</dd>
                          <dt className="text-xs text-ink-400">Gross revenue</dt>
                        </div>
                        <div className="min-w-[8rem] flex-1">
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="text-ink-400">Capacity</span>
                            <span className="font-bold">{percent}%</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-ink-100 dark:bg-white/10">
                            <div
                              className={cn(
                                'h-full rounded-full',
                                percent > 85 ? 'bg-emerald-500' : percent > 50 ? 'bg-brand-500' : 'bg-amber-500',
                              )}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </dl>
                    </div>

                    {/* Row actions */}
                    <div className="relative flex shrink-0 items-center gap-2">
                      <Button to={`/events/${event.slug}`} variant="outline" size="sm" iconLeft={Eye}>
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        iconLeft={Pencil}
                        onClick={() => toast.info('Event editing opens the full listing form.')}
                      >
                        Edit
                      </Button>

                      <button
                        type="button"
                        onClick={() => setMenuFor(menuFor === event.id ? null : event.id)}
                        aria-label={`More actions for ${event.title}`}
                        aria-expanded={menuFor === event.id}
                        className="grid size-9 place-items-center rounded-xl text-ink-500 transition hover:bg-ink-100 dark:hover:bg-white/10"
                      >
                        <MoreVertical className="size-4" />
                      </button>

                      {menuFor === event.id && (
                        <div className="absolute right-0 top-full z-20 mt-1 w-48 animate-scale-in rounded-2xl border border-ink-200/70 bg-white p-1.5 shadow-card dark:border-white/10 dark:bg-ink-900">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(`${window.location.origin}/events/${event.slug}`)
                              toast.success('Event link copied.')
                              setMenuFor(null)
                            }}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-ink-600 transition hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-white/5"
                          >
                            <Copy className="size-4" aria-hidden="true" />
                            Copy link
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              toast.warning('Unpublishing hides the event from the website.')
                              setMenuFor(null)
                            }}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                            Unpublish
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </DashboardShell>
    </>
  )
}
