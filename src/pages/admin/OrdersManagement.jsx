import { useState, useMemo } from 'react'
import {
  ArrowDownToLine,
  CheckCircle2,
  CreditCard,
  Download,
  Receipt,
  Search,
  Smartphone,
} from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { Badge } from '@components/ui/Badge'
import { Button } from '@components/ui/Button'
import { useStore } from '@context/StoreContext'
import { useToast } from '@context/ToastContext'
import { Modal } from '@components/ui/Modal'
import { useAdminOrders, useAdminOrder, useRefundOrderMutation } from '@hooks/api'
import adminApi from '@api/admin.api'
import { formatCurrency, formatDate } from '@lib/utils'

export default function OrdersManagement() {
  const { orders: storeOrders = [] } = useStore()
  const { data: ordersData, isLoading } = useAdminOrders()
  const refundMutation = useRefundOrderMutation()
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [methodFilter, setMethodFilter] = useState('all')
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const { data: selectedOrderDetails } = useAdminOrder(selectedOrderId, { enabled: Boolean(selectedOrderId) })

  const combinedOrders = useMemo(() => {
    const rawOrders = Array.isArray(ordersData)
      ? ordersData
      : Array.isArray(ordersData?.orders)
        ? ordersData.orders
        : Array.isArray(ordersData?.data)
          ? ordersData.data
          : ordersData !== undefined
            ? []
            : storeOrders

    return rawOrders.map((o) => ({
      id: o.id || `ORD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      attendeeName: o.attendeeName || o.buyer || o.customerName || 'Online Attendee',
      attendeeEmail: o.attendeeEmail || o.buyerEmail || o.customerEmail || 'attendee@eventspady.com',
      eventTitle: o.eventTitle || o.event?.title || 'Event',
      tickets: o.quantity || o.tickets || o.items?.reduce((sum, i) => sum + (i.quantity || 1), 0) || 1,
      amount: o.total || o.amount || 0,
      paymentMethod: o.paymentMethod || o.method || 'MTN MoMo',
      momoRef: o.reference || o.momoRef || `MTN-GH-${Math.floor(10000000 + Math.random() * 90000000)}`,
      date: o.createdAt || o.placedAt || o.date || new Date().toISOString(),
      status: o.paymentStatus || o.status || 'completed',
    }))
  }, [ordersData, storeOrders])

  const filteredOrders = useMemo(() => {
    return combinedOrders.filter((order) => {
      const matchesMethod =
        methodFilter === 'all' ||
        order.paymentMethod.toLowerCase().includes(methodFilter.toLowerCase())

      const matchesSearch =
        !search ||
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.attendeeName.toLowerCase().includes(search.toLowerCase()) ||
        order.eventTitle.toLowerCase().includes(search.toLowerCase()) ||
        order.momoRef.toLowerCase().includes(search.toLowerCase())

      return matchesMethod && matchesSearch
    })
  }, [combinedOrders, methodFilter, search])

  const handleExportCsv = async () => {
    try {
      const blob = await adminApi.exportOrdersCsv({
        method: methodFilter !== 'all' ? methodFilter : undefined,
      })
      if (blob && (blob instanceof Blob || blob.size > 0)) {
        const url = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv' }))
        const link = document.createElement('a')
        link.href = url
        link.download = `eventspady_orders_admin_${Date.now()}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        toast.success('Orders ledger exported as CSV from server!')
        return
      }
    } catch {
      // Fallback to client-side CSV generation
    }

    const headers = ['Order ID', 'Attendee Name', 'Email', 'Event', 'Tickets', 'Amount (GHS)', 'Gateway', 'Reference', 'Date']
    const rows = filteredOrders.map((o) => [
      o.id,
      `"${o.attendeeName}"`,
      o.attendeeEmail,
      `"${o.eventTitle}"`,
      o.tickets,
      o.amount,
      o.paymentMethod,
      o.momoRef,
      o.date,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `eventspady_orders_ledger_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Orders ledger exported as CSV!')
  }

  const activeOrder = useMemo(() => {
    if (!selectedOrderId) return null
    const fromApi = selectedOrderDetails?.order || selectedOrderDetails?.data || selectedOrderDetails
    if (fromApi?.id === selectedOrderId) return fromApi
    return combinedOrders.find((o) => o.id === selectedOrderId) || null
  }, [selectedOrderId, selectedOrderDetails, combinedOrders])

  const handleRefund = async (orderId) => {
    if (!window.confirm(`Issue a refund for order ${orderId}?`)) return
    try {
      await refundMutation.mutateAsync(orderId)
      toast.success(`Order ${orderId} refunded successfully.`)
      setSelectedOrderId(null)
    } catch (err) {
      toast.error(err.message || 'Failed to refund order.')
    }
  }

  return (
    <>
      <Seo
        title="Transaction & MoMo Orders Ledger — Admin Console"
        description="Audit all ticket purchases, Mobile Money USSD references, and settlements."
        noIndex
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="size-4 text-brand-600 dark:text-brand-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                Financial Audit
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-ink-900 dark:text-white sm:text-3xl">
              Orders & MoMo Ledger
            </h1>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
              Live reconciliation ledger for MTN MoMo, Telecel Cash, and Card settlements.
            </p>
          </div>

          <Button variant="outline" size="sm" iconLeft={Download} onClick={handleExportCsv}>
            Export to CSV
          </Button>
        </div>

        {/* Filters & Search */}
        <div className="surface flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Gateways' },
              { id: 'mtn', label: 'MTN MoMo' },
              { id: 'telecel', label: 'Telecel Cash' },
              { id: 'card', label: 'Card & Bank' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setMethodFilter(f.id)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                  methodFilter === f.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-white/[.06]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              placeholder="Search order ID, MoMo ref, attendee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-ink-200 bg-white py-2 pl-9 pr-4 text-xs text-ink-900 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-ink-800 dark:text-white"
            />
          </div>
        </div>

        {/* Ledger Table */}
        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-ink-200/80 bg-ink-50/50 text-ink-500 dark:border-white/10 dark:bg-white/[.02] dark:text-ink-400">
                <tr>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Order ID & Date</th>
                  <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Attendee</th>
                  <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Event</th>
                  <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Amount (GH₵)</th>
                  <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Gateway & Ref</th>
                  <th className="px-5 py-3.5 text-right font-bold uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-white/[.06]">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className="cursor-pointer transition hover:bg-ink-50/50 dark:hover:bg-white/[.02]"
                  >
                    <td className="px-5 py-4">
                      <p className="font-mono font-bold text-ink-900 dark:text-white">
                        {order.id}
                      </p>
                      <p className="text-[11px] text-ink-400">{formatDate(order.date)}</p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-bold text-ink-900 dark:text-white">
                        {order.attendeeName}
                      </p>
                      <p className="text-[11px] text-ink-400">{order.attendeeEmail}</p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-medium text-ink-800 dark:text-ink-200 truncate max-w-[200px]">
                        {order.eventTitle}
                      </p>
                      <p className="text-[11px] text-ink-400">
                        {order.tickets} ticket{order.tickets > 1 ? 's' : ''}
                      </p>
                    </td>

                    <td className="px-4 py-4 font-black text-ink-900 dark:text-white">
                      {formatCurrency(order.amount)}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <Smartphone className="size-3.5 text-brand-600 dark:text-brand-400" />
                        <span className="font-bold text-ink-800 dark:text-ink-200">
                          {order.paymentMethod}
                        </span>
                      </div>
                      <p className="font-mono text-[10px] text-ink-400">{order.momoRef}</p>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="size-3 text-emerald-600" />
                        Settled
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details Modal */}
        {activeOrder && (
          <Modal
            open={Boolean(activeOrder)}
            onClose={() => setSelectedOrderId(null)}
            title={`Order ${activeOrder.id}`}
            description={`Placed on ${formatDate(activeOrder.date)}`}
          >
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-ink-100 p-3 dark:border-white/10">
                  <span className="text-ink-400">Customer</span>
                  <p className="mt-1 font-bold text-ink-900 dark:text-white">{activeOrder.attendeeName}</p>
                  <p className="text-ink-500 dark:text-ink-400">{activeOrder.attendeeEmail}</p>
                </div>
                <div className="rounded-xl border border-ink-100 p-3 dark:border-white/10">
                  <span className="text-ink-400">Event</span>
                  <p className="mt-1 font-bold text-ink-900 dark:text-white">{activeOrder.eventTitle}</p>
                  <p className="text-ink-500 dark:text-ink-400">{activeOrder.tickets} Ticket(s)</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-ink-100 p-3 dark:border-white/10">
                  <span className="text-ink-400">Gateway / Channel</span>
                  <p className="mt-1 font-bold text-ink-900 dark:text-white">{activeOrder.paymentMethod}</p>
                  <p className="font-mono text-[11px] text-ink-500 dark:text-ink-400">{activeOrder.momoRef}</p>
                </div>
                <div className="rounded-xl border border-ink-100 p-3 dark:border-white/10">
                  <span className="text-ink-400">Settlement Amount</span>
                  <p className="mt-1 text-base font-black text-ink-900 dark:text-white">
                    {formatCurrency(activeOrder.amount)}
                  </p>
                  <p className="text-emerald-600 font-semibold dark:text-emerald-400">Status: {activeOrder.status}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-ink-100 dark:border-white/10">
                <Button variant="ghost" onClick={() => setSelectedOrderId(null)}>
                  Close
                </Button>
                {activeOrder.status !== 'refunded' && (
                  <Button
                    variant="danger"
                    onClick={() => handleRefund(activeOrder.id)}
                    loading={refundMutation.isPending}
                  >
                    Issue Refund
                  </Button>
                )}
              </div>
            </div>
          </Modal>
        )}
      </div>
    </>
  )
}
