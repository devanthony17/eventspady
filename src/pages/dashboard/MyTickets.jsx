import { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { Download, Send, Ticket as TicketIcon } from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { DashboardShell } from '@components/dashboard/DashboardShell'
import { Tabs } from '@components/ui/Tabs'
import { Badge } from '@components/ui/Badge'
import { Button } from '@components/ui/Button'
import { EmptyState } from '@components/ui/EmptyState'
import { TicketStub } from '@components/events/TicketStub'
import { orders } from '@data/account'
import { getEventById } from '@data/events'
import { PAYMENT_METHODS } from '@lib/constants'
import { formatCurrency, formatDate } from '@lib/utils'

export default function MyTickets() {
  const { nav } = useOutletContext()
  const [tab, setTab] = useState('upcoming')

  const enriched = orders
    .map((order) => ({ order, event: getEventById(order.eventId) }))
    .filter(({ event }) => event)

  const upcoming = enriched.filter(({ event }) => new Date(event.start) > new Date())
  const past = enriched.filter(({ event }) => new Date(event.start) <= new Date())
  const list = tab === 'upcoming' ? upcoming : past

  return (
    <>
      <Seo title="My tickets" noIndex />

      <DashboardShell
        nav={nav}
        title="My tickets"
        description="Every ticket you have booked, with its QR code ready for the door."
      >
        <Tabs
          tabs={[
            { id: 'upcoming', label: 'Upcoming', count: upcoming.length },
            { id: 'past', label: 'Past', count: past.length },
          ]}
          active={tab}
          onChange={setTab}
          variant="pill"
          className="mb-6 w-full sm:w-auto"
        />

        {list.length === 0 ? (
          <div className="surface">
            <EmptyState
              icon={TicketIcon}
              title={tab === 'upcoming' ? 'No upcoming tickets' : 'No past events yet'}
              description={
                tab === 'upcoming'
                  ? 'Book an event and your QR ticket will appear here instantly.'
                  : 'Events you have attended will be archived here.'
              }
              action={
                <Button to="/events" variant="outline">
                  Browse events
                </Button>
              }
            />
          </div>
        ) : (
          <div className="space-y-6">
            {list.map(({ order, event }) => {
              const method = PAYMENT_METHODS.find((m) => m.id === order.paymentMethod)?.label

              return (
                <section key={order.id} className="surface overflow-hidden">
                  {/* Order header */}
                  <header className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-200/70 bg-ink-50 p-5 dark:border-white/10 dark:bg-white/[.03]">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/events/${event.slug}`}
                          className="text-base font-bold transition hover:text-brand-600 dark:hover:text-brand-400"
                        >
                          {event.title}
                        </Link>
                        <Badge tone={order.paymentStatus === 'paid' ? 'success' : 'warning'} size="sm">
                          {order.paymentStatus === 'paid' ? 'Paid' : 'Pay at door'}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
                        Order {order.id} · booked {formatDate(order.placedAt)} · {method}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-lg font-extrabold">{formatCurrency(order.total)}</span>
                      <Button variant="outline" size="sm" iconLeft={Download}>
                        PDF
                      </Button>
                      <Button variant="ghost" size="sm" iconLeft={Send}>
                        Transfer
                      </Button>
                    </div>
                  </header>

                  {/* Ticket stubs */}
                  <div className="grid gap-4 p-5 xl:grid-cols-2">
                    {order.attendees.map((attendee) => (
                      <TicketStub
                        key={attendee.code}
                        event={event}
                        ticketName={order.items[0]?.name ?? 'Ticket'}
                        code={attendee.code}
                        holder={attendee.name}
                        checkedIn={attendee.checkedIn}
                      />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </DashboardShell>
    </>
  )
}
