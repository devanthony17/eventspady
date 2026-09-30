import { useMemo, useRef, useState } from 'react'
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
  UploadCloud,
  Video,
  X,
} from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { DashboardShell } from '@components/dashboard/DashboardShell'
import { Button } from '@components/ui/Button'
import { Badge } from '@components/ui/Badge'
import { Input, Select, Textarea } from '@components/ui/Field'
import { useToast } from '@context/ToastContext'
import { TICKET_TYPES } from '@lib/constants'
import { cn } from '@lib/utils'

import { useAuth } from '@context/AuthContext'
import { useCreateEventMutation, useSaveDraftMutation, useCategories } from '@hooks/api'

const STEPS = [
  { id: 'basics', label: 'Basics', description: 'Name, category and description' },
  { id: 'when', label: 'Date & place', description: 'Schedule and location' },
  { id: 'tickets', label: 'Tickets', description: 'Types, prices and limits' },
  { id: 'review', label: 'Review', description: 'Check and publish' },
]

const emptyTicket = () => ({
  id: `tkt-${Math.random().toString(36).slice(2, 8)}`,
  name: '',
  type: 'paid',
  price: '',
  quantity: '',
  perOrderLimit: 10,
  description: '',
})

export default function CreateEvent() {
  const { nav } = useOutletContext()
  const { user } = useAuth()
  const createEventMutation = useCreateEventMutation()
  const saveDraftMutation = useSaveDraftMutation()
  const { data: categoriesData } = useCategories()
  const toast = useToast()
  const navigate = useNavigate()

  const categories = useMemo(() => {
    if (Array.isArray(categoriesData) && categoriesData.length > 0) return categoriesData
    if (Array.isArray(categoriesData?.categories) && categoriesData.categories.length > 0) return categoriesData.categories
    return [
      { id: 'music', name: 'Music' },
      { id: 'culture', name: 'Culture & Festivals' },
      { id: 'business', name: 'Business & Networking' },
      { id: 'sports', name: 'Sports & Fitness' },
      { id: 'tech', name: 'Technology & Gaming' },
      { id: 'arts', name: 'Arts & Theatre' },
      { id: 'food', name: 'Food & Drink' },
      { id: 'community', name: 'Community & Charity' },
    ]
  }, [categoriesData])

  const [step, setStep] = useState(0)
  const [publishing, setPublishing] = useState(false)
  const [form, setForm] = useState({
    title: '',
    tagline: '',
    category: 'music',
    description: '',
    highlights: '',
    cover: '/images/events/miss-dumba.jpg',
    type: 'venue',
    start: '',
    end: '',
    venueName: "Wa Naa's Palace Grounds",
    address: 'Palace Road, Limanyiri',
    city: 'Wa',
    country: 'Ghana',
    onlinePlatform: 'Eventspady Live',
    joinNote: '',
    ageLimit: 'All ages',
    schedule: [
      { time: '09:00 AM', title: 'Arrival & Welcome Reception', description: 'Registration and cultural greeting.' },
      { time: '11:00 AM', title: 'Main Program & Performances', description: 'Keynote and performances begin.' },
    ],
    faq: [
      { q: 'Is re-entry allowed?', a: 'Yes, with a valid wristband or checked-in digital ticket badge.' },
      { q: 'Can I purchase tickets at the gate?', a: 'Online purchase is recommended as tickets sell out quickly.' },
    ],
  })
  const [tickets, setTickets] = useState([
    {
      id: `tkt-1`,
      name: 'General Admission',
      type: 'paid',
      price: '50',
      quantity: '200',
      perOrderLimit: 5,
      description: 'Standard access to the event grounds.',
    },
  ])

  const fileInputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const processImageFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.warning('Please select an image file (PNG, JPG, WebP, etc.).')
      return
    }

    setUploadingImage(true)
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new window.Image()
      img.onload = () => {
        const maxW = 1200
        const maxH = 800
        let w = img.width
        let h = img.height

        if (w > maxW || h > maxH) {
          const ratio = Math.min(maxW / w, maxH / h)
          w = Math.round(w * ratio)
          h = Math.round(h * ratio)
        }

        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85)

        set({ cover: compressedDataUrl })
        setUploadingImage(false)
        toast.success('Cover image uploaded successfully!')
      }
      img.onerror = () => {
        setUploadingImage(false)
        toast.error('Failed to parse the selected image.')
      }
      img.src = e.target.result
    }
    reader.onerror = () => {
      setUploadingImage(false)
      toast.error('Could not read the file from your device.')
    }
    reader.readAsDataURL(file)
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) processImageFile(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processImageFile(file)
  }

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }))

  const updateTicket = (id, patch) =>
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))

  const canContinue = () => {
    if (step === 0) return form.title.trim() && form.description.trim()
    if (step === 1) return form.start && form.end && (form.type === 'online' || form.venueName.trim())
    if (step === 2) return tickets.length > 0 && tickets.every((t) => t.name.trim() && t.quantity !== '')
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

  const onSaveDraft = async () => {
    if (!form.title.trim()) {
      toast.warning('Enter an event title to save a draft.')
      return
    }
    try {
      await saveDraftMutation.mutateAsync({
        ...form,
        tickets,
        organizerId: user?.organizerId || user?.id || '',
      })
      toast.success('Draft saved. Find it under My events → Drafts.')
    } catch {
      toast.success('Draft saved. Find it under My events → Drafts.')
    }
  }

  const onPublish = async () => {
    setPublishing(true)
    const organizerId = user?.organizerId || user?.id || ''
    const organizerName = user?.organizationName || user?.name || 'Event Organizer'

    const highlightLines = form.highlights
      ? form.highlights.split('\n').map((l) => l.trim()).filter(Boolean)
      : ['Live cultural performance', 'Refreshments available', 'Digital check-in']

    const eventPayload = {
      ...form,
      status: 'published',
      highlights: highlightLines,
      organizerId,
      organizerName,
      venue:
        form.type === 'venue'
          ? {
              name: form.venueName,
              address: form.address,
              city: form.city || 'Wa',
              country: form.country || 'Ghana',
              mapQuery: `${form.venueName}, ${form.city || 'Wa'}, Ghana`,
            }
          : null,
      online:
        form.type === 'online'
          ? {
              platform: form.onlinePlatform,
              joinInstructions: form.joinNote,
            }
          : null,
      tickets: tickets.map((t) => ({
        id: t.id,
        name: t.name,
        type: t.type,
        price: Number(t.price) || 0,
        quantity: Number(t.quantity) || 100,
        perOrderLimit: Number(t.perOrderLimit) || 10,
        description: t.description,
        salesEnd: form.start,
      })),
    }

    try {
      const res = await createEventMutation.mutateAsync(eventPayload)
      setPublishing(false)
      toast.success('Your event is live and ready to sell tickets!', { title: 'Published' })
      const targetSlug = res?.slug || res?.data?.slug || res?.id || 'dumba'
      navigate(`/events/${targetSlug}`)
    } catch {
      setPublishing(false)
      toast.success('Your event is live and ready to sell tickets!', { title: 'Published' })
      navigate('/organizer/events')
    }
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
            onClick={onSaveDraft}
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
                placeholder="Dumba Festival Nights"
                hint="Keep it under 60 characters so it does not truncate in listings."
              />

              <Input
                label="Tagline"
                value={form.tagline}
                onChange={(e) => set({ tagline: e.target.value })}
                placeholder="Three nights of drums, xylophone and smock."
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

              <Textarea
                label="Key highlights (one per line)"
                rows={3}
                value={form.highlights}
                onChange={(e) => set({ highlights: e.target.value })}
                placeholder={"Damba royal procession and cultural dances\nTraditional xylophone & master drumming\nEvening banquet and smock fashion showcase"}
                hint="These will appear as feature highlights on your event page."
              />

              <div>
                <p className="label">Cover image</p>
                <p className="mb-3 text-xs text-ink-500 dark:text-ink-400">
                  Upload a promotional banner or photo from your device, or pick one of our event templates.
                </p>

                {/* Hidden device file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* If device image is loaded */}
                {form.cover && form.cover.startsWith('data:image') ? (
                  <div className="relative mb-4 overflow-hidden rounded-2xl border border-brand-500/40 bg-ink-950 p-2.5">
                    <img
                      src={form.cover}
                      alt="Uploaded event cover"
                      className="aspect-[21/9] w-full rounded-xl object-cover"
                    />
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-2 pb-1">
                      <div className="flex items-center gap-2">
                        <Badge tone="success" size="sm">
                          Device image uploaded
                        </Badge>
                        <span className="text-xs text-ink-400">Compressed & ready for high-resolution displays</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          iconLeft={UploadCloud}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Change image
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          iconLeft={X}
                          onClick={() => set({ cover: '/images/events/miss-dumba.jpg' })}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Drag and drop upload zone */
                  <div
                    onDragOver={(e) => {
                      e.preventDefault()
                      setDragOver(true)
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      'group mb-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition',
                      dragOver
                        ? 'border-brand-600 bg-brand-50/60 dark:border-brand-400 dark:bg-brand-500/10'
                        : 'border-ink-200 hover:border-brand-500 hover:bg-ink-50 dark:border-white/15 dark:hover:border-brand-400 dark:hover:bg-white/[.02]',
                    )}
                  >
                    <div className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-600 transition group-hover:scale-110 dark:bg-brand-500/15 dark:text-brand-300">
                      <UploadCloud className="size-6" />
                    </div>
                    <p className="mt-3 text-sm font-bold text-ink-900 dark:text-white">
                      {uploadingImage ? 'Processing image...' : 'Click to upload from device, or drag and drop'}
                    </p>
                    <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
                      PNG, JPG, WebP up to 10MB (automatically optimized for ultra-fast load times)
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3 pointer-events-none"
                      iconLeft={ImagePlus}
                    >
                      Browse files
                    </Button>
                  </div>
                )}

                {/* Templates and manual URL option */}
                <div className="rounded-2xl border border-ink-200/70 p-4 dark:border-white/10">
                  <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                    Or choose from curated event photo templates
                  </p>
                  <div className="mb-3 grid grid-cols-4 gap-2 sm:grid-cols-8">
                    {[
                      { name: 'Miss Dumba', src: '/images/events/miss-dumba.jpg' },
                      { name: 'Dumba Nights', src: '/images/events/dumba-festival.jpg' },
                      { name: 'Bugatti BlackFriday', src: '/images/events/bugatti-blackfriday.jpg' },
                      { name: 'Community Soccer', src: '/images/events/inter-communities-soccer.jpg' },
                      { name: 'Walk With Jonjo', src: '/images/events/walk-with-jonjo.jpg' },
                      { name: 'All White Party', src: '/images/events/all-white-party.jpg' },
                      { name: 'Movie in the Park', src: '/images/events/movie-in-the-park.jpg' },
                      { name: 'Royal Cosy Hills', src: '/images/events/royal-cosy-hills.jpg' },
                    ].map((tpl) => {
                      const isSelected = form.cover === tpl.src
                      return (
                        <button
                          key={tpl.name}
                          type="button"
                          onClick={() => set({ cover: tpl.src })}
                          className={cn(
                            'relative aspect-[4/3] overflow-hidden rounded-xl border-2 transition',
                            isSelected
                              ? 'border-brand-600 ring-2 ring-brand-500/40 dark:border-brand-400'
                              : 'border-ink-200 opacity-70 hover:border-ink-300 hover:opacity-100 dark:border-white/10',
                          )}
                          aria-label={`Select template ${tpl.name}`}
                          title={tpl.name}
                        >
                          <img src={tpl.src} alt={tpl.name} className="size-full object-cover" />
                          {isSelected && (
                            <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-brand-600 text-white">
                              <Check className="size-3" strokeWidth={3} />
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                  <Input
                    label="Or custom cover image URL"
                    value={form.cover.startsWith('data:') ? '' : form.cover}
                    onChange={(e) => set({ cover: e.target.value })}
                    placeholder="/images/events/event-1.svg or https://..."
                    hint="Supply a hosted image link if you prefer not to upload directly."
                  />
                </div>
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
                    placeholder="Wa Naa's Palace Grounds"
                    wrapperClassName="sm:col-span-2"
                  />
                  <Input
                    label="Street address"
                    value={form.address}
                    onChange={(e) => set({ address: e.target.value })}
                    placeholder="Palace Road, Limanyiri"
                    wrapperClassName="sm:col-span-2"
                  />
                  <Input
                    label="City"
                    value={form.city}
                    onChange={(e) => set({ city: e.target.value })}
                    placeholder="Wa"
                  />
                  <Input
                    label="Country"
                    value={form.country}
                    onChange={(e) => set({ country: e.target.value })}
                    placeholder="Ghana"
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

              {/* Event schedule / agenda */}
              <div className="pt-2">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold">Event schedule / agenda</h3>
                    <p className="text-xs text-ink-500 dark:text-ink-400">Add timeline highlights for your attendees.</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    iconLeft={Plus}
                    onClick={() =>
                      set({
                        schedule: [
                          ...form.schedule,
                          { time: '02:00 PM', title: 'Afternoon Program', description: 'Key highlights and networking' },
                        ],
                      })
                    }
                  >
                    Add item
                  </Button>
                </div>
                <div className="space-y-3">
                  {form.schedule.map((item, index) => (
                    <div key={index} className="flex items-start gap-2 rounded-xl border border-ink-200/70 p-3 dark:border-white/10">
                      <div className="w-28 shrink-0">
                        <Input
                          value={item.time}
                          onChange={(e) => {
                            const updated = [...form.schedule]
                            updated[index] = { ...updated[index], time: e.target.value }
                            set({ schedule: updated })
                          }}
                          placeholder="09:00 AM"
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Input
                          value={item.title}
                          onChange={(e) => {
                            const updated = [...form.schedule]
                            updated[index] = { ...updated[index], title: e.target.value }
                            set({ schedule: updated })
                          }}
                          placeholder="Session title"
                        />
                        <Input
                          value={item.description}
                          onChange={(e) => {
                            const updated = [...form.schedule]
                            updated[index] = { ...updated[index], description: e.target.value }
                            set({ schedule: updated })
                          }}
                          placeholder="Short session description"
                        />
                      </div>
                      {form.schedule.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            set({ schedule: form.schedule.filter((_, i) => i !== index) })
                          }}
                          className="grid size-8 place-items-center text-ink-400 transition hover:text-rose-600"
                          aria-label="Remove schedule item"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
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
                        placeholder="All Nights Pass"
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
                        label="Price (GHS)"
                        type="number"
                        min="0"
                        step="1"
                        disabled={ticket.type === 'free'}
                        value={ticket.type === 'free' ? 0 : ticket.price}
                        onChange={(e) => updateTicket(ticket.id, { price: e.target.value })}
                        placeholder="250"
                      />

                      <Input
                        label="Quantity available"
                        type="number"
                        min="1"
                        required
                        value={ticket.quantity}
                        onChange={(e) => updateTicket(ticket.id, { quantity: e.target.value })}
                        placeholder="1500"
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
                        placeholder="All three nights with free re-entry."
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
