import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  CalendarPlus,
  CheckCircle2,
  Download,
  Mail,
  Printer,
  Ticket as TicketIcon,
} from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { Container, Section } from '@components/ui/Section'
import { Button } from '@components/ui/Button'
import { Badge } from '@components/ui/Badge'
import { EmptyState } from '@components/ui/EmptyState'
import { TicketStub } from '@components/events/TicketStub'
import { useStore } from '@context/StoreContext'
import { useToast } from '@context/ToastContext'
import { useOrder, useEvents, usePaystackVerify, useFlutterwaveVerify } from '@hooks/api'
import { PAYMENT_METHODS } from '@lib/constants'
import { downloadIcsFile } from '@lib/calendar'
import { formatCurrency, formatDateRange } from '@lib/utils'

/** Builds one QR-bearing stub per ticket in the order. */
function expandTickets(order) {
  if (order.attendees && order.attendees.length > 0) {
    return order.attendees.map((att, i) => ({
      key: `${att.ticketId || 'tkt'}-${i}`,
      name: att.ticketName || 'Pass',
      code: att.code,
      holder: att.name,
      checkedIn: att.checkedIn,
    }))
  }

  return (order.items || []).flatMap((item) =>
    Array.from({ length: item.quantity }, (_, i) => ({
      key: `${item.ticketId}-${i}`,
      name: item.name,
      code: `${order.id}-${i + 1}`,
      holder: i === 0 ? order.buyer?.name || order.buyer : `Guest ${i + 1}`,
      checkedIn: false,
    })),
  )
}

export default function OrderConfirmation() {
  const { orderId } = useParams()
  const [searchParams] = useSearchParams()
  const store = useStore()
  const toast = useToast()

  const paystackRef = searchParams.get('reference') || searchParams.get('trxref')
  const flwTxRef = searchParams.get('tx_ref') || searchParams.get('transaction_id')

  const { data: paystackVerifyData } = usePaystackVerify(paystackRef, {
    enabled: Boolean(paystackRef),
  })

  const { data: flwVerifyData } = useFlutterwaveVerify(flwTxRef, {
    enabled: Boolean(flwTxRef),
  })

  const { data: apiOrderData, isLoading: orderLoading } = useOrder(orderId)
  const { data: eventsData } = useEvents()

  const [order, setOrder] = useState(null)
  const [loaded, setLoaded] = useState(false)

  const events = useMemo(() => {
    if (Array.isArray(eventsData)) return eventsData
    return eventsData?.events || eventsData?.data || []
  }, [eventsData])

  useEffect(() => {
    if (apiOrderData?.order) {
      setOrder(apiOrderData.order)
      setLoaded(true)
      return
    } else if (apiOrderData?.id) {
      setOrder(apiOrderData)
      setLoaded(true)
      return
    }

    // Fallback 1: StoreContext
    const found = store.orders.find((o) => o.id === orderId)
    if (found) {
      setOrder(found)
      setLoaded(true)
      return
    }

    // Fallback 2: sessionStorage
    try {
      const raw = sessionStorage.getItem('eventspady:lastOrder')
      const parsed = raw ? JSON.parse(raw) : null
      setOrder(parsed && parsed.id === orderId ? parsed : null)
    } catch {
      setOrder(null)
    }
    setLoaded(true)
  }, [orderId, apiOrderData, store.orders])

  useEffect(() => {
    if (paystackVerifyData?.status === 'success' || paystackVerifyData?.data?.status === 'success') {
      const verifiedOrder = paystackVerifyData.order || paystackVerifyData.data?.order
      if (verifiedOrder) {
        setOrder((prev) => ({ ...prev, ...verifiedOrder, status: 'completed', paymentStatus: 'completed' }))
      }
    }
  }, [paystackVerifyData])

  useEffect(() => {
    if (flwVerifyData?.status === 'successful' || flwVerifyData?.data?.status === 'successful') {
      const verifiedOrder = flwVerifyData.order || flwVerifyData.data?.order
      if (verifiedOrder) {
        setOrder((prev) => ({ ...prev, ...verifiedOrder, status: 'completed', paymentStatus: 'completed' }))
      }
    }
  }, [flwVerifyData])

  const event = useMemo(() => {
    if (!order) return null
    return (
      order.event ||
      events.find((e) => e.id === order.eventId || e.slug === order.eventSlug) ||
      store.getEventById(order.eventId)
    )
  }, [order, events, store])

  const tickets = useMemo(() => (order ? expandTickets(order) : []), [order])

  if (!loaded) return null

  if (!order || !event) {
    return (
      <>
        <Seo title="Order not found" noIndex />
        <Section>
          <Container>
            <EmptyState
              icon={TicketIcon}
              title="We could not find that order"
              description="Order confirmations are only available in the session that created them. Your tickets are always in your dashboard."
              action={
                <Button to="/dashboard/tickets" size="lg">
                  Go to my tickets
                </Button>
              }
            />
          </Container>
        </Section>
      </>
    )
  }

  const methodLabel = PAYMENT_METHODS.find((m) => m.id === order.method)?.label ?? order.method
  const isPending = order.paymentStatus === 'pending'

  return (
    <>
      <Seo title={`Order ${order.id}`} noIndex />

      <Section size="tight">
        <Container size="narrow">
          {/* Confirmation banner */}
          <div className="mb-8 text-center">
            <span className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
              <CheckCircle2 className="size-9" aria-hidden="true" />
            </span>
            <h1 className="text-3xl font-extrabold sm:text-4xl">
              {isPending ? 'Tickets reserved' : 'You are going!'}
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-pretty text-ink-500 dark:text-ink-300">
              {isPending
                ? `Your tickets for ${event.title} are held. Pay in cash when you check in at the door.`
                : `Your booking for ${event.title} is confirmed. Tickets have been emailed to ${order.buyer?.email}.`}
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <Badge tone="neutral" size="lg">
                Order {order.id}
              </Badge>
              <Badge tone={isPending ? 'warning' : 'success'} size="lg">
                {isPending ? 'Payment pending' : 'Paid'} · {methodLabel}
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="mb-8 flex flex-wrap justify-center gap-2.5 print:hidden">
            <Button onClick={() => window.print()} variant="outline" iconLeft={Printer}>
              Print tickets
            </Button>
            <Button onClick={() => window.print()} variant="outline" iconLeft={Download}>
              Download PDF
            </Button>
            <Button onClick={() => downloadIcsFile(event)} variant="outline" iconLeft={CalendarPlus}>
              Add to calendar
            </Button>
            <Button
              onClick={() => toast.success(`Tickets resent to ${order.buyerEmail || order.buyer?.email || 'your email'}.`)}
              variant="outline"
              iconLeft={Mail}
            >
              Resend email
            </Button>
          </div>

          {/* Tickets */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold">
              Your {tickets.length === 1 ? 'ticket' : `${tickets.length} tickets`}
            </h2>
            {tickets.map((ticket) => (
              <TicketStub
                key={ticket.key}
                event={event}
                ticketName={ticket.name}
                code={ticket.code}
                holder={ticket.holder}
              />
            ))}
          </div>

          {/* Receipt */}
          <div className="surface mt-8 p-6">
            <h2 className="mb-4 text-lg font-bold">Order summary</h2>

            <div className="mb-5 flex items-start gap-3 border-b border-ink-200/70 pb-5 dark:border-white/10">
              <img src={event.cover} alt="" className="size-16 shrink-0 rounded-xl object-cover" loading="lazy" />
              <div className="min-w-0">
                <Link
                  to={`/events/${event.slug}`}
                  className="text-sm font-bold transition hover:text-brand-600 dark:hover:text-brand-400"
                >
                  {event.title}
                </Link>
                <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
                  {formatDateRange(event.start, event.end)}
                </p>
                <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">
                  {event.venue ? `${event.venue.name}, ${event.venue.city}` : 'Online event'}
                </p>
              </div>
            </div>

            <dl className="space-y-2.5 text-sm">
              {order.items.map((item) => (
                <div key={item.ticketId} className="flex justify-between">
                  <dt className="text-ink-500 dark:text-ink-400">
                    {item.name} × {item.quantity}
                  </dt>
                  <dd className="font-semibold">{formatCurrency(item.price * item.quantity)}</dd>
                </div>
              ))}

              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <dt>Coupon {order.couponCode}</dt>
                  <dd className="font-semibold">−{formatCurrency(order.discount)}</dd>
                </div>
              )}

              <div className="flex justify-between">
                <dt className="text-ink-500 dark:text-ink-400">Taxes & fees</dt>
                <dd className="font-semibold">{formatCurrency(order.tax)}</dd>
              </div>

              <div className="flex items-baseline justify-between border-t border-ink-200/70 pt-3 dark:border-white/10">
                <dt className="font-bold">Total {isPending ? 'due at the door' : 'paid'}</dt>
                <dd className="text-xl font-extrabold text-brand-600 dark:text-brand-400">
                  {formatCurrency(order.total)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3 print:hidden">
            <Button to="/dashboard/tickets" size="lg" iconRight={ArrowRight}>
              View all my tickets
            </Button>
            <Button to="/events" size="lg" variant="outline">
              Discover more events
            </Button>
          </div>
        </Container>
      </Section>
    </>
  )
}
