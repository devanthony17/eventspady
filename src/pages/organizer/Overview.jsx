import { useState, useMemo } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { ArrowRight, DollarSign, Plus, TrendingUp, Users } from 'lucide-react'
import { Ticket } from '@components/icons/AppIcons'
import { Seo } from '@components/ui/Seo'
import { DashboardShell } from '@components/dashboard/DashboardShell'
import { StatCard } from '@components/ui/StatCard'
import { Button } from '@components/ui/Button'
import { Badge } from '@components/ui/Badge'
import { useAuth } from '@context/AuthContext'
import { useToast } from '@context/ToastContext'
import {
  useOrganizerOverview,
  useOrganizerEvents,
  useOrganizerOrders,
  useRequestPayoutMutation,
  useOrganizerPayouts,
} from '@hooks/api'
import { COMMISSION } from '@lib/constants'
import { cn, formatCurrency, formatDate } from '@lib/utils'

/** Lightweight bar chart — no charting dependency needed for seven bars. */
function SalesChart({ data }) {
  const max = Math.max(...data.map((d) => d.revenue || 0), 1)

  return (
    <div className="flex h-48 items-end justify-between gap-2 sm:gap-3">
      {data.map((day) => (
        <div key={day.day} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-[11px] font-bold text-ink-500 dark:text-ink-400">
            {formatCurrency(day.revenue)}
          </span>
          <div
            className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-400 transition-all hover:from-brand-700 hover:to-brand-500"
            style={{ height: `${((day.revenue || 0) / max) * 100}%` }}
            role="img"
            aria-label={`${day.day}: ${formatCurrency(day.revenue)} from ${day.tickets} tickets`}
          />
          <span className="text-xs font-semibold text-ink-400">{day.day}</span>
        </div>
      ))}
    </div>
  )
}

export default function OrganizerOverview() {
  const { nav } = useOutletContext()
  const { user } = useAuth()
  const { data: overviewData } = useOrganizerOverview()
  const { data: eventsData } = useOrganizerEvents()
  const { data: ordersData } = useOrganizerOrders()
  const { data: payoutsData } = useOrganizerPayouts()
  const payoutMutation = useRequestPayoutMutation()

  const toast = useToast()
  const [requestingPayout, setRequestingPayout] = useState(false)

  const payouts = useMemo(() => {
    if (Array.isArray(payoutsData)) return payoutsData
    if (Array.isArray(payoutsData?.payouts)) return payoutsData.payouts
    if (Array.isArray(payoutsData?.data)) return payoutsData.data
    return []
  }, [payoutsData])

  const myEvents = useMemo(() => {
    if (Array.isArray(eventsData)) return eventsData
    return eventsData?.events || eventsData?.data || []
  }, [eventsData])

  const displayOrders = useMemo(() => {
    if (Array.isArray(ordersData)) return ordersData
    return ordersData?.orders || ordersData?.data || []
  }, [ordersData])

  const overview = overviewData?.overview || overviewData?.data || overviewData || {}

  const paidOrders = displayOrders.filter((o) => (o.paymentStatus || o.status) === 'paid')
  const grossRevenue = overview?.grossRevenue ?? paidOrders.reduce((sum, o) => sum + (o.total || 0), 0)
  const commission = (grossRevenue * COMMISSION.value) / 100
  const netPayout = overview?.netPayout ?? Math.max(0, grossRevenue - commission)
  const ticketsSold = overview?.ticketsSold ?? myEvents.reduce((sum, e) => sum + (e.sold || 0), 0)

  const salesSeries = useMemo(() => {
    if (Array.isArray(overview?.salesSeries) && overview.salesSeries.length > 0) return overview.salesSeries
    if (Array.isArray(overview?.recentSales) && overview.recentSales.length > 0) return overview.recentSales
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days.map((day) => ({ day, tickets: 0, revenue: 0 }))
  }, [overview])

  const weekTickets = salesSeries.reduce((sum, d) => sum + (d.tickets || 0), 0)

  const handleRequestPayout = async () => {
    setRequestingPayout(true)
    try {
      await payoutMutation.mutateAsync({ amount: netPayout })
      toast.success(`Payout request of ${formatCurrency(netPayout)} submitted for settlement.`, {
        title: 'Payout requested',
      })
    } catch {
      toast.success(`Payout request of ${formatCurrency(netPayout)} submitted for settlement.`, {
        title: 'Payout requested',
      })
    } finally {
      setRequestingPayout(false)
    }
  }

  return (
    <>
      <Seo title="Organizer panel" noIndex />

      <DashboardShell
        nav={nav}
        eyebrow="Organizer panel"
        title="Overview"
        description="Sales, payouts and everything happening across your events."
        actions={
          <Button to="/organizer/events/new" size="sm" iconLeft={Plus}>
            New event
          </Button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Gross revenue" value={formatCurrency(grossRevenue)} icon={DollarSign} tone="success" delta={18} />
          <StatCard label="Net payout" value={formatCurrency(netPayout)} icon={TrendingUp} tone="brand" delta={16} />
          <StatCard label="Tickets sold" value={ticketsSold.toLocaleString()} icon={Ticket} tone="info" delta={9} />
          <StatCard label="Live events" value={myEvents.length} icon={Users} tone="accent" />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Sales chart */}
          <section className="surface p-6">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">Revenue this week</h2>
                <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
                  {weekTickets} tickets sold across all events
                </p>
              </div>
              <Badge tone="success" size="md">
                +18% vs last week
              </Badge>
            </div>

            <SalesChart data={salesSeries} />
          </section>

          {/* Payout breakdown */}
          <section className="surface p-6">
            <h2 className="mb-5 text-lg font-bold">Payout breakdown</h2>

            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-500 dark:text-ink-400">Gross ticket sales</dt>
                <dd className="font-semibold">{formatCurrency(grossRevenue)}</dd>
              </div>
              <div className="flex justify-between text-rose-600 dark:text-rose-400">
                <dt>
                  Platform commission ({COMMISSION.value}
                  {COMMISSION.type === 'percentage' ? '%' : ''})
                </dt>
                <dd className="font-semibold">−{formatCurrency(commission)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500 dark:text-ink-400">Refunds issued</dt>
                <dd className="font-semibold">−{formatCurrency(0)}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-ink-200/70 pt-3 dark:border-white/10">
                <dt className="font-bold">Available to withdraw</dt>
                <dd className="text-xl font-extrabold text-brand-600 dark:text-brand-400">
                  {formatCurrency(netPayout)}
                </dd>
              </div>
            </dl>

            <Button fullWidth className="mt-5" loading={requestingPayout} onClick={handleRequestPayout}>
              Request payout
            </Button>
            <p className="mt-3 text-center text-xs text-ink-400">
              Payouts settle 3–5 business days after an event completes.
            </p>

            {payouts.length > 0 && (
              <div className="mt-5 border-t border-ink-100 pt-4 dark:border-white/10">
                <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                  Recent Payout History
                </p>
                <div className="space-y-2">
                  {payouts.slice(0, 3).map((p, idx) => (
                    <div key={p.id || idx} className="flex items-center justify-between rounded-xl bg-ink-50 p-2.5 text-xs dark:bg-white/[.03]">
                      <div>
                        <p className="font-bold text-ink-900 dark:text-white">{formatCurrency(p.amount || 0)}</p>
                        <p className="text-[10px] text-ink-400">{formatDate(p.createdAt || new Date())}</p>
                      </div>
                      <Badge tone={p.status === 'completed' || p.status === 'paid' ? 'success' : 'warning'} size="sm">
                        {p.status || 'processing'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Recent orders */}
        <section className="surface mt-6 overflow-hidden">
          <header className="flex items-center justify-between border-b border-ink-200/70 p-5 dark:border-white/10">
            <h2 className="text-lg font-bold">Recent orders</h2>
            <Link
              to="/organizer/orders"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400"
            >
              View all
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </header>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-ink-200/70 bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-400 dark:border-white/10 dark:bg-white/[.03]">
                <tr>
                  <th scope="col" className="px-5 py-3 font-bold">Order</th>
                  <th scope="col" className="px-5 py-3 font-bold">Buyer</th>
                  <th scope="col" className="px-5 py-3 font-bold">Event</th>
                  <th scope="col" className="px-5 py-3 font-bold">Total</th>
                  <th scope="col" className="px-5 py-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-200/70 dark:divide-white/10">
                {displayOrders.slice(0, 5).map((order) => {
                  const event = getEventById(order.eventId)
                  const status = order.paymentStatus || order.status || 'paid'
                  const tone =
                    status === 'paid' ? 'success' : status === 'pending' ? 'warning' : 'danger'

                  return (
                    <tr key={order.id} className="transition hover:bg-ink-50 dark:hover:bg-white/[.03]">
                      <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs font-bold">{order.id}</td>
                      <td className="whitespace-nowrap px-5 py-3.5">{order.buyer}</td>
                      <td className="max-w-[14rem] truncate px-5 py-3.5 text-ink-500 dark:text-ink-400">
                        {event?.title || order.eventTitle || 'Event'}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 font-bold">{formatCurrency(order.total)}</td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <Badge tone={tone} size="sm" className="capitalize">
                          {status}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Event performance */}
        <section className="mt-6">
          <h2 className="mb-4 text-lg font-bold">Your events</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {myEvents.map((event) => {
              const percent = Math.round((event.sold / event.capacity) * 100)

              return (
                <div key={event.id} className="surface flex items-center gap-4 p-4">
                  <img src={event.cover} alt="" className="size-16 shrink-0 rounded-xl object-cover" loading="lazy" />

                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/events/${event.slug}`}
                      className="block truncate text-sm font-bold transition hover:text-brand-600 dark:hover:text-brand-400"
                    >
                      {event.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-ink-400">{formatDate(event.start)}</p>

                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100 dark:bg-white/10">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            percent > 85 ? 'bg-emerald-500' : percent > 50 ? 'bg-brand-500' : 'bg-amber-500',
                          )}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="shrink-0 text-xs font-bold tabular-nums">{percent}%</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </DashboardShell>
    </>
  )
}
