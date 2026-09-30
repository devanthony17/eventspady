import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { AlertTriangle, Check, Download, Mail, Search, ShieldAlert, UserPlus, UserX, Users } from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { DashboardShell } from '@components/dashboard/DashboardShell'
import { Button } from '@components/ui/Button'
import { Badge } from '@components/ui/Badge'
import { Modal } from '@components/ui/Modal'
import { Avatar } from '@components/ui/Avatar'
import { Input, Select } from '@components/ui/Field'
import { EmptyState } from '@components/ui/EmptyState'
import { useAuth } from '@context/AuthContext'
import { useStore } from '@context/StoreContext'
import { useToast } from '@context/ToastContext'
import { exportToCsv } from '@lib/csv'
import { cn } from '@lib/utils'
import {
  useOrganizerGuests,
  useOrganizerEvents,
  useCreateCompsMutation,
  useCheckInTicketMutation,
  useUndoCheckInMutation,
  useRecordGateViolationMutation,
} from '@hooks/api'

export default function Guests() {
  const { nav } = useOutletContext()
  const { user } = useAuth()
  const {
    events: fallbackEvents,
    getGuestsByEvent,
    toggleCheckIn,
    issueComp,
    getGateStatus,
    recordGateViolation,
    pardonGateViolation,
  } = useStore()
  const toast = useToast()

  const { data: eventsData } = useOrganizerEvents()
  const myEvents = useMemo(() => {
    if (Array.isArray(eventsData)) return eventsData
    if (eventsData?.events) return eventsData.events
    if (eventsData?.data) return eventsData.data
    const organizerId = user?.organizerId || user?.id || ''
    return organizerId ? fallbackEvents.filter((e) => e.organizerId === organizerId) : []
  }, [eventsData, fallbackEvents, user?.organizerId, user?.id])

  const [eventId, setEventId] = useState(myEvents[0]?.id ?? '')
  const { data: guestsData } = useOrganizerGuests({ eventId })
  const createCompsMutation = useCreateCompsMutation()
  const checkInMutation = useCheckInTicketMutation()
  const undoCheckInMutation = useUndoCheckInMutation()
  const recordViolationMutation = useRecordGateViolationMutation()

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [invite, setInvite] = useState({ name: '', email: '', ticket: 'General Admission' })

  const guests = useMemo(() => {
    if (Array.isArray(guestsData)) return guestsData
    if (guestsData?.guests) return guestsData.guests
    if (guestsData?.data) return guestsData.data
    if (guestsData !== undefined) return []
    return getGuestsByEvent(eventId)
  }, [guestsData, eventId, getGuestsByEvent])

  const filtered = useMemo(
    () =>
      guests.filter((guest) => {
        if (filter === 'checked' && !guest.checkedIn) return false
        if (filter === 'pending' && guest.checkedIn) return false
        if (filter === 'comp' && !guest.comp) return false
        if (query) {
          const haystack = `${guest.name} ${guest.email} ${guest.code}`.toLowerCase()
          if (!haystack.includes(query.toLowerCase())) return false
        }
        return true
      }),
    [guests, query, filter],
  )

  const checkedIn = guests.filter((g) => g.checkedIn).length

  const handleToggleCheckIn = async (code, isCurrentlyCheckedIn) => {
    toggleCheckIn(code)
    try {
      if (isCurrentlyCheckedIn) {
        await undoCheckInMutation.mutateAsync(code)
      } else {
        await checkInMutation.mutateAsync({ ticketCode: code, eventId })
      }
    } catch {
      // Non-blocking fallback
    }
    toast.success('Check-in status updated.')
  }

  const onInvite = async (e) => {
    e.preventDefault()
    if (!eventId) {
      toast.warning('Select an event first.')
      return
    }
    try {
      await createCompsMutation.mutateAsync({
        eventId,
        name: invite.name,
        email: invite.email,
        ticketName: invite.ticket || 'Comp Ticket',
      })
    } catch {
      // Non-blocking fallback
    }
    const comp = issueComp(eventId, {
      name: invite.name,
      email: invite.email,
      ticketName: invite.ticket || 'Comp Ticket',
    })
    setInviteOpen(false)
    setInvite({ name: '', email: '', ticket: 'General Admission' })
    toast.success(`Comp ticket (${comp.code}) issued to ${comp.name}.`)
  }

  const selectedEvent = myEvents.find((e) => e.id === eventId) || myEvents[0]

  const onExportCsv = () => {
    if (filtered.length === 0) {
      toast.warning('No guests to export.')
      return
    }
    const rows = filtered.map((g) => ({
      'Name': g.name,
      'Email': g.email,
      'Ticket Type': g.ticketName || g.ticket || 'Standard',
      'Ticket Code': g.code,
      'Checked In': g.checkedIn ? 'Yes' : 'No',
      'Type': g.comp ? 'Comp' : 'Standard',
      'Order Reference': g.orderId,
    }))
    exportToCsv(rows, `guest-list-${selectedEvent?.slug || 'event'}.csv`)
    toast.success('Guest list CSV exported.')
  }

  const handleReportNoShow = async (guest) => {
    const email = guest.email || guest.buyerEmail
    if (!email) {
      toast.error('No email address on record for this guest.')
      return
    }
    const currentStatus = getGateStatus(email)
    const isSecond = currentStatus.strikes >= 1
    const proceed = window.confirm(
      `Report ${guest.name} as a No-Show for this Pay at the Gate reservation?\n\n` +
        (isSecond
          ? `⚠️ VIOLATION #2: This attendee already has 1 strike. Reporting this second violation will PERMANENTLY BAR them from ever using Pay at the Gate.`
          : `⚠️ VIOLATION #1: This will FLAG the attendee with an official warning on their account.`),
    )
    if (!proceed) return

    try {
      await recordViolationMutation.mutateAsync({
        guestEmail: email,
        eventId: selectedEvent?.id,
        reason: isSecond ? 'Second no-show: barred from Pay at the Gate' : 'First no-show: flagged with warning',
        notes: `Attendee: ${guest.name}, Event: ${selectedEvent?.title}`,
      })
    } catch {
      // Non-blocking fallback
    }

    recordGateViolation(email, {
      name: guest.name,
      eventId: selectedEvent?.id,
      eventTitle: selectedEvent?.title,
      reportedBy: user?.name || 'Event Organizer',
      notes: isSecond ? 'Second no-show: barred from Pay at the Gate' : 'First no-show: flagged with warning',
    })

    toast.warning(
      isSecond
        ? `${guest.name} has committed 2 violations and is now PERMANENTLY BARRED from Pay at the Gate.`
        : `${guest.name} has been FLAGGED with 1 violation for failing to turn up.`,
    )
  }

  return (
    <>
      <Seo title="Guest list" noIndex />

      <DashboardShell
        nav={nav}
        eyebrow="Organizer panel"
        title="Guest list"
        description="Everyone holding a ticket, plus the comps you have issued."
        actions={
          <Button size="sm" iconLeft={UserPlus} onClick={() => setInviteOpen(true)}>
            Issue comp
          </Button>
        }
      >
        {/* Summary */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {[
            { label: 'On the list', value: guests.length, tone: 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300' },
            { label: 'Checked in', value: checkedIn, tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' },
            { label: 'Still expected', value: guests.length - checkedIn, tone: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' },
          ].map((stat) => (
            <div key={stat.label} className="surface p-5">
              <p className="text-sm text-ink-500 dark:text-ink-400">{stat.label}</p>
              <p className="mt-1.5 text-3xl font-extrabold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="surface mb-6 grid gap-3 p-4 lg:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
            <label htmlFor="guest-search" className="sr-only">
              Search guests
            </label>
            <input
              id="guest-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email or ticket code…"
              className="field pl-10"
            />
          </div>

          <Select value={eventId} onChange={(e) => setEventId(e.target.value)} aria-label="Select event">
            {myEvents.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.title}
              </option>
            ))}
          </Select>

          <Select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter guests">
            <option value="all">All guests</option>
            <option value="checked">Checked in</option>
            <option value="pending">Not checked in</option>
            <option value="comp">Comps only</option>
          </Select>

          <Button variant="outline" size="sm" iconLeft={Download} onClick={onExportCsv}>
            Export CSV
          </Button>
        </div>

        {selectedEvent && (
          <p className="mb-4 text-xs text-ink-500 dark:text-ink-400">
            Showing the guest list for <span className="font-semibold text-ink-800 dark:text-ink-100">{selectedEvent.title}</span>.
          </p>
        )}

        {filtered.length === 0 ? (
          <div className="surface">
            <EmptyState
              icon={Users}
              title="No guests match"
              description="Try a different filter or clear the search."
            />
          </div>
        ) : (
          <ul className="surface divide-y divide-ink-200/70 overflow-hidden dark:divide-white/10">
            {filtered.map((guest) => {
              const email = guest.email || guest.buyerEmail || ''
              const gate = getGateStatus(email)
              const isPayAtGate = guest.method === 'offline'

              return (
                <li key={guest.code || guest.id} className="flex flex-wrap items-center gap-4 p-4">
                  <Avatar name={guest.name} size="md" />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold">{guest.name}</p>
                      {guest.comp && (
                        <Badge tone="accent" size="sm">
                          Comp
                        </Badge>
                      )}
                      {isPayAtGate && (
                        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                          Pay at Gate ({guest.paymentStatus === 'paid' ? 'Settled' : 'Unpaid'})
                        </span>
                      )}
                      {gate.barred ? (
                        <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                          🚫 Barred (2 No-Shows)
                        </span>
                      ) : gate.isFlagged ? (
                        <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                          ⚠️ Flagged (1 No-Show)
                        </span>
                      ) : null}
                    </div>
                    <p className="truncate text-xs text-ink-500 dark:text-ink-400">{guest.email || 'No email provided'}</p>
                  </div>

                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-semibold">{guest.ticketName || guest.ticket || 'General Admission'}</p>
                    <p className="font-mono text-xs text-ink-400">{guest.code}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isPayAtGate && !guest.checkedIn && (
                      <button
                        type="button"
                        onClick={() => handleReportNoShow(guest)}
                        className="inline-flex h-9 shrink-0 items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
                        title="Report attendee for failing to turn up for Pay at the Gate"
                      >
                        <UserX className="size-3.5" />
                        <span>Report No-Show</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleToggleCheckIn(guest.code, guest.checkedIn)}
                      className={cn(
                        'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition',
                        guest.checkedIn
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300'
                          : 'border border-ink-200 text-ink-600 hover:border-brand-300 hover:text-brand-700 dark:border-white/10 dark:text-ink-300',
                      )}
                    >
                      {guest.checkedIn ? (
                        <>
                          <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                          Checked in
                        </>
                      ) : (
                        'Check in'
                      )}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </DashboardShell>

      {/* Issue comp */}
      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Issue a comp ticket"
        description="Comps are real tickets with real QR codes, so the door treats them identically."
      >
        <form onSubmit={onInvite} className="space-y-4">
          <Input
            label="Guest name"
            required
            value={invite.name}
            onChange={(e) => setInvite({ ...invite, name: e.target.value })}
            placeholder="Alex Moreau"
          />
          <Input
            label="Email address"
            type="email"
            required
            value={invite.email}
            onChange={(e) => setInvite({ ...invite, email: e.target.value })}
            placeholder="alex@example.com"
            hint="The ticket and QR code are emailed straight here."
          />
          <Select
            label="Ticket type"
            value={invite.ticket}
            onChange={(e) => setInvite({ ...invite, ticket: e.target.value })}
          >
            {(selectedEvent?.tickets ?? []).map((ticket) => (
              <option key={ticket.id} value={ticket.name}>
                {ticket.name}
              </option>
            ))}
          </Select>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" fullWidth onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" fullWidth iconLeft={Mail}>
              Send comp ticket
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
