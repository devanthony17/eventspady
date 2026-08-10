import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { BadgePercent, Copy, Plus } from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { DashboardShell } from '@components/dashboard/DashboardShell'
import { Button } from '@components/ui/Button'
import { Badge } from '@components/ui/Badge'
import { Modal } from '@components/ui/Modal'
import { Input, Select } from '@components/ui/Field'
import { useToast } from '@context/ToastContext'
import { coupons as seedCoupons } from '@data/coupons'
import { eventsByOrganizer } from '@data/events'
import { formatCurrency, formatDate } from '@lib/utils'

const ORGANIZER_ID = 'nova-collective'

export default function Coupons() {
  const { nav } = useOutletContext()
  const toast = useToast()
  const myEvents = eventsByOrganizer(ORGANIZER_ID)

  const [list, setList] = useState(seedCoupons)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    code: '',
    type: 'percentage',
    value: '',
    eventId: '',
    minOrder: '0',
    usageLimit: '100',
    expiresAt: '',
  })

  const onCreate = (e) => {
    e.preventDefault()

    const coupon = {
      code: form.code.toUpperCase(),
      type: form.type,
      value: Number(form.value),
      eventId: form.eventId || null,
      minOrder: Number(form.minOrder),
      maxDiscount: null,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : new Date(Date.now() + 30 * 86400000).toISOString(),
      usageLimit: Number(form.usageLimit),
      used: 0,
      description: `${form.type === 'percentage' ? `${form.value}% off` : `${formatCurrency(Number(form.value))} off`}`,
    }

    setList((prev) => [coupon, ...prev])
    setOpen(false)
    setForm({ code: '', type: 'percentage', value: '', eventId: '', minOrder: '0', usageLimit: '100', expiresAt: '' })
    toast.success(`Coupon ${coupon.code} is live.`)
  }

  return (
    <>
      <Seo title="Coupons" noIndex />

      <DashboardShell
        nav={nav}
        eyebrow="Organizer panel"
        title="Coupons"
        description="Percentage or flat-amount discounts, scoped to a specific event."
        actions={
          <Button size="sm" iconLeft={Plus} onClick={() => setOpen(true)}>
            New coupon
          </Button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((coupon) => {
            const expired = new Date(coupon.expiresAt) < new Date()
            const exhausted = coupon.used >= coupon.usageLimit
            const usedPercent = Math.min(100, Math.round((coupon.used / coupon.usageLimit) * 100))
            const scopedEvent = coupon.eventId ? myEvents.find((e) => e.id === coupon.eventId) : null

            return (
              <article key={coupon.code} className="surface flex flex-col p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-lg font-extrabold tracking-wider">{coupon.code}</p>
                    <p className="mt-1 text-sm text-brand-600 dark:text-brand-400">
                      {coupon.type === 'percentage'
                        ? `${coupon.value}% off`
                        : `${formatCurrency(coupon.value)} off`}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(coupon.code)
                      toast.success(`Copied ${coupon.code}.`)
                    }}
                    aria-label={`Copy coupon ${coupon.code}`}
                    className="grid size-9 shrink-0 place-items-center rounded-xl text-ink-400 transition hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-white/10 dark:hover:text-white"
                  >
                    <Copy className="size-4" />
                  </button>
                </div>

                <div className="mb-4 flex flex-wrap gap-1.5">
                  <Badge tone={expired || exhausted ? 'danger' : 'success'} size="sm">
                    {expired ? 'Expired' : exhausted ? 'Limit reached' : 'Active'}
                  </Badge>
                  <Badge tone="neutral" size="sm">
                    {scopedEvent ? scopedEvent.title.slice(0, 22) : 'All events'}
                  </Badge>
                  {coupon.minOrder > 0 && (
                    <Badge tone="neutral" size="sm">
                      Min {formatCurrency(coupon.minOrder)}
                    </Badge>
                  )}
                </div>

                <div className="mt-auto">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-ink-500 dark:text-ink-400">
                      {coupon.used.toLocaleString()} / {coupon.usageLimit.toLocaleString()} redeemed
                    </span>
                    <span className="font-bold">{usedPercent}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-ink-100 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500"
                      style={{ width: `${usedPercent}%` }}
                    />
                  </div>
                  <p className="mt-3 text-xs text-ink-400">
                    {expired ? 'Expired' : 'Expires'} {formatDate(coupon.expiresAt)}
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      </DashboardShell>

      {/* Create coupon */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create a coupon"
        description="Attach it to one event or leave it open across all of yours."
      >
        <form onSubmit={onCreate} className="space-y-4">
          <Input
            label="Coupon code"
            required
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="SUMMER25"
            className="uppercase"
            hint="Attendees type this at checkout — keep it short and memorable."
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Discount type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="percentage">Percentage</option>
              <option value="flat">Flat amount</option>
            </Select>

            <Input
              label={form.type === 'percentage' ? 'Percentage off' : 'Amount off (USD)'}
              type="number"
              min="1"
              required
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              placeholder={form.type === 'percentage' ? '25' : '20'}
            />
          </div>

          <Select
            label="Applies to"
            value={form.eventId}
            onChange={(e) => setForm({ ...form, eventId: e.target.value })}
          >
            <option value="">All of my events</option>
            {myEvents.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </Select>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Minimum order (USD)"
              type="number"
              min="0"
              value={form.minOrder}
              onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
            />
            <Input
              label="Redemption limit"
              type="number"
              min="1"
              value={form.usageLimit}
              onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
            />
          </div>

          <Input
            label="Expires on"
            type="date"
            value={form.expiresAt}
            onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            hint="Leave blank for 30 days from today."
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" fullWidth onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" fullWidth iconLeft={BadgePercent}>
              Create coupon
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
