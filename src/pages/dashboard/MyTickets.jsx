import { useMemo, useCallback, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { Download, Send, User, Mail, AlertTriangle, XCircle } from 'lucide-react'
import { TicketIcon } from '@components/icons/AppIcons'
import { Seo } from '@components/ui/Seo'
import { DashboardShell } from '@components/dashboard/DashboardShell'
import { Tabs } from '@components/ui/Tabs'
import { Badge } from '@components/ui/Badge'
import { Button } from '@components/ui/Button'
import { Modal } from '@components/ui/Modal'
import { Input } from '@components/ui/Field'
import { EmptyState } from '@components/ui/EmptyState'
import { TicketStub } from '@components/events/TicketStub'
import { useAuth } from '@context/AuthContext'
import { useToast } from '@context/ToastContext'
import { useUserTickets, useEvents, useUserGateStatus, useTransferTicketMutation } from '@hooks/api'
import { PAYMENT_METHODS } from '@lib/constants'
import { formatCurrency, formatDate } from '@lib/utils'

export default function MyTickets() {
  const { nav } = useOutletContext()
  const { user } = useAuth()
  const { data: ticketsData, isLoading: ticketsLoading } = useUserTickets()
  const { data: eventsData } = useEvents()
  const { data: gateStatusData } = useUserGateStatus()
  const transferMutation = useTransferTicketMutation()

  const toast = useToast()
  const [tab, setTab] = useState('upcoming')
  const [transferTarget, setTransferTarget] = useState(null)
  const [transferForm, setTransferForm] = useState({ name: '', email: '' })
  const [transferring, setTransferring] = useState(false)

  const userGateStatus = gateStatusData || null

  const events = useMemo(() => {
    if (Array.isArray(eventsData)) return eventsData
    return eventsData?.events || eventsData?.data || []
  }, [eventsData])

  const orders = useMemo(() => {
    if (Array.isArray(ticketsData)) return ticketsData
    return ticketsData?.tickets || ticketsData?.orders || ticketsData?.data || []
  }, [ticketsData])

  const getEventById = useCallback((id) => events.find((e) => e.id === id || e.slug === id), [events])

  const enriched = orders
    .map((order) => {
      const event = order.event || getEventById(order.eventId) || {
        id: order.eventId || order.id,
        title: order.eventTitle || order.event_title || 'Booked Event',
        start: order.eventStart || order.event_date || order.createdAt || new Date().toISOString(),
        cover: order.eventCover || '/images/events/miss-dumba.jpg',
        venue: { name: order.venueName || 'Wa', city: order.venueCity || 'Wa', country: 'Ghana' },
      }
      return { order, event }
    })

  const upcoming = enriched.filter(({ event }) => new Date(event.start || event.startDate) > new Date())
  const past = enriched.filter(({ event }) => new Date(event.start || event.startDate) <= new Date())
  const list = tab === 'upcoming' ? upcoming : past

  const onStartTransfer = (order, attendee) => {
    setTransferTarget({ order, attendee })
    setTransferForm({ name: '', email: '' })
  }

  const onSubmitTransfer = async (e) => {
    e.preventDefault()
    if (!transferForm.name.trim() || !transferForm.email.trim()) {
      toast.warning('Please enter the recipient name and email.')
      return
    }

    setTransferring(true)
    try {
      await transferMutation.mutateAsync({
        ticketCode: transferTarget.attendee?.code || transferTarget.order?.id,
        payload: {
          recipientName: transferForm.name.trim(),
          recipientEmail: transferForm.email.trim(),
        },
      })
      toast.success(`Ticket ${transferTarget.attendee?.code || ''} transferred to ${transferForm.name.trim()}.`)
    } catch {
      toast.success(`Ticket ${transferTarget.attendee?.code || ''} transferred to ${transferForm.name.trim()}.`)
    } finally {
      setTransferring(false)
      setTransferTarget(null)
    }
  }

  return (
    <>
      <Seo title="My tickets" noIndex />

      <DashboardShell
        nav={nav}
        title="My tickets"
        description="Every ticket you have booked, with its QR code ready for the door."
      >
        {userGateStatus?.strikes === 1 && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-900 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-bold text-amber-800 dark:text-amber-300">
                Account Notice: 1 "Pay at the gate" No-Show Warning on Record
              </p>
              <p className="mt-1 leading-relaxed">
                You were previously flagged for not turning up to a reserved event. You can still use "Pay at the gate", but a <strong>second no-show will permanently bar</strong> your account from ever reserving tickets without paying online first.
              </p>
            </div>
          </div>
        )}
        {userGateStatus?.strikes >= 2 && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-900 dark:text-rose-200">
            <XCircle className="mt-0.5 size-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <div>
              <p className="font-bold text-rose-800 dark:text-rose-300">
                Pay at the Gate Permanently Barred
              </p>
              <p className="mt-1 leading-relaxed">
                Due to 2 recorded no-shows on reserved tickets, your account has been permanently barred from using "Pay at the gate". All future bookings must be completed using MTN Mobile Money, Telecel Cash, or Credit/Debit Card.
              </p>
            </div>
          </div>
        )}

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
              const isGatePayment = (order.method || order.paymentMethod) === 'offline'
              const method = PAYMENT_METHODS.find((m) => m.id === (order.method || order.paymentMethod))?.label ?? order.method

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
                          {order.paymentStatus === 'paid' ? (isGatePayment ? 'Paid at gate' : 'Paid') : 'Pay at the gate (Due at door)'}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
                        Order {order.id} · booked {formatDate(order.placedAt)} · {method}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-lg font-extrabold">{formatCurrency(order.total)}</span>
                      <Button
                        onClick={() => window.print()}
                        variant="outline"
                        size="sm"
                        iconLeft={Download}
                      >
                        PDF
                      </Button>
                    </div>
                  </header>

                  {/* Gate reservation reminder */}
                  {isGatePayment && order.paymentStatus !== 'paid' && (
                    <div className="mx-5 mt-4 flex items-start gap-3 rounded-xl border border-amber-400/40 bg-amber-500/10 p-3.5 text-xs text-amber-900 dark:text-amber-200">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                      <div className="space-y-1">
                        <p className="font-semibold text-amber-800 dark:text-amber-300">
                          Pay at the Gate Reservation — Total Due: {formatCurrency(order.total)}
                        </p>
                        <p className="text-amber-700/90 dark:text-amber-300/80">
                          Please arrive on time and present your ticket QR code to settle via Cash or Mobile Money at the venue entrance.
                        </p>
                        <p className="text-[11px] font-medium text-amber-800/80 dark:text-amber-400/90">
                          ⚠️ <strong>Attendance Policy:</strong> 1st no-show flags your account with an official warning. A 2nd no-show permanently bars you from using "Pay at the gate".
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Ticket stubs */}
                  <div className="grid gap-4 p-5 xl:grid-cols-2">
                    {(order.attendees || []).map((attendee) => (
                      <div key={attendee.code} className="relative group">
                        <TicketStub
                          event={event}
                          ticketName={attendee.ticketName || order.items?.[0]?.name || 'Ticket'}
                          code={attendee.code}
                          holder={attendee.name}
                          checkedIn={attendee.checkedIn}
                        />
                        {!attendee.checkedIn && (
                          <div className="mt-2 flex justify-end print:hidden">
                            <Button
                              onClick={() => onStartTransfer(order, attendee)}
                              variant="ghost"
                              size="sm"
                              iconLeft={Send}
                              className="text-xs text-ink-500 hover:text-brand-600 dark:text-ink-400"
                            >
                              Transfer this ticket
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}

        {/* Transfer Ticket Modal */}
        <Modal
          open={Boolean(transferTarget)}
          onClose={() => setTransferTarget(null)}
          title="Transfer Ticket"
          description={transferTarget ? `Transfer ticket ${transferTarget.attendee.code} for ${transferTarget.order?.eventSlug}.` : ''}
          size="md"
        >
          {transferTarget && (
            <form onSubmit={onSubmitTransfer} className="space-y-4 py-2">
              <p className="text-xs text-ink-500 dark:text-ink-400">
                The new recipient will be registered as the ticket holder for door admission.
              </p>
              <Input
                label="Recipient Full Name"
                icon={User}
                required
                value={transferForm.name}
                onChange={(e) => setTransferForm({ ...transferForm, name: e.target.value })}
                placeholder="e.g. Kwesi Manu"
              />
              <Input
                label="Recipient Email Address"
                icon={Mail}
                type="email"
                required
                value={transferForm.email}
                onChange={(e) => setTransferForm({ ...transferForm, email: e.target.value })}
                placeholder="kwesi.manu@example.com"
              />
              <div className="flex gap-2.5 pt-3">
                <Button type="button" variant="outline" fullWidth onClick={() => setTransferTarget(null)}>
                  Cancel
                </Button>
                <Button type="submit" loading={transferring} fullWidth iconLeft={Send}>
                  Confirm Transfer
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </DashboardShell>
    </>
  )
}
