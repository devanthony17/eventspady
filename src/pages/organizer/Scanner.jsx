import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, ScanLine, WifiOff, XCircle } from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { DashboardShell } from '@components/dashboard/DashboardShell'
import { Button } from '@components/ui/Button'
import { Badge } from '@components/ui/Badge'
import { Input, Select, Switch } from '@components/ui/Field'
import { useAuth } from '@context/AuthContext'
import { useStore } from '@context/StoreContext'
import { useOrganizerEvents, useCheckInTicketMutation } from '@hooks/api'
import { cn, formatTime, formatCurrency } from '@lib/utils'

const RESULT_META = {
  valid: {
    icon: CheckCircle2,
    title: 'Ticket valid — checked in',
    tone: 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
    iconTone: 'text-emerald-600 dark:text-emerald-400',
  },
  duplicate: {
    icon: AlertTriangle,
    title: 'Already checked in',
    tone: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
    iconTone: 'text-amber-600 dark:text-amber-400',
  },
  invalid: {
    icon: XCircle,
    title: 'Ticket not recognised',
    tone: 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
    iconTone: 'text-rose-600 dark:text-rose-400',
  },
}

export default function Scanner() {
  const { nav } = useOutletContext()
  const { user } = useAuth()
  const { events: fallbackEvents, checkInTicket, getGateStatus } = useStore()
  const { data: eventsData } = useOrganizerEvents()
  const checkInMutation = useCheckInTicketMutation()

  const myEvents = Array.isArray(eventsData)
    ? eventsData
    : (eventsData?.events || eventsData?.data || (eventsData !== undefined ? [] : ((user?.organizerId || user?.id) ? fallbackEvents.filter((e) => e.organizerId === (user?.organizerId || user?.id)) : [])))

  const [eventId, setEventId] = useState(myEvents[0]?.id ?? '')
  const [code, setCode] = useState('')
  const [offline, setOffline] = useState(false)
  const [scanned, setScanned] = useState(new Set())
  const [result, setResult] = useState(null)
  const [log, setLog] = useState([])

  const validate = async (e) => {
    e.preventDefault()
    const value = code.trim().toUpperCase()
    if (!value) return

    if (!offline) {
      try {
        await checkInMutation.mutateAsync({ ticketCode: value, eventId })
      } catch {
        // Fallback to local store check-in
      }
    }

    const check = checkInTicket(value, eventId)
    const entry = {
      code: value,
      status: check.status,
      ticket: check.ticket,
      order: check.order,
      message: check.message,
      at: new Date().toISOString(),
    }

    if (check.status === 'valid') {
      setScanned((prev) => new Set(prev).add(value))
    }

    setResult(entry)
    setLog((prev) => [entry, ...prev].slice(0, 12))
    setCode('')
  }

  const meta = result ? RESULT_META[result.status] : null
  const ResultIcon = meta?.icon

  return (
    <>
      <Seo title="Scanner" noIndex />

      <DashboardShell
        nav={nav}
        eyebrow="Organizer panel"
        title="Ticket scanner"
        description="Validate QR tickets at the door. Works offline and reconciles on reconnect."
        actions={
          <Badge tone={offline ? 'warning' : 'success'} size="md" icon={offline ? WifiOff : undefined}>
            {offline ? 'Offline mode' : 'Online'}
          </Badge>
        }
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          {/* Scanner */}
          <section className="surface p-6">
            <div className="mb-5 grid gap-4 sm:grid-cols-2">
              <Select label="Scanning for" value={eventId} onChange={(e) => setEventId(e.target.value)}>
                {myEvents.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </Select>

              <div className="flex items-end pb-1">
                <Switch
                  checked={offline}
                  onChange={setOffline}
                  label="Offline mode"
                  description="Validate against the cached guest list."
                />
              </div>
            </div>

            {/* Camera frame */}
            <div className="relative mx-auto grid aspect-square w-full max-w-sm place-items-center overflow-hidden rounded-3xl bg-ink-950">
              <div
                className="absolute inset-0 bg-grid-dark [background-size:32px_32px] opacity-40"
                aria-hidden="true"
              />
              <div className="relative grid size-48 place-items-center rounded-2xl border-2 border-dashed border-white/25">
                <ScanLine className="size-16 text-white/50" aria-hidden="true" />
                <span className="absolute inset-x-4 top-1/2 h-0.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,.9)]" />
              </div>
              <p className="absolute bottom-5 text-xs text-white/50">
                Point the camera at a ticket QR code
              </p>
            </div>

            {/* Manual entry */}
            <form onSubmit={validate} className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Input
                label="Or enter the code manually"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="EVP-7K2M9X-1"
                className="font-mono uppercase"
                wrapperClassName="flex-1"
              />
              <Button type="submit" size="lg" className="sm:mt-[1.85rem]">
                Validate
              </Button>
            </form>

            {result && meta && (
              <div className={cn('mt-5 flex items-start gap-4 rounded-2xl border p-5', meta.tone)}>
                <ResultIcon className={cn('size-8 shrink-0', meta.iconTone)} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-base font-bold">{meta.title}</p>
                  <p className="mt-1 font-mono text-sm">{result.code}</p>
                  {result.ticket && (
                    <p className="mt-1 text-sm font-semibold">
                      Attendee: {result.ticket.name} ({result.ticket.ticketName || result.ticket.ticket || 'Standard'})
                    </p>
                  )}

                  {/* Pay at Gate status */}
                  {result.order && (result.order.method === 'offline' || result.order.paymentMethod === 'offline') && (
                    <div className="mt-3 rounded-xl border border-amber-400/40 bg-amber-500/15 p-3 text-xs text-amber-950 dark:text-amber-200">
                      <div className="flex items-center justify-between font-bold">
                        <span>🚪 Pay at the Gate Reservation</span>
                        <span className="text-sm font-extrabold text-brand-600 dark:text-brand-400">
                          Collect {formatCurrency(result.order.total)}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] opacity-85">
                        Collect payment via Cash or Mobile Money at the gate. Check-in records payment as settled.
                      </p>
                    </div>
                  )}

                  {/* Gate compliance strike record */}
                  {(() => {
                    const email = result.ticket?.email || result.order?.buyer?.email
                    const gate = email ? getGateStatus(email) : null
                    if (!gate || gate.strikes === 0) return null
                    return (
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="size-3.5 shrink-0" />
                        <span>Attendee Record: {gate.strikes} previous no-show warning. (Attended today - in good standing).</span>
                      </div>
                    )
                  })()}

                  <p className="mt-2 text-xs opacity-75">
                    {result.status === 'duplicate'
                      ? 'This ticket was already checked in. Flagged for door supervisor.'
                      : result.status === 'invalid'
                        ? 'No matching ticket found for this event. Try looking up by order reference in Orders.'
                        : `Admitted at ${formatTime(result.at)}.`}
                  </p>
                </div>
              </div>
            )}

            <p className="mt-4 text-xs text-ink-400">
              Enter any real ticket code from your orders or guest list, or scan codes created during checkout.
            </p>
          </section>

          {/* Session stats + log */}
          <aside className="space-y-5">
            <div className="surface p-5">
              <h2 className="mb-4 text-base font-bold">This session</h2>
              <dl className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: 'Scanned', value: scanned.size },
                  { label: 'Duplicates', value: log.filter((l) => l.status === 'duplicate').length },
                  { label: 'Failed', value: log.filter((l) => l.status === 'invalid').length },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-ink-50 p-3 dark:bg-white/[.04]">
                    <dd className="text-2xl font-extrabold">{stat.value}</dd>
                    <dt className="mt-0.5 text-[11px] uppercase tracking-wider text-ink-400">{stat.label}</dt>
                  </div>
                ))}
              </dl>

              {offline && (
                <p className="mt-4 flex gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                  <WifiOff className="size-4 shrink-0" aria-hidden="true" />
                  {scanned.size} check-in{scanned.size === 1 ? '' : 's'} queued locally. They sync automatically
                  when the connection returns.
                </p>
              )}
            </div>

            <div className="surface p-5">
              <h2 className="mb-4 text-base font-bold">Recent scans</h2>

              {log.length === 0 ? (
                <p className="py-6 text-center text-sm text-ink-400">No scans yet this session.</p>
              ) : (
                <ul className="space-y-2.5">
                  {log.map((entry, i) => {
                    const entryMeta = RESULT_META[entry.status]
                    const Icon = entryMeta.icon

                    return (
                      <li key={`${entry.code}-${i}`} className="flex items-center gap-3">
                        <Icon className={cn('size-4 shrink-0', entryMeta.iconTone)} aria-hidden="true" />
                        <span className="min-w-0 flex-1 truncate font-mono text-xs font-semibold">{entry.code}</span>
                        <span className="shrink-0 text-xs text-ink-400">{formatTime(entry.at)}</span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </DashboardShell>
    </>
  )
}
