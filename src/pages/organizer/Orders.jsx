import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Download, Receipt, Search } from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { DashboardShell } from '@components/dashboard/DashboardShell'
import { Button } from '@components/ui/Button'
import { Badge } from '@components/ui/Badge'
import { Select } from '@components/ui/Field'
import { EmptyState } from '@components/ui/EmptyState'
import { useToast } from '@context/ToastContext'
import { organizerOrders } from '@data/account'
import { getEventById } from '@data/events'
import { PAYMENT_METHODS } from '@lib/constants'
import { formatCurrency, formatDate } from '@lib/utils'

const STATUS_TONE = { paid: 'success', pending: 'warning', refunded: 'danger' }

export default function Orders() {
  const { nav } = useOutletContext()
  const toast = useToast()

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [method, setMethod] = useState('')

  const filtered = useMemo(
    () =>
      organizerOrders.filter((order) => {
        if (status && order.status !== status) return false
        if (method && order.method !== method) return false
        if (query) {
          const haystack = `${order.id} ${order.buyer}`.toLowerCase()
          if (!haystack.includes(query.toLowerCase())) return false
        }
        return true
      }),
    [query, status, method],
  )

  const revenue = filtered.filter((o) => o.status === 'paid').reduce((sum, o) => sum + o.total, 0)

  return (
    <>
      <Seo title="Orders" noIndex />

      <DashboardShell
        nav={nav}
        eyebrow="Organizer panel"
        title="Orders"
        description="Every ticket order placed across your events."
        actions={
          <Button
            size="sm"
            variant="outline"
            iconLeft={Download}
            onClick={() => toast.success('Export queued — the CSV will be emailed to you.')}
          >
            Export CSV
          </Button>
        }
      >
        {/* Filters */}
        <div className="surface mb-6 grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
            <label htmlFor="order-search" className="sr-only">
              Search orders
            </label>
            <input
              id="order-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by order ID or buyer…"
              className="field pl-10"
            />
          </div>

          <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
            <option value="">All statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </Select>

          <Select value={method} onChange={(e) => setMethod(e.target.value)} aria-label="Filter by payment method">
            <option value="">All methods</option>
            {PAYMENT_METHODS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Summary */}
        <div className="mb-6 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
          <p>
            <span className="text-ink-500 dark:text-ink-400">Showing</span>{' '}
            <span className="font-bold">{filtered.length}</span>{' '}
            <span className="text-ink-500 dark:text-ink-400">of {organizerOrders.length} orders</span>
          </p>
          <p>
            <span className="text-ink-500 dark:text-ink-400">Revenue</span>{' '}
            <span className="font-bold">{formatCurrency(revenue)}</span>
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="surface">
            <EmptyState
              icon={Receipt}
              title="No orders match those filters"
              description="Try clearing the status or payment method filter."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuery('')
                    setStatus('')
                    setMethod('')
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          </div>
        ) : (
          <div className="surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-ink-200/70 bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-400 dark:border-white/10 dark:bg-white/[.03]">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-bold">Order</th>
                    <th scope="col" className="px-5 py-3 font-bold">Buyer</th>
                    <th scope="col" className="px-5 py-3 font-bold">Event</th>
                    <th scope="col" className="px-5 py-3 font-bold">Qty</th>
                    <th scope="col" className="px-5 py-3 font-bold">Method</th>
                    <th scope="col" className="px-5 py-3 font-bold">Placed</th>
                    <th scope="col" className="px-5 py-3 font-bold">Total</th>
                    <th scope="col" className="px-5 py-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-200/70 dark:divide-white/10">
                  {filtered.map((order) => {
                    const event = getEventById(order.eventId)
                    const methodLabel = PAYMENT_METHODS.find((m) => m.id === order.method)?.label

                    return (
                      <tr key={order.id} className="transition hover:bg-ink-50 dark:hover:bg-white/[.03]">
                        <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs font-bold">{order.id}</td>
                        <td className="whitespace-nowrap px-5 py-3.5 font-semibold">{order.buyer}</td>
                        <td className="max-w-[13rem] truncate px-5 py-3.5 text-ink-500 dark:text-ink-400">
                          {event?.title}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 tabular-nums">{order.quantity}</td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-ink-500 dark:text-ink-400">
                          {methodLabel}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-ink-500 dark:text-ink-400">
                          {formatDate(order.at)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 font-bold">{formatCurrency(order.total)}</td>
                        <td className="whitespace-nowrap px-5 py-3.5">
                          <Badge tone={STATUS_TONE[order.status] ?? 'neutral'} size="sm" className="capitalize">
                            {order.status}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DashboardShell>
    </>
  )
}
