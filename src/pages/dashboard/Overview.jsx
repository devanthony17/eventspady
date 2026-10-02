import { useMemo, useCallback } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { ArrowRight, CalendarCheck, CreditCard, Heart } from 'lucide-react'
import { Ticket } from '@components/icons/AppIcons'
import { Seo } from '@components/ui/Seo'
import { DashboardShell } from '@components/dashboard/DashboardShell'
import { StatCard } from '@components/ui/StatCard'
import { Button } from '@components/ui/Button'
import { Badge } from '@components/ui/Badge'
import { EmptyState } from '@components/ui/EmptyState'
import { EventCard } from '@components/events/EventCard'
import { useAuth } from '@context/AuthContext'
import { useWishlist } from '@hooks/useWishlist'
import { useUserTickets, useUserNotifications, useEvents, useUserOverview } from '@hooks/api'
import { formatCurrency, formatDate, formatDateRange } from '@lib/utils'

export default function DashboardOverview() {
  const { nav } = useOutletContext()
  const { user } = useAuth()
  const { ids: savedIds } = useWishlist()
  const { data: ticketsData } = useUserTickets()
  const { data: notificationsData } = useUserNotifications()
  const { data: eventsData } = useEvents()
  const { data: overviewData } = useUserOverview()

  const events = useMemo(() => {
    if (Array.isArray(eventsData)) return eventsData
    return eventsData?.events || eventsData?.data || []
  }, [eventsData])

  const orders = useMemo(() => {
    if (Array.isArray(ticketsData)) return ticketsData
    return ticketsData?.tickets || ticketsData?.orders || ticketsData?.data || []
  }, [ticketsData])

  const notifications = useMemo(() => {
    if (Array.isArray(notificationsData)) return notificationsData
    return notificationsData?.notifications || notificationsData?.data || []
  }, [notificationsData])

  const getEventById = useCallback((id) => events.find((e) => e.id === id || e.slug === id), [events])

  const enrichedOrders = orders
    .map((order) => {
      const event = order.event || getEventById(order.eventId) || {
        id: order.eventId || order.id,
        title: order.eventTitle || order.event_title || 'Booked Event',
        start: order.eventStart || order.event_date || order.createdAt || new Date().toISOString(),
        cover: order.eventCover || '/images/events/miss-dumba.jpg',
        venue: { name: order.venueName || 'Wa', city: order.venueCity || 'Wa' },
      }
      return { order, event }
    })

  const upcoming = enrichedOrders
    .filter(({ event }) => new Date(event.start || event.startDate) > new Date())
    .sort((a, b) => new Date(a.event.start || a.event.startDate) - new Date(b.event.start || b.event.startDate))

  const calculatedTickets = orders.reduce(
    (sum, o) => sum + (o.items || []).reduce((s, i) => s + (i.quantity || 0), 0) || (o.quantity || 1),
    0,
  )
  const calculatedSpend = orders.reduce((sum, o) => sum + (o.total || o.price || 0), 0)

  const overview = overviewData?.overview || overviewData?.data || overviewData || {}
  const totalTickets = overview.totalTickets ?? overview.totalTicketsSold ?? calculatedTickets
  const totalSpend = overview.totalSpend ?? overview.walletBalance ?? calculatedSpend
  const unread = notifications.filter((n) => !n.read && !n.isRead)
  const bookedEventIds = new Set(orders.map((o) => o.eventId))
  const recommended = events
    .filter((e) => !bookedEventIds.has(e.id))
    .slice(0, 3)

  return (
    <>
      <Seo title="Dashboard" noIndex />

      <DashboardShell
        nav={nav}
        eyebrow={`Hello, ${user?.name?.split(' ')[0] ?? 'there'}`}
        title="Your dashboard"
        description="Everything you have booked, saved and spent — in one place."
        actions={
          <Button to="/events" size="sm" iconRight={ArrowRight}>
            Find events
          </Button>
        }
      >
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Tickets booked" value={totalTickets} icon={Ticket} tone="brand" />
          <StatCard label="Upcoming events" value={upcoming.length} icon={CalendarCheck} tone="info" />
          <StatCard label="Total spent" value={formatCurrency(totalSpend)} icon={CreditCard} tone="success" />
          <StatCard label="Saved events" value={savedIds.length} icon={Heart} tone="accent" />
        </div>

        {/* Next up */}
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold">Coming up next</h2>
            <Link
              to="/dashboard/tickets"
              className="text-sm font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-400"
            >
              All tickets
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <div className="surface">
              <EmptyState
                icon={CalendarCheck}
                title="Nothing booked yet"
                description="When you book an event it will show up here with its QR ticket."
                action={
                  <Button to="/events" variant="outline">
                    Browse events
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map(({ order, event }) => (
                <div key={order.id} className="surface flex flex-wrap items-center gap-4 p-4">
                  <img src={event.cover} alt="" className="size-16 shrink-0 rounded-xl object-cover" loading="lazy" />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/events/${event.slug}`}
                        className="text-sm font-bold transition hover:text-brand-600 dark:hover:text-brand-400"
                      >
                        {event.title}
                      </Link>
                      <Badge tone={order.paymentStatus === 'paid' ? 'success' : 'warning'} size="sm">
                        {order.paymentStatus === 'paid' ? 'Paid' : 'Pay at door'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
                      {formatDateRange(event.start, event.end)}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-400">
                      Order {order.id} · {order.items.reduce((s, i) => s + i.quantity, 0)} ticket(s)
                    </p>
                  </div>

                  <Button to="/dashboard/tickets" size="sm" variant="outline" className="shrink-0">
                    View ticket
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Recent activity */}
          <section className="surface p-5">
            <h2 className="mb-4 text-lg font-bold">Recent activity</h2>
            <ul className="space-y-3">
              {orders.slice(0, 4).map((order) => {
                const event = getEventById(order.eventId)
                return (
                  <li key={order.id} className="flex items-center gap-3 text-sm">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                      <Ticket className="size-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{event?.title || `Order #${order.id}`}</span>
                      <span className="block text-xs text-ink-400">{formatDate(order.placedAt)}</span>
                    </span>
                    <span className="shrink-0 font-bold">{formatCurrency(order.total)}</span>
                  </li>
                )
              })}
            </ul>
            <p className="mt-5 border-t border-ink-200/70 pt-4 text-sm dark:border-white/10">
              <span className="text-ink-500 dark:text-ink-400">Total spent</span>{' '}
              <span className="float-right font-extrabold">{formatCurrency(totalSpend)}</span>
            </p>
          </section>

          {/* Notifications */}
          <section className="surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Notifications</h2>
              {unread.length > 0 && <Badge tone="accent" size="sm">{unread.length} new</Badge>}
            </div>

            <ul className="space-y-3">
              {notifications.slice(0, 4).map((notification) => (
                <li key={notification.id} className="flex gap-3">
                  <span
                    className={`mt-1.5 size-2 shrink-0 rounded-full ${notification.read ? 'bg-ink-300 dark:bg-white/20' : 'bg-brand-500'}`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{notification.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-ink-500 dark:text-ink-400">
                      {notification.body}
                    </p>
                    <p className="mt-1 text-xs text-ink-400">{formatDate(notification.at)}</p>
                  </div>
                </li>
              ))}
            </ul>

            <Button to="/dashboard/notifications" variant="ghost" size="sm" fullWidth className="mt-4">
              View all notifications
            </Button>
          </section>
        </div>

        {/* Recommendations */}
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold">Recommended for you</h2>
            <Link to="/events" className="text-sm font-semibold text-brand-600 dark:text-brand-400">
              See more
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {recommended.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      </DashboardShell>
    </>
  )
}
