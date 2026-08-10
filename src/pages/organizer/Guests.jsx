import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Check, Download, Mail, Search, UserPlus, Users } from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { DashboardShell } from '@components/dashboard/DashboardShell'
import { Button } from '@components/ui/Button'
import { Badge } from '@components/ui/Badge'
import { Modal } from '@components/ui/Modal'
import { Avatar } from '@components/ui/Avatar'
import { Input, Select } from '@components/ui/Field'
import { EmptyState } from '@components/ui/EmptyState'
import { useToast } from '@context/ToastContext'
import { eventsByOrganizer } from '@data/events'
import { cn } from '@lib/utils'

const ORGANIZER_ID = 'nova-collective'

/** Deterministic guest list so the demo table is stable across renders. */
const GUESTS = [
  { id: 'g1', name: 'Jordan Avery', email: 'jordan.avery@example.com', ticket: 'All Days Pass', code: 'EVP-7K2M9X-1', checkedIn: true, comp: false },
  { id: 'g2', name: 'Sam Whitfield', email: 'sam.w@example.com', ticket: 'All Days Pass', code: 'EVP-7K2M9X-2', checkedIn: true, comp: false },
  { id: 'g3', name: 'Elena Rojas', email: 'elena@casacultural.org', ticket: 'VIP All Days', code: 'EVP-1A9C3R-1', checkedIn: false, comp: false },
  { id: 'g4', name: 'Marcus Vela', email: 'marcus@novacollective.com', ticket: 'VIP All Days', code: 'EVP-1A9C3R-2', checkedIn: true, comp: true },
  { id: 'g5', name: 'Hannah Brecht', email: 'hannah@stackforge.dev', ticket: 'Day Pass — Saturday', code: 'EVP-2Z7Y1K-1', checkedIn: false, comp: false },
  { id: 'g6', name: 'Chidi Nwosu', email: 'chidi@impactlagos.org', ticket: 'Day Pass — Friday', code: 'EVP-8N5J0V-1', checkedIn: false, comp: true },
  { id: 'g7', name: 'Sofia Marchetti', email: 'sofia.m@example.com', ticket: 'All Days Pass', code: 'EVP-4R2E6M-1', checkedIn: true, comp: false },
  { id: 'g8', name: 'Ravi Menon', email: 'ravi@clutchesports.gg', ticket: 'Day Pass — Saturday', code: 'EVP-0X3B7L-1', checkedIn: false, comp: false },
]

export default function Guests() {
  const { nav } = useOutletContext()
  const toast = useToast()
  const myEvents = eventsByOrganizer(ORGANIZER_ID)

  const [eventId, setEventId] = useState(myEvents[0]?.id ?? '')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [guests, setGuests] = useState(GUESTS)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [invite, setInvite] = useState({ name: '', email: '', ticket: 'All Days Pass' })

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

  const toggleCheckIn = (id) => {
    setGuests((prev) => prev.map((g) => (g.id === id ? { ...g, checkedIn: !g.checkedIn } : g)))
  }

  const onInvite = (e) => {
    e.preventDefault()
    const guest = {
      id: `g${Date.now()}`,
      name: invite.name,
      email: invite.email,
      ticket: invite.ticket,
      code: `EVP-COMP-${guests.length + 1}`,
      checkedIn: false,
      comp: true,
    }
    setGuests((prev) => [guest, ...prev])
    setInviteOpen(false)
    setInvite({ name: '', email: '', ticket: 'All Days Pass' })
    toast.success(`Comp ticket issued to ${guest.name}.`)
  }

  const selectedEvent = myEvents.find((e) => e.id === eventId)

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
            {myEvents.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </Select>

          <Select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter guests">
            <option value="all">Everyone</option>
            <option value="checked">Checked in</option>
            <option value="pending">Not arrived</option>
            <option value="comp">Comps only</option>
          </Select>

          <Button
            variant="outline"
            iconLeft={Download}
            onClick={() => toast.success('Guest list export queued.')}
            className="h-[2.6rem]"
          >
            Export
          </Button>
        </div>

        {selectedEvent && (
          <p className="mb-4 text-sm text-ink-500 dark:text-ink-400">
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
            {filtered.map((guest) => (
              <li key={guest.id} className="flex flex-wrap items-center gap-4 p-4">
                <Avatar name={guest.name} size="md" />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold">{guest.name}</p>
                    {guest.comp && (
                      <Badge tone="accent" size="sm">
                        Comp
                      </Badge>
                    )}
                  </div>
                  <p className="truncate text-xs text-ink-500 dark:text-ink-400">{guest.email}</p>
                </div>

                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold">{guest.ticket}</p>
                  <p className="font-mono text-xs text-ink-400">{guest.code}</p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleCheckIn(guest.id)}
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
              </li>
            ))}
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
