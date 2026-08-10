import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  MapPin,
  Plus,
  Save,
  Trash2,
  Video,
} from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { DashboardShell } from '@components/dashboard/DashboardShell'
import { Button } from '@components/ui/Button'
import { Badge } from '@components/ui/Badge'
import { Input, Select, Textarea } from '@components/ui/Field'
import { useToast } from '@context/ToastContext'
import { categories } from '@data/categories'
import { TICKET_TYPES } from '@lib/constants'
import { cn } from '@lib/utils'

const STEPS = [
  { id: 'basics', label: 'Basics', description: 'Name, category and description' },
  { id: 'when', label: 'Date & place', description: 'Schedule and location' },
  { id: 'tickets', label: 'Tickets', description: 'Types, prices and limits' },
  { id: 'review', label: 'Review', description: 'Check and publish' },
]

const emptyTicket = () => ({
  id: `new-${Math.random().toString(36).slice(2, 8)}`,
  name: '',
  type: 'paid',
  price: '',
  quantity: '',
  perOrderLimit: 10,
  description: '',
})

export default function CreateEvent() {
  const { nav } = useOutletContext()
  const toast = useToast()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [publishing, setPublishing] = useState(false)
  const [form, setForm] = useState({
    title: '',
    tagline: '',
    category: 'music',
    description: '',
    type: 'venue',
    start: '',
    end: '',
    venueName: '',
    address: '',
    city: '',
    country: '',
    onlinePlatform: 'Eventspady Live',
    joinNote: '',
    ageLimit: 'All ages',
  })
  const [tickets, setTickets] = useState([emptyTicket()])

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }))

  const updateTicket = (id, patch) =>
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))

  const canContinue = () => {
    if (step === 0) return form.title.trim() && form.description.trim()
    if (step === 1) return form.start && form.end && (form.type === 'online' || form.venueName.trim())
    if (step === 2) return tickets.every((t) => t.name.trim() && t.quantity !== '')
    return true
  }

  const next = () => {
    if (!canContinue()) {
      toast.warning('Fill in the required fields before continuing.')
      return
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const onPublish = async () => {
    setPublishing(true)
    await new Promise((r) => setTimeout(r, 1100))
    setPublishing(false)
    toast.success('Your event is live and ready to sell tickets.', { title: 'Published' })
    navigate('/organizer/events')
  }

  return (
    <>
      <Seo title="Create an event" noIndex />

      <DashboardShell
        nav={nav}
        eyebrow="Organizer panel"
        title="Create an event"
        description="Publish a listing in four steps. You can edit everything afterwards."
        actions={
          <Button
            variant="ghost"
            size="sm"
            iconLeft={Save}
            onClick={() => toast.success('Draft saved. Find it under My events → Drafts.')}
          >
            Save draft
          </Button>
        }
      >
        {/* Stepper */}
        <ol className="surface mb-6 grid gap-3 p-4 sm:grid-cols-4">
          {STEPS.map((item, i) => {
            const done = i < step
            const active = i === step

            return (
              <li key={item.id} className="flex items-center gap-3">
                <span
                  className={cn(
                    'grid size-9 shrink-0 place-items-center rounded-xl text-sm font-extrabold transition',
                    done
                      ? 'bg-emerald-500 text-white'
                      : active
                        ? 'bg-brand-600 text-white'
                        : 'bg-ink-100 text-ink-400 dark:bg-white/10',
                  )}
                >
                  {done ? <Check className="size-4" strokeWidth={3} aria-hidden="true" /> : i + 1}
                </span>
                <span className="min-w-0">
                  <span className={cn('block text-sm font-bold', !active && !done && 'text-ink-400')}>
                    {item.label}
                  </span>
                  <span className="block truncate text-xs text-ink-400">{item.description}</span>
                </span>
              </li>
            )
          })}
        </ol>

        <div className="surface p-6">
          {/* Step 1 — basics */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold">Tell us about your event</h2>

              <Input
                label="Event name"
                required
                value={form.title}
                onChange={(e) => set({ title: e.target.value })}
                placeholder="Nova Nights: Summer Festival"
                hint="Keep it under 60 characters so it does not truncate in listings."
              />

              <Input
                label="Tagline"
                value={form.tagline}
                onChange={(e) => set({ tagline: e.target.value })}
                placeholder="Three days. Four stages. One unforgettable skyline."
                hint="One line that appears under the title on cards and search results."
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Select label="Category" value={form.category} onChange={(e) => set({ category: e.target.value })}>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>

                <Select label="Age limit" value={form.ageLimit} onChange={(e) => set({ ageLimit: e.target.value })}>
                  {['All ages', '16+', '18+', '21+'].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </div>

              <Textarea
                label="Description"
                required
                rows={6}
                value={form.description}
                onChange={(e) => set({ description: e.target.value })}
                placeholder="What happens, who else will be there, what it costs in time and money, and what to bring."
                hint="Lead with what the attendee will experience, not with who you are."
              />

              <div>
                <p className="label">Cover image</p>
                <button
                  type="button"
                  onClick={() => toast.info('Image uploads go through the media API in production.')}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink-200 py-10 transition hover:border-brand-400 hover:bg-brand-50/50 dark:border-white/15 dark:hover:border-brand-500/40 dark:hover:bg-white/5"
                >
                  <ImagePlus className="size-8 text-ink-400" aria-hidden="true" />
                  <span className="text-sm font-semibold">Upload a cover image</span>
                  <span className="text-xs text-ink-400">JPG or PNG, at least 1200×800px</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — date & place */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold">When and where</h2>

              <fieldset>
                <legend className="label">Event type</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { id: 'venue', label: 'Venue event', description: 'In person at a physical location', icon: MapPin },
                    { id: 'online', label: 'Online event', description: 'Streamed with a join link', icon: Video },
                  ].map((option) => (
                    <label
                      key={option.id}
                      className={cn(
                        'flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition',
                        form.type === option.id
                          ? 'border-brand-600 bg-brand-50 dark:border-brand-500 dark:bg-brand-500/10'
                          : 'border-ink-200 hover:border-ink-300 dark:border-white/10',
                      )}
                    >
                      <input
                        type="radio"
                        name="event-type"
                        checked={form.type === option.id}
                        onChange={() => set({ type: option.id })}
                        className="sr-only"
                      />
                      <option.icon
                        className={cn(
                          'mt-0.5 size-5 shrink-0',
                          form.type === option.id ? 'text-brand-600 dark:text-brand-400' : 'text-ink-400',
                        )}
                        aria-hidden="true"
                      />
                      <span>
                        <span className="block text-sm font-bold">{option.label}</span>
                        <span className="mt-0.5 block text-xs text-ink-500 dark:text-ink-400">
                          {option.description}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Starts"
                  type="datetime-local"
                  required
                  value={form.start}
                  onChange={(e) => set({ start: e.target.value })}
                />
                <Input
                  label="Ends"
                  type="datetime-local"
                  required
                  value={form.end}
                  onChange={(e) => set({ end: e.target.value })}
                  hint="Multi-day events unlock One Day and All Days tickets."
                />
              </div>

              {form.type === 'venue' ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Venue name"
                    required
                    value={form.venueName}
                    onChange={(e) => set({ venueName: e.target.value })}
                    placeholder="Pier 70 Waterfront"
                    wrapperClassName="sm:col-span-2"
                  />
                  <Input
                    label="Street address"
                    value={form.address}
                    onChange={(e) => set({ address: e.target.value })}
                    placeholder="420 22nd Street"
                    wrapperClassName="sm:col-span-2"
                  />
                  <Input
                    label="City"
                    value={form.city}
                    onChange={(e) => set({ city: e.target.value })}
                    placeholder="San Francisco"
                  />
                  <Input
                    label="Country"
                    value={form.country}
                    onChange={(e) => set({ country: e.target.value })}
                    placeholder="United States"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <Select
                    label="Streaming platform"
                    value={form.onlinePlatform}
                    onChange={(e) => set({ onlinePlatform: e.target.value })}
                  >
                    {['Eventspady Live', 'Zoom', 'Google Meet', 'YouTube Live', 'Custom link'].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                  <Textarea
                    label="Joining instructions"
                    rows={3}
                    value={form.joinNote}
                    onChange={(e) => set({ joinNote: e.target.value })}
                    placeholder="A private join link is attached to your ticket and emailed 1 hour before the session."
                    hint="Attendees see this on their ticket. Never paste the raw link here."
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 3 — tickets */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">Ticket types</h2>
                  <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
                    Mix free, paid, one-day and all-days tickets on the same event.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  iconLeft={Plus}
                  onClick={() => setTickets((prev) => [...prev, emptyTicket()])}
                >
                  Add ticket
                </Button>
              </div>

              <div className="space-y-4">
                {tickets.map((ticket, index) => (
                  <div key={ticket.id} className="rounded-2xl border border-ink-200/70 p-5 dark:border-white/10">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-sm font-bold">Ticket {index + 1}</h3>
                      {tickets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setTickets((prev) => prev.filter((t) => t.id !== ticket.id))}
                          aria-label={`Remove ticket ${index + 1}`}
                          className="grid size-8 place-items-center rounded-lg text-ink-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="Ticket name"
                        required
                        value={ticket.name}
                        onChange={(e) => updateTicket(ticket.id, { name: e.target.value })}
                        placeholder="All Days Pass"
                      />

                      <Select
                        label="Type"
                        value={ticket.type}
                        onChange={(e) =>
                          updateTicket(ticket.id, {
                            type: e.target.value,
                            price: e.target.value === 'free' ? 0 : ticket.price,
                          })
                        }
                      >
                        {Object.entries(TICKET_TYPES).map(([id, meta]) => (
                          <option key={id} value={id}>
                            {meta.label}
                          </option>
                        ))}
                      </Select>

                      <Input
                        label="Price (USD)"
                        type="number"
                        min="0"
                        step="1"
                        disabled={ticket.type === 'free'}
                        value={ticket.type === 'free' ? 0 : ticket.price}
                        onChange={(e) => updateTicket(ticket.id, { price: e.target.value })}
                        placeholder="229"
                      />

                      <Input
                        label="Quantity available"
                        type="number"
                        min="1"
                        required
                        value={ticket.quantity}
                        onChange={(e) => updateTicket(ticket.id, { quantity: e.target.value })}
                        placeholder="3000"
                      />

                      <Input
                        label="Max per order"
                        type="number"
                        min="1"
                        value={ticket.perOrderLimit}
                        onChange={(e) => updateTicket(ticket.id, { perOrderLimit: e.target.value })}
                      />

                      <Input
                        label="Short description"
                        value={ticket.description}
                        onChange={(e) => updateTicket(ticket.id, { description: e.target.value })}
                        placeholder="Every stage, all three days, with free re-entry."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4 — review */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold">Review and publish</h2>

              <dl className="divide-y divide-ink-200/70 dark:divide-white/10">
                {[
                  { label: 'Event name', value: form.title || '—' },
                  { label: 'Category', value: categories.find((c) => c.id === form.category)?.name },
                  { label: 'Format', value: form.type === 'online' ? 'Online event' : 'Venue event' },
                  {
                    label: 'Location',
                    value: form.type === 'online' ? form.onlinePlatform : [form.venueName, form.city].filter(Boolean).join(', ') || '—',
                  },
                  { label: 'Starts', value: form.start ? new Date(form.start).toLocaleString() : '—' },
                  { label: 'Ends', value: form.end ? new Date(form.end).toLocaleString() : '—' },
                  { label: 'Age limit', value: form.ageLimit },
                  { label: 'Ticket types', value: `${tickets.length}` },
                  {
                    label: 'Total capacity',
                    value: tickets.reduce((sum, t) => sum + (Number(t.quantity) || 0), 0).toLocaleString(),
                  },
                ].map((row) => (
                  <div key={row.label} className="flex flex-wrap justify-between gap-2 py-3">
                    <dt className="text-sm text-ink-500 dark:text-ink-400">{row.label}</dt>
                    <dd className="text-sm font-semibold">{row.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="rounded-2xl bg-brand-50 p-5 dark:bg-brand-500/10">
                <Badge tone="brand" size="sm" className="mb-2">
                  Before you publish
                </Badge>
                <p className="text-sm text-ink-600 dark:text-ink-300">
                  Publishing makes the listing visible immediately and opens ticket sales. You can edit the
                  description, images and schedule at any time — changing prices only affects future orders.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-ink-200/70 pt-6 dark:border-white/10">
            <Button
              variant="ghost"
              iconLeft={ChevronLeft}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              Back
            </Button>

            {step < STEPS.length - 1 ? (
              <Button iconRight={ChevronRight} onClick={next}>
                Continue
              </Button>
            ) : (
              <Button loading={publishing} onClick={onPublish} size="lg">
                Publish event
              </Button>
            )}
          </div>
        </div>
      </DashboardShell>
    </>
  )
}
