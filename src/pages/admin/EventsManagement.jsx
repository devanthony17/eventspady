import { useState, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  Check,
  CheckCircle2,
  ExternalLink,
  Eye,
  ImagePlus,
  MapPin,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Star,
  Ticket,
  Trash2,
  UploadCloud,
  Users,
  Video,
  Wine,
  Store,
  X,
  Zap,
} from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { Badge } from '@components/ui/Badge'
import { Button } from '@components/ui/Button'
import { Input, Select, Textarea } from '@components/ui/Field'
import { Modal } from '@components/ui/Modal'
import { useStore } from '@context/StoreContext'
import { useToast } from '@context/ToastContext'
import { TICKET_TYPES } from '@lib/constants'
import {
  useAdminEvents,
  useSetEventFeaturedMutation,
  useUpdateEventStatusMutation,
  useAdminDeleteEventMutation,
  useAdminCreateEventMutation,
  useAdminUpdateEventMutation,
} from '@hooks/api'
import { formatCurrency, formatDate, cn } from '@lib/utils'

const PRESET_BANNERS = [
  { id: 'p1', url: '/images/events/event-1.svg', label: 'Music & Concert' },
  { id: 'p2', url: '/images/events/event-2.svg', label: 'Culture & Festival' },
  { id: 'p3', url: '/images/events/event-3.svg', label: 'Business & Summit' },
  { id: 'p4', url: '/images/events/event-4.svg', label: 'Tech & Gaming' },
  { id: 'p5', url: '/images/events/event-5.svg', label: 'Sports & Fitness' },
  { id: 'p6', url: '/images/events/event-6.svg', label: 'Food & Arts' },
]

const CATEGORIES = [
  { id: 'music', label: 'Music' },
  { id: 'culture', label: 'Culture & Festivals' },
  { id: 'business', label: 'Business & Networking' },
  { id: 'sports', label: 'Sports & Fitness' },
  { id: 'tech', label: 'Technology & Gaming' },
  { id: 'arts', label: 'Arts & Theatre' },
  { id: 'food', label: 'Food & Drink' },
  { id: 'community', label: 'Community & Charity' },
]

export default function EventsManagement() {
  const { events: storeEvents = [], createEvent, updateEvent, deleteEvent } = useStore()
  const { data: eventsData, isLoading } = useAdminEvents()
  const setFeaturedMutation = useSetEventFeaturedMutation()
  const updateStatusMutation = useUpdateEventStatusMutation()
  const deleteMutation = useAdminDeleteEventMutation()
  const createMutation = useAdminCreateEventMutation()
  const updateMutation = useAdminUpdateEventMutation()
  const toast = useToast()

  const events = useMemo(() => {
    if (Array.isArray(eventsData)) return eventsData
    if (Array.isArray(eventsData?.events)) return eventsData.events
    if (eventsData?.data) return eventsData.data
    if (eventsData !== undefined) return []
    return storeEvents
  }, [eventsData, storeEvents])

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Create Event Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Edit Event Modal state
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [editSubmitting, setEditSubmitting] = useState(false)
  const editFileInputRef = useRef(null)
  const [editUploadingImage, setEditUploadingImage] = useState(false)
  const [editForm, setEditForm] = useState(null)
  const [editTickets, setEditTickets] = useState([])

  const initialForm = {
    title: '',
    tagline: '',
    category: 'music',
    organizerName: 'Eventspady Official',
    cover: '/images/events/event-1.svg',
    type: 'venue', // 'venue' | 'online'
    venueName: '',
    address: '',
    city: 'Wa',
    onlinePlatform: 'Google Meet',
    joinNote: '',
    start: '',
    end: '',
    description: '',
    highlights: '',
    isFree: false,
    featured: false,
  }

  const [form, setForm] = useState(initialForm)
  const [tickets, setTickets] = useState([
    {
      id: `tkt-1`,
      name: 'General Admission',
      price: 50,
      quantity: 100,
      perOrderLimit: 10,
      description: 'Standard admission entry ticket',
    },
  ])

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const evCat = typeof ev.category === 'object' ? ev.category?.id : ev.category
      const matchesCategory = categoryFilter === 'all' || evCat === categoryFilter
      const matchesSearch =
        !search ||
        ev.title?.toLowerCase().includes(search.toLowerCase()) ||
        ev.venue?.city?.toLowerCase().includes(search.toLowerCase()) ||
        ev.organizer?.name?.toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [events, categoryFilter, search])

  const toggleFeatured = async (ev) => {
    const nextVal = !ev.featured
    try {
      await setFeaturedMutation.mutateAsync({ id: ev.id, featured: nextVal })
    } catch {
      // Non-blocking fallback
    }
    updateEvent(ev.id, { featured: nextVal })
    toast.success(`Event "${ev.title}" is ${nextVal ? 'now featured' : 'unfeatured'} on homepage.`)
  }

  const handleDelete = async (ev) => {
    if (window.confirm(`Are you sure you want to remove event "${ev.title}" from the platform?`)) {
      try {
        await deleteMutation.mutateAsync(ev.id)
      } catch {
        try {
          await updateStatusMutation.mutateAsync({ id: ev.id, status: 'cancelled', reason: 'Deleted by admin' })
        } catch {
          // Non-blocking fallback
        }
      }
      deleteEvent(ev.id)
      toast.info(`Event "${ev.title}" removed.`)
    }
  }

  // ── Edit helpers ─────────────────────────────────────────────
  const openEditModal = (ev) => {
    setEditingEvent(ev)
    setEditForm({
      title: ev.title || '',
      tagline: ev.tagline || '',
      category: (typeof ev.category === 'object' ? ev.category?.id : ev.category) || 'music',
      organizerName: ev.organizer?.name || ev.organizerName || 'Eventspady Official',
      cover: ev.cover || '/images/events/event-1.svg',
      type: ev.type || 'venue',
      venueName: ev.venue?.name || '',
      address: ev.venue?.address || '',
      city: ev.venue?.city || 'Wa',
      onlinePlatform: ev.online?.platform || 'Google Meet',
      joinNote: ev.online?.joinInstructions || '',
      start: ev.start ? ev.start.slice(0, 16) : '',
      end: ev.end ? ev.end.slice(0, 16) : '',
      description: ev.description || '',
      highlights: Array.isArray(ev.highlights) ? ev.highlights.join('\n') : (ev.highlights || ''),
      isFree: Boolean(ev.isFree),
      featured: Boolean(ev.featured),
    })
    setEditTickets(
      Array.isArray(ev.tickets) && ev.tickets.length > 0
        ? ev.tickets.map((t) => ({ ...t }))
        : [
            {
              id: `tkt-1`,
              name: 'General Admission',
              price: 50,
              quantity: 100,
              perOrderLimit: 10,
              description: 'Standard admission entry ticket',
            },
          ],
    )
    setIsEditOpen(true)
  }

  const processEditImageFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.warning('Please select an image file (PNG, JPG, WebP, etc.).')
      return
    }
    setEditUploadingImage(true)
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new window.Image()
      img.onload = () => {
        const maxW = 1200, maxH = 800
        let w = img.width, h = img.height
        if (w > maxW || h > maxH) {
          const ratio = Math.min(maxW / w, maxH / h)
          w = Math.round(w * ratio)
          h = Math.round(h * ratio)
        }
        const canvas = document.createElement('canvas')
        canvas.width = w; canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)
        setEditForm((prev) => ({ ...prev, cover: canvas.toDataURL('image/jpeg', 0.85) }))
        setEditUploadingImage(false)
        toast.success('Event poster updated!')
      }
      img.onerror = () => { setEditUploadingImage(false); toast.error('Failed to parse the image.') }
      img.src = e.target.result
    }
    reader.onerror = () => { setEditUploadingImage(false); toast.error('Could not read the file.') }
    reader.readAsDataURL(file)
  }

  const addEditTicketTier = (type = 'paid') => {
    const isTable = type === 'table'
    const isVendor = type === 'vendor'
    setEditTickets((prev) => [
      ...prev,
      {
        id: `tkt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: isTable ? 'VIP Table for 6 (Stage Front)' : isVendor ? 'Vendor Exhibition Space (10x10 ft)' : 'Standard Admission',
        type,
        price: isTable ? 1200 : isVendor ? 450 : 50,
        quantity: isTable ? 10 : isVendor ? 12 : 100,
        perOrderLimit: isTable || isVendor ? 2 : 10,
        description: 'Ticket tier',
        seatsPerTable: isTable ? 6 : 4,
        tableLocation: isTable ? 'Stage Front' : '',
        tablePackage: '',
        dedicatedWaiter: isTable,
        vipParking: isTable ? 2 : 0,
        expressEntry: isTable,
        spaceSize: isVendor ? '10x10 ft' : '',
        vendorCategory: isVendor ? 'Food & Drink' : '',
        passesIncluded: isVendor ? 2 : 1,
        tablesChairsIncluded: isVendor ? '1 Table + 2 Chairs' : '',
        powerIncluded: isVendor,
        waterIncluded: false,
      },
    ])
  }

  const updateEditTicketTier = (id, patch) => {
    setEditTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  const removeEditTicketTier = (id) => {
    if (editTickets.length <= 1) {
      toast.warning('Events must have at least one ticket tier.')
      return
    }
    setEditTickets((prev) => prev.filter((t) => t.id !== id))
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editForm.title.trim()) { toast.warning('Please enter an event title.'); return }
    if (!editForm.start) { toast.warning('Please specify an event start date and time.'); return }
    setEditSubmitting(true)

    const highlightList = editForm.highlights
      ? editForm.highlights.split('\n').map((h) => h.trim()).filter(Boolean)
      : []

    const organizerName = editForm.organizerName.trim() || 'Eventspady Official'
    const capacity = editTickets.reduce((sum, t) => sum + (Number(t.quantity) || 0), 0)

    const patch = {
      title: editForm.title.trim(),
      tagline: editForm.tagline.trim() || editForm.title.trim(),
      category: editForm.category,
      cover: editForm.cover || '/images/events/event-1.svg',
      start: editForm.start,
      end: editForm.end || editForm.start,
      type: editForm.type,
      venue:
        editForm.type === 'venue'
          ? {
              name: editForm.venueName || 'Wa Regional Center',
              address: editForm.address || 'Wa Central',
              city: editForm.city || 'Wa',
              country: 'Ghana',
              mapQuery: `${editForm.venueName || 'Wa'}, ${editForm.city || 'Wa'}, Ghana`,
            }
          : null,
      online:
        editForm.type === 'online'
          ? { platform: editForm.onlinePlatform || 'Google Meet', joinInstructions: editForm.joinNote || '' }
          : null,
      organizerName,
      organizer: {
        ...(editingEvent?.organizer || {}),
        name: organizerName,
      },
      tickets: editTickets.map((t) => ({
        id: t.id,
        name: t.name,
        type: editForm.isFree ? 'free' : (t.type || 'paid'),
        price: editForm.isFree ? 0 : Number(t.price) || 0,
        quantity: Number(t.quantity) || 100,
        perOrderLimit: Number(t.perOrderLimit) || 10,
        description: t.description || '',
        seatsPerTable: t.type === 'table' ? Number(t.seatsPerTable) || 4 : undefined,
        tableLocation: t.type === 'table' ? t.tableLocation : undefined,
        tablePackage: t.type === 'table' ? t.tablePackage : undefined,
        dedicatedWaiter: t.type === 'table' ? Boolean(t.dedicatedWaiter) : undefined,
        vipParking: t.type === 'table' ? Number(t.vipParking) || 0 : undefined,
        expressEntry: t.type === 'table' ? Boolean(t.expressEntry) : undefined,
        spaceSize: t.type === 'vendor' ? t.spaceSize : undefined,
        vendorCategory: t.type === 'vendor' ? t.vendorCategory : undefined,
        passesIncluded: t.type === 'vendor' ? Number(t.passesIncluded) || 2 : undefined,
        tablesChairsIncluded: t.type === 'vendor' ? t.tablesChairsIncluded : undefined,
        powerIncluded: t.type === 'vendor' ? Boolean(t.powerIncluded) : undefined,
        waterIncluded: t.type === 'vendor' ? Boolean(t.waterIncluded) : undefined,
        sold: t.sold || 0,
        salesEnd: editForm.start,
      })),
      description: editForm.description.trim(),
      highlights: highlightList,
      featured: Boolean(editForm.featured),
      isFree: Boolean(editForm.isFree),
      capacity,
    }

    try {
      updateEvent(editingEvent.id, patch)
      try {
        await updateMutation.mutateAsync({ id: editingEvent.id, ...patch })
      } catch {
        // Mutation sync fallback — store already updated locally
      }
      toast.success(`Event "${editForm.title}" has been updated successfully!`, { title: 'Event Updated' })
      setIsEditOpen(false)
      setEditingEvent(null)
      setEditForm(null)
    } catch (err) {
      toast.error(err.message || 'Failed to update event.')
    } finally {
      setEditSubmitting(false)
    }
  }
  // ─────────────────────────────────────────────────────────────

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

        setForm((prev) => ({ ...prev, cover: compressedDataUrl }))
        setUploadingImage(false)
        toast.success('Event poster uploaded successfully!')
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

  const addTicketTier = (type = 'paid') => {
    const isTable = type === 'table'
    const isVendor = type === 'vendor'
    setTickets((prev) => [
      ...prev,
      {
        id: `tkt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: isTable
          ? 'VIP Table for 6 (Stage Front)'
          : isVendor
            ? 'Vendor Exhibition Space (10x10 ft)'
            : 'Standard Admission',
        type,
        price: isTable ? 1200 : isVendor ? 450 : 50,
        quantity: isTable ? 10 : isVendor ? 12 : 100,
        perOrderLimit: isTable || isVendor ? 2 : 10,
        description: isTable
          ? 'Reserved table seating for up to 6 guests with dedicated server and bottle service.'
          : isVendor
            ? '10x10 ft covered space, standard 220V power point, 1 table, 2 chairs, and 2 vendor admission badges.'
            : 'Standard admission entry ticket',
        seatsPerTable: isTable ? 6 : 4,
        tableLocation: isTable ? 'Stage Front / Golden Circle' : '',
        tablePackage: isTable ? '1 Champagne bottle + 6 Chasers & VIP fruit platter' : '',
        dedicatedWaiter: isTable ? true : false,
        vipParking: isTable ? 2 : 0,
        expressEntry: isTable ? true : false,
        spaceSize: isVendor ? '10x10 ft Canopy' : '',
        vendorCategory: isVendor ? 'Food & Drink, Crafts or Retail' : '',
        passesIncluded: isVendor ? 2 : 1,
        tablesChairsIncluded: isVendor ? '1 Table + 2 Chairs' : '',
        powerIncluded: isVendor ? true : false,
        waterIncluded: isVendor ? false : false,
      },
    ])
  }

  const updateTicketTier = (id, patch) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  const removeTicketTier = (id) => {
    if (tickets.length <= 1) {
      toast.warning('Events must have at least one ticket tier.')
      return
    }
    setTickets((prev) => prev.filter((t) => t.id !== id))
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.warning('Please enter an event title.')
      return
    }
    if (!form.start) {
      toast.warning('Please specify an event start date and time.')
      return
    }

    setSubmitting(true)

    const slug = `${form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`
    const highlightList = form.highlights
      ? form.highlights.split('\n').map((h) => h.trim()).filter(Boolean)
      : ['Official platform event', 'Instant digital ticket delivery', 'Mobile Money & Card accepted']

    const organizerName = form.organizerName.trim() || 'Eventspady Official'
    const organizerId = `admin-org-${Date.now()}`

    const capacity = tickets.reduce((sum, t) => sum + (Number(t.quantity) || 0), 0)

    const eventPayload = {
      title: form.title.trim(),
      tagline: form.tagline.trim() || form.title.trim(),
      category: form.category,
      cover: form.cover || '/images/events/event-1.svg',
      slug,
      start: form.start,
      end: form.end || form.start,
      type: form.type,
      venue:
        form.type === 'venue'
          ? {
              name: form.venueName || 'Wa Regional Center',
              address: form.address || 'Wa Central',
              city: form.city || 'Wa',
              country: 'Ghana',
              mapQuery: `${form.venueName || 'Wa'}, ${form.city || 'Wa'}, Ghana`,
            }
          : null,
      online:
        form.type === 'online'
          ? {
              platform: form.onlinePlatform || 'Google Meet',
              joinInstructions: form.joinNote || 'Link will be sent to confirmed ticket holders.',
            }
          : null,
      organizerName,
      organizerId,
      organizer: {
        id: organizerId,
        name: organizerName,
        logo: '/images/mark.svg',
        verified: true,
        rating: 5.0,
        reviews: 0,
      },
      tickets: tickets.map((t) => ({
        id: t.id,
        name: t.name,
        type: form.isFree ? 'free' : (t.type || 'paid'),
        price: form.isFree ? 0 : Number(t.price) || 0,
        quantity: Number(t.quantity) || 100,
        perOrderLimit: Number(t.perOrderLimit) || (t.type === 'table' || t.type === 'vendor' ? 2 : 10),
        description: t.description || '',
        seatsPerTable: t.type === 'table' ? Number(t.seatsPerTable) || 4 : undefined,
        tableLocation: t.type === 'table' ? t.tableLocation : undefined,
        tablePackage: t.type === 'table' ? t.tablePackage : undefined,
        dedicatedWaiter: t.type === 'table' ? Boolean(t.dedicatedWaiter) : undefined,
        vipParking: t.type === 'table' ? Number(t.vipParking) || 0 : undefined,
        expressEntry: t.type === 'table' ? Boolean(t.expressEntry) : undefined,
        spaceSize: t.type === 'vendor' ? t.spaceSize || '10x10 ft' : undefined,
        vendorCategory: t.type === 'vendor' ? t.vendorCategory : undefined,
        passesIncluded: t.type === 'vendor' ? Number(t.passesIncluded) || 2 : undefined,
        tablesChairsIncluded: t.type === 'vendor' ? t.tablesChairsIncluded : undefined,
        powerIncluded: t.type === 'vendor' ? Boolean(t.powerIncluded) : undefined,
        waterIncluded: t.type === 'vendor' ? Boolean(t.waterIncluded) : undefined,
        sold: 0,
        salesEnd: form.start,
      })),
      description: form.description.trim() || 'Join us for this exciting live event.',
      highlights: highlightList,
      featured: Boolean(form.featured),
      status: 'published',
      isCustom: true,
      capacity,
      sold: 0,
      remaining: capacity,
    }

    try {
      createEvent(eventPayload)
      try {
        await createMutation.mutateAsync(eventPayload)
      } catch {
        // Mutation sync fallback
      }
      toast.success(`Event "${form.title}" is published and live on the website!`, {
        title: 'Event Published',
      })
      setIsCreateOpen(false)
      setForm(initialForm)
      setTickets([
        {
          id: `tkt-1`,
          name: 'General Admission',
          price: 50,
          quantity: 100,
          perOrderLimit: 10,
          description: 'Standard admission entry ticket',
        },
      ])
    } catch (err) {
      toast.error(err.message || 'Failed to create event.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Seo
        title="Events Platform Management — Admin Console"
        description="Oversee and curate all live events across Upper West and Ghana."
        noIndex
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-3xl">
              Events Management ({events.length})
            </h1>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
              Publish events directly as admin, manage spotlights, and monitor real-time ticket sales.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsCreateOpen(true)}
              size="sm"
              iconLeft={Plus}
            >
              Add Event (Admin)
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="surface flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                categoryFilter === 'all'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-white/[.06]'
              }`}
            >
              All categories
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${
                  categoryFilter === cat.id
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-white/[.06]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              placeholder="Search event, organizer or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-ink-200 bg-white py-2 pl-9 pr-4 text-xs text-ink-900 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-ink-800 dark:text-white"
            />
          </div>
        </div>

        {/* Events Grid / Table */}
        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-ink-200/80 bg-ink-50/50 text-ink-500 dark:border-white/10 dark:bg-white/[.02] dark:text-ink-400">
                <tr>
                  <th className="px-5 py-3.5 font-medium uppercase tracking-wider">Event Details</th>
                  <th className="px-4 py-3.5 font-medium uppercase tracking-wider">Date & Venue</th>
                  <th className="px-4 py-3.5 font-medium uppercase tracking-wider">Organizer</th>
                  <th className="px-4 py-3.5 font-medium uppercase tracking-wider">Ticket Sales</th>
                  <th className="px-4 py-3.5 font-medium uppercase tracking-wider">Spotlight</th>
                  <th className="px-5 py-3.5 text-right font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-white/[.06]">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <div className="grid size-12 place-items-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                          <Calendar className="size-6" />
                        </div>
                        <h3 className="mt-3 text-sm font-bold text-ink-900 dark:text-white">
                          No events found
                        </h3>
                        <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
                          {search || categoryFilter !== 'all'
                            ? 'No events match the selected search or category filters.'
                            : 'There are no active events yet. Add an event independently to publish it directly to the website.'}
                        </p>
                        <Button
                          onClick={() => setIsCreateOpen(true)}
                          size="sm"
                          iconLeft={Plus}
                          className="mt-4"
                        >
                          Add Event Now
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((ev) => {
                    const soldRatio = Math.round(((ev.sold || 0) / (ev.capacity || 100)) * 100)

                    return (
                      <tr key={ev.id} className="transition hover:bg-ink-50/50 dark:hover:bg-white/[.02]">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={ev.cover || '/images/events/event-1.svg'}
                              alt=""
                              onError={(e) => {
                                e.currentTarget.onerror = null
                                e.currentTarget.src = '/images/events/event-1.svg'
                              }}
                              className="size-12 rounded-xl object-cover bg-ink-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-ink-900 dark:text-white truncate">
                                {ev.title}
                              </p>
                              <p className="text-[11px] text-ink-400">
                                {ev.isFree ? 'Free Admission' : `From ${formatCurrency(ev.priceFrom || 0)}`}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-medium text-ink-800 dark:text-ink-200">
                            {formatDate(ev.start)}
                          </p>
                          <p className="text-[11px] text-ink-400">
                            {ev.type === 'online' ? 'Online Event' : `${ev.venue?.name || 'Venue'}, ${ev.venue?.city || 'Wa'}`}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-semibold text-ink-800 dark:text-ink-200 truncate">
                            {ev.organizer?.name || ev.organizerName || 'Verified Partner'}
                          </p>
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            Verified
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center justify-between text-[11px] font-medium">
                            <span>{(Number(ev.sold) || 0).toLocaleString()} sold</span>
                            <span className="text-ink-400">{soldRatio}%</span>
                          </div>
                          <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-ink-100 dark:bg-white/10">
                            <div
                              className="h-full bg-brand-500"
                              style={{ width: `${Math.min(100, soldRatio)}%` }}
                            />
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          {ev.featured ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40">
                              <Star className="size-3 fill-amber-500 text-amber-500" />
                              Featured
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md bg-ink-50 px-2 py-0.5 text-xs font-medium text-ink-600 border border-ink-200/60 dark:bg-white/[.04] dark:text-ink-400 dark:border-white/10">
                              Standard
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => toggleFeatured(ev)}
                              className="rounded-lg border border-ink-200 px-2.5 py-1 text-xs font-medium text-ink-700 hover:bg-ink-100 dark:border-white/10 dark:text-ink-300 dark:hover:bg-white/10"
                              title={ev.featured ? 'Remove from featured' : 'Feature on homepage'}
                            >
                              {ev.featured ? 'Unfeature' : 'Feature'}
                            </button>
                            <Link
                              to={`/events/${ev.slug}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 rounded-lg border border-ink-200 px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 dark:border-white/10 dark:text-brand-400 dark:hover:bg-brand-950/50"
                              title="View event live on website"
                            >
                              <span>View</span>
                              <ExternalLink className="size-3" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => openEditModal(ev)}
                              className="grid size-7 place-items-center rounded-lg text-ink-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-500/10 dark:hover:text-brand-400"
                              title="Edit event"
                            >
                              <Pencil className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(ev)}
                              className="grid size-7 place-items-center rounded-lg text-ink-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                              title="Delete event"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Admin Independent Event Creation Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
          <div
            className="fixed inset-0 bg-ink-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsCreateOpen(false)}
          />

          <div className="relative w-full max-w-3xl rounded-2xl border border-ink-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-ink-900 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="absolute right-5 top-5 grid size-8 place-items-center rounded-lg text-ink-400 hover:text-ink-700 dark:hover:text-white"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                <Sparkles className="size-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-ink-900 dark:text-white">
                  Add Event (Independent Admin Mode)
                </h3>
                <p className="text-xs text-ink-500 dark:text-ink-400">
                  Create and publish an event listing directly to the website without needing an organizer login.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4 rounded-xl border border-ink-200/70 p-4 dark:border-white/10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                  1. Basic Details
                </h4>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300">
                      Event Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Wa Damba Music & Cultural Festival 2026"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-xs text-ink-900 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-ink-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300">
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-xs text-ink-900 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-ink-800 dark:text-white"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300">
                      Organizer Name (Independent)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Upper West Regional Council, or Wa Youth Association"
                      value={form.organizerName}
                      onChange={(e) => setForm({ ...form, organizerName: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-xs text-ink-900 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-ink-800 dark:text-white"
                    />
                    <p className="mt-1 text-[10px] text-ink-400">
                      Displays on the website as the hosting entity.
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300">
                      Tagline / Short Teaser
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Three nights of royal drumming, smock fashion and high-energy stage performances."
                      value={form.tagline}
                      onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-xs text-ink-900 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-ink-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Event Poster / Cover */}
              <div className="space-y-4 rounded-xl border border-ink-200/70 p-4 dark:border-white/10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                  2. Event Poster / Banner
                </h4>

                <div className="grid gap-4 sm:grid-cols-[160px_1fr] sm:items-center">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-ink-200 bg-ink-100 dark:border-white/10 dark:bg-ink-800">
                    <img
                      src={form.cover || '/images/events/event-1.svg'}
                      alt="Poster Preview"
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = '/images/events/event-1.svg'
                      }}
                      className="size-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 text-[9px] font-bold text-white">
                      Preview
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => processImageFile(e.target.files?.[0])}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        iconLeft={ImagePlus}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                      >
                        {uploadingImage ? 'Processing...' : 'Upload Poster from Device'}
                      </Button>
                    </div>

                    <div>
                      <p className="text-[11px] font-medium text-ink-500 dark:text-ink-400">
                        Or pick from curated platform presets:
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        {PRESET_BANNERS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setForm({ ...form, cover: preset.url })}
                            className={cn(
                              'flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition',
                              form.cover === preset.url
                                ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300'
                                : 'border-ink-200 bg-white text-ink-600 hover:bg-ink-50 dark:border-white/10 dark:bg-ink-800 dark:text-ink-300',
                            )}
                          >
                            <span className="size-2 rounded-full bg-brand-500" />
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Date & Location */}
              <div className="space-y-4 rounded-xl border border-ink-200/70 p-4 dark:border-white/10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                  3. Date, Time & Location
                </h4>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300">
                      Start Date & Time <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={form.start}
                      onChange={(e) => setForm({ ...form, start: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs text-ink-900 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-ink-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300">
                      End Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={form.end}
                      onChange={(e) => setForm({ ...form, end: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs text-ink-900 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-ink-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300">
                      Location Format
                    </label>
                    <div className="mt-1 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, type: 'venue' })}
                        className={cn(
                          'flex-1 rounded-xl border py-2 text-xs font-medium transition',
                          form.type === 'venue'
                            ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300'
                            : 'border-ink-200 text-ink-600 dark:border-white/10 dark:text-ink-400',
                        )}
                      >
                        Physical Venue
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, type: 'online' })}
                        className={cn(
                          'flex-1 rounded-xl border py-2 text-xs font-medium transition',
                          form.type === 'online'
                            ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300'
                            : 'border-ink-200 text-ink-600 dark:border-white/10 dark:text-ink-400',
                        )}
                      >
                        Online Event
                      </button>
                    </div>
                  </div>

                  {form.type === 'venue' ? (
                    <div>
                      <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300">
                        City
                      </label>
                      <input
                        type="text"
                        placeholder="Wa, Jirapa, Nandom, Lawra, etc."
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs text-ink-900 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-ink-800 dark:text-white"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300">
                        Streaming Platform
                      </label>
                      <input
                        type="text"
                        placeholder="Google Meet, Zoom, YouTube Live"
                        value={form.onlinePlatform}
                        onChange={(e) => setForm({ ...form, onlinePlatform: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs text-ink-900 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-ink-800 dark:text-white"
                      />
                    </div>
                  )}

                  {form.type === 'venue' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300">
                          Venue Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Wa Naa's Palace Ground or Wa Sports Stadium"
                          value={form.venueName}
                          onChange={(e) => setForm({ ...form, venueName: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs text-ink-900 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-ink-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300">
                          Address / Area
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Commercial Street, Wa Central"
                          value={form.address}
                          onChange={(e) => setForm({ ...form, address: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs text-ink-900 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-ink-800 dark:text-white"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Tickets & Pricing */}
              <div className="space-y-4 rounded-xl border border-ink-200/70 p-4 dark:border-white/10">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                      4. Ticket Tiers, Tables & Vendor Spaces
                    </h4>
                    <p className="mt-0.5 text-[11px] text-ink-400">
                      Add standard admission tickets, VIP bottle service tables, and commercial exhibition spaces.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-700 dark:text-ink-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isFree}
                        onChange={(e) => setForm({ ...form, isFree: e.target.checked })}
                        className="rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span>Free Event</span>
                    </label>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => addTicketTier('paid')}
                        className="inline-flex items-center gap-1 rounded-lg border border-ink-200 bg-white px-2.5 py-1 text-xs font-semibold text-ink-700 hover:bg-ink-50 dark:border-white/10 dark:bg-ink-800 dark:text-ink-200"
                      >
                        <Plus className="size-3" /> Ticket
                      </button>
                      <button
                        type="button"
                        onClick={() => addTicketTier('table')}
                        className="inline-flex items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-100 dark:border-purple-800/40 dark:bg-purple-950/40 dark:text-purple-300"
                      >
                        <Wine className="size-3" /> Table
                      </button>
                      <button
                        type="button"
                        onClick={() => addTicketTier('vendor')}
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300"
                      >
                        <Store className="size-3" /> Vendor
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {tickets.map((t, idx) => {
                    const isTable = t.type === 'table'
                    const isVendor = t.type === 'vendor'

                    return (
                      <div
                        key={t.id}
                        className={cn(
                          'rounded-xl border p-3.5 transition space-y-3',
                          isTable
                            ? 'border-purple-200/80 bg-purple-50/20 dark:border-purple-800/40 dark:bg-purple-950/10'
                            : isVendor
                              ? 'border-emerald-200/80 bg-emerald-50/20 dark:border-emerald-800/40 dark:bg-emerald-950/10'
                              : 'border-ink-200/70 bg-white dark:border-white/10 dark:bg-ink-900/40',
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-ink-900 dark:text-white">Tier {idx + 1}</span>
                            {isTable ? (
                              <span className="inline-flex items-center gap-1 rounded-md border border-purple-200 bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700 dark:border-purple-800/40 dark:bg-purple-950/40 dark:text-purple-300">
                                <Wine className="size-3" /> Table Reservation
                              </span>
                            ) : isVendor ? (
                              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300">
                                <Store className="size-3" /> Vendor Space
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-md border border-ink-200 bg-ink-50 px-2 py-0.5 text-[11px] font-semibold text-ink-700 dark:border-white/10 dark:bg-white/5 dark:text-ink-300">
                                Standard Admission
                              </span>
                            )}
                          </div>

                          {tickets.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTicketTier(t.id)}
                              className="grid size-6 place-items-center rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="grid gap-3 sm:grid-cols-4">
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold uppercase text-ink-400">
                              {isTable ? 'Table Name / Tier' : isVendor ? 'Vendor Space / Stall Name' : 'Tier Name'}
                            </label>
                            <input
                              type="text"
                              value={t.name}
                              onChange={(e) => updateTicketTier(t.id, { name: e.target.value })}
                              placeholder={
                                isTable
                                  ? 'e.g. VIP Table for 6 (Stage Front)'
                                  : isVendor
                                    ? 'e.g. Food & Beverage Canopy (10x10 ft)'
                                    : 'e.g. Regular Pass'
                              }
                              className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs text-ink-900 outline-none dark:border-white/10 dark:bg-ink-800 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase text-ink-400">
                              {isTable ? 'Table Price (GH₵)' : isVendor ? 'Booth Price (GH₵)' : 'Price (GH₵)'}
                            </label>
                            <input
                              type="number"
                              disabled={form.isFree || t.type === 'free'}
                              value={form.isFree || t.type === 'free' ? 0 : t.price}
                              onChange={(e) => updateTicketTier(t.id, { price: e.target.value })}
                              className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs text-ink-900 outline-none disabled:bg-ink-100 dark:border-white/10 dark:bg-ink-800 dark:text-white dark:disabled:bg-ink-950"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase text-ink-400">
                              {isTable ? 'Total Tables' : isVendor ? 'Total Booths' : 'Total Quantity'}
                            </label>
                            <input
                              type="number"
                              value={t.quantity}
                              onChange={(e) => updateTicketTier(t.id, { quantity: e.target.value })}
                              className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs text-ink-900 outline-none dark:border-white/10 dark:bg-ink-800 dark:text-white"
                            />
                          </div>
                        </div>

                        {/* Table Specific Fields */}
                        {isTable && (
                          <div className="grid gap-3 sm:grid-cols-3 pt-1 border-t border-purple-100 dark:border-purple-900/30">
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400">
                                Seats per Table
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="30"
                                value={t.seatsPerTable ?? 6}
                                onChange={(e) => updateTicketTier(t.id, { seatsPerTable: e.target.value })}
                                className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs text-ink-900 outline-none dark:border-white/10 dark:bg-ink-800 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400">
                                Zone / Placement
                              </label>
                              <input
                                type="text"
                                value={t.tableLocation || ''}
                                onChange={(e) => updateTicketTier(t.id, { tableLocation: e.target.value })}
                                placeholder="Stage Front / VIP Terrace"
                                className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs text-ink-900 outline-none dark:border-white/10 dark:bg-ink-800 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400">
                                VIP Parking Passes
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="10"
                                value={t.vipParking ?? 2}
                                onChange={(e) => updateTicketTier(t.id, { vipParking: e.target.value })}
                                className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs text-ink-900 outline-none dark:border-white/10 dark:bg-ink-800 dark:text-white"
                              />
                            </div>

                            <div className="sm:col-span-3">
                              <label className="block text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400">
                                Hospitality & Bottle Package
                              </label>
                              <input
                                type="text"
                                value={t.tablePackage || ''}
                                onChange={(e) => updateTicketTier(t.id, { tablePackage: e.target.value })}
                                placeholder="e.g. 1 Champagne bottle + 6 Energy Drinks & Chasers, Gourmet Finger Food Platter"
                                className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs text-ink-900 outline-none dark:border-white/10 dark:bg-ink-800 dark:text-white"
                              />
                            </div>
                          </div>
                        )}

                        {/* Vendor Space Specific Fields */}
                        {isVendor && (
                          <div className="grid gap-3 sm:grid-cols-3 pt-1 border-t border-emerald-100 dark:border-emerald-900/30">
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                                Space Dimensions
                              </label>
                              <input
                                type="text"
                                value={t.spaceSize || '10x10 ft Canopy'}
                                onChange={(e) => updateTicketTier(t.id, { spaceSize: e.target.value })}
                                placeholder="10x10 ft Canopy or 6x3 Table"
                                className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs text-ink-900 outline-none dark:border-white/10 dark:bg-ink-800 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                                Permitted Category
                              </label>
                              <input
                                type="text"
                                value={t.vendorCategory || 'Food & Beverages'}
                                onChange={(e) => updateTicketTier(t.id, { vendorCategory: e.target.value })}
                                placeholder="Food, Fashion, Crafts, Tech"
                                className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs text-ink-900 outline-none dark:border-white/10 dark:bg-ink-800 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                                Staff Badges Included
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="10"
                                value={t.passesIncluded ?? 2}
                                onChange={(e) => updateTicketTier(t.id, { passesIncluded: e.target.value })}
                                className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs text-ink-900 outline-none dark:border-white/10 dark:bg-ink-800 dark:text-white"
                              />
                            </div>

                            <div className="sm:col-span-3 flex flex-wrap gap-4 pt-1">
                              <label className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-700 dark:text-ink-300 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={t.powerIncluded ?? true}
                                  onChange={(e) => updateTicketTier(t.id, { powerIncluded: e.target.checked })}
                                  className="rounded border-ink-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span>220V Electricity Outlet Included</span>
                              </label>

                              <label className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-700 dark:text-ink-300 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={t.waterIncluded ?? false}
                                  onChange={(e) => updateTicketTier(t.id, { waterIncluded: e.target.checked })}
                                  className="rounded border-ink-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span>Running Water Access</span>
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => addTicketTier('paid')}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-ink-300 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-50 dark:border-white/20 dark:text-ink-200 dark:hover:bg-white/5"
                    >
                      <Plus className="size-3.5" />
                      <span>Add Ticket Tier</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => addTicketTier('table')}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-purple-300 bg-purple-50/50 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100/60 dark:border-purple-800/40 dark:bg-purple-950/20 dark:text-purple-300"
                    >
                      <Wine className="size-3.5" />
                      <span>Add Table Reservation</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => addTicketTier('vendor')}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-emerald-300 bg-emerald-50/50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100/60 dark:border-emerald-800/40 dark:bg-emerald-950/20 dark:text-emerald-300"
                    >
                      <Store className="size-3.5" />
                      <span>Add Vendor Space</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Description & Promotion */}
              <div className="space-y-4 rounded-xl border border-ink-200/70 p-4 dark:border-white/10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                  5. Description & Website Spotlight
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300">
                    Event Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide details about what attendees will experience, artists performing, speakers, etc."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-ink-200 bg-white p-3 text-xs text-ink-900 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-ink-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300">
                    Highlights (One per line)
                  </label>
                  <textarea
                    rows={2}
                    placeholder={"Royal Damba procession\nLive highlife drumming\nSmock fashion runway showcase"}
                    value={form.highlights}
                    onChange={(e) => setForm({ ...form, highlights: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-ink-200 bg-white p-3 text-xs text-ink-900 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-ink-800 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-amber-200/60 bg-amber-50/40 p-3.5 dark:border-amber-800/40 dark:bg-amber-950/20">
                  <div className="flex items-center gap-2">
                    <Star className="size-4 text-amber-500 fill-amber-500" />
                    <div>
                      <p className="text-xs font-bold text-ink-900 dark:text-white">
                        Feature on Homepage Spotlight
                      </p>
                      <p className="text-[11px] text-ink-500 dark:text-ink-400">
                        Places this event in the premier curated strip on the platform homepage.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="size-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-ink-100 pt-4 dark:border-white/10">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  iconLeft={Check}
                >
                  {submitting ? 'Publishing Event...' : 'Publish Event to Website'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Event Modal ───────────────────────────────────── */}
      {isEditOpen && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
          <div
            className="fixed inset-0 bg-ink-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsEditOpen(false)}
          />

          <div className="relative w-full max-w-3xl rounded-2xl border border-ink-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-ink-900 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="absolute right-5 top-5 grid size-8 place-items-center rounded-lg text-ink-400 hover:text-ink-700 dark:hover:text-white"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                <Pencil className="size-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-ink-900 dark:text-white">
                  Edit Event
                </h3>
                <p className="text-xs text-ink-500 dark:text-ink-400">
                  Update the details of <span className="font-semibold text-ink-700 dark:text-ink-200">{editingEvent?.title}</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4 rounded-xl border border-ink-200/70 p-4 dark:border-white/10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">1. Basic Details</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300">Event Title <span className="text-rose-500">*</span></label>
                    <input type="text" required placeholder="Event title" value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-xs text-ink-900 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-ink-800 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300">Category</label>
                    <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-xs text-ink-900 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-ink-800 dark:text-white">
                      {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300">Organizer Name</label>
                    <input type="text" placeholder="Organizer name" value={editForm.organizerName}
                      onChange={(e) => setEditForm({ ...editForm, organizerName: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-xs text-ink-900 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-ink-800 dark:text-white" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300">Tagline / Short Teaser</label>
                    <input type="text" placeholder="A short teaser line" value={editForm.tagline}
                      onChange={(e) => setEditForm({ ...editForm, tagline: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-xs text-ink-900 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-ink-800 dark:text-white" />
                  </div>
                </div>
              </div>

              {/* Event Poster */}
              <div className="space-y-4 rounded-xl border border-ink-200/70 p-4 dark:border-white/10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">2. Event Poster / Banner</h4>
                <div className="grid gap-4 sm:grid-cols-[160px_1fr] sm:items-center">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-ink-200 bg-ink-100 dark:border-white/10 dark:bg-ink-800">
                    <img src={editForm.cover || '/images/events/event-1.svg'} alt="Preview"
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/events/event-1.svg' }}
                      className="size-full object-cover" />
                    <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 text-[9px] font-bold text-white">Preview</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <input ref={editFileInputRef} type="file" accept="image/*"
                        onChange={(e) => processEditImageFile(e.target.files?.[0])} className="hidden" />
                      <button type="button" disabled={editUploadingImage}
                        onClick={() => editFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50 dark:border-white/10 dark:text-ink-300 dark:hover:bg-white/5">
                        <ImagePlus className="size-3.5" />
                        {editUploadingImage ? 'Processing...' : 'Upload New Poster'}
                      </button>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-ink-500 dark:text-ink-400">Or pick from presets:</p>
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        {PRESET_BANNERS.map((preset) => (
                          <button key={preset.id} type="button" onClick={() => setEditForm({ ...editForm, cover: preset.url })}
                            className={cn('flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition',
                              editForm.cover === preset.url
                                ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300'
                                : 'border-ink-200 bg-white text-ink-600 hover:bg-ink-50 dark:border-white/10 dark:bg-ink-800 dark:text-ink-300')}>
                            <span className="size-2 rounded-full bg-brand-500" />{preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Date & Location */}
              <div className="space-y-4 rounded-xl border border-ink-200/70 p-4 dark:border-white/10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">3. Date, Time &amp; Location</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300">Start Date &amp; Time <span className="text-rose-500">*</span></label>
                    <input type="datetime-local" required value={editForm.start}
                      onChange={(e) => setEditForm({ ...editForm, start: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs text-ink-900 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-ink-800 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300">End Date &amp; Time</label>
                    <input type="datetime-local" value={editForm.end}
                      onChange={(e) => setEditForm({ ...editForm, end: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs text-ink-900 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-ink-800 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300">Location Format</label>
                    <div className="mt-1 flex gap-2">
                      <button type="button" onClick={() => setEditForm({ ...editForm, type: 'venue' })}
                        className={cn('flex-1 rounded-xl border py-2 text-xs font-medium transition',
                          editForm.type === 'venue'
                            ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300'
                            : 'border-ink-200 text-ink-600 dark:border-white/10 dark:text-ink-400')}>
                        Physical Venue
                      </button>
                      <button type="button" onClick={() => setEditForm({ ...editForm, type: 'online' })}
                        className={cn('flex-1 rounded-xl border py-2 text-xs font-medium transition',
                          editForm.type === 'online'
                            ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300'
                            : 'border-ink-200 text-ink-600 dark:border-white/10 dark:text-ink-400')}>
                        Online Event
                      </button>
                    </div>
                  </div>
                  {editForm.type === 'venue' ? (
                    <div>
                      <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300">City</label>
                      <input type="text" placeholder="City" value={editForm.city}
                        onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs text-ink-900 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-ink-800 dark:text-white" />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300">Streaming Platform</label>
                      <input type="text" placeholder="Google Meet, Zoom, YouTube Live" value={editForm.onlinePlatform}
                        onChange={(e) => setEditForm({ ...editForm, onlinePlatform: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs text-ink-900 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-ink-800 dark:text-white" />
                    </div>
                  )}
                  {editForm.type === 'venue' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300">Venue Name</label>
                        <input type="text" placeholder="Venue name" value={editForm.venueName}
                          onChange={(e) => setEditForm({ ...editForm, venueName: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs text-ink-900 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-ink-800 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300">Address / Area</label>
                        <input type="text" placeholder="Street or area" value={editForm.address}
                          onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs text-ink-900 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-ink-800 dark:text-white" />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Ticket Tiers */}
              <div className="space-y-4 rounded-xl border border-ink-200/70 p-4 dark:border-white/10">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">4. Ticket Tiers</h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-700 dark:text-ink-300 cursor-pointer">
                      <input type="checkbox" checked={editForm.isFree}
                        onChange={(e) => setEditForm({ ...editForm, isFree: e.target.checked })}
                        className="rounded border-ink-300 text-brand-600 focus:ring-brand-500" />
                      <span>Free Event</span>
                    </label>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button type="button" onClick={() => addEditTicketTier('paid')}
                        className="inline-flex items-center gap-1 rounded-lg border border-ink-200 bg-white px-2.5 py-1 text-xs font-semibold text-ink-700 hover:bg-ink-50 dark:border-white/10 dark:bg-ink-800 dark:text-ink-200">
                        <Plus className="size-3" /> Ticket
                      </button>
                      <button type="button" onClick={() => addEditTicketTier('table')}
                        className="inline-flex items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-100 dark:border-purple-800/40 dark:bg-purple-950/40 dark:text-purple-300">
                        <Wine className="size-3" /> Table
                      </button>
                      <button type="button" onClick={() => addEditTicketTier('vendor')}
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <Store className="size-3" /> Vendor
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {editTickets.map((t, idx) => {
                    const isTable = t.type === 'table'
                    const isVendor = t.type === 'vendor'
                    return (
                      <div key={t.id} className={cn('rounded-xl border p-3.5 space-y-3',
                        isTable ? 'border-purple-200/80 bg-purple-50/20 dark:border-purple-800/40 dark:bg-purple-950/10'
                          : isVendor ? 'border-emerald-200/80 bg-emerald-50/20 dark:border-emerald-800/40 dark:bg-emerald-950/10'
                          : 'border-ink-200/70 bg-white dark:border-white/10 dark:bg-ink-900/40')}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-ink-900 dark:text-white">Tier {idx + 1}{isTable ? ' · Table' : isVendor ? ' · Vendor' : ''}</span>
                          {editTickets.length > 1 && (
                            <button type="button" onClick={() => removeEditTicketTier(t.id)}
                              className="grid size-6 place-items-center rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40">
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>
                        <div className="grid gap-3 sm:grid-cols-4">
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold uppercase text-ink-400">Tier Name</label>
                            <input type="text" value={t.name}
                              onChange={(e) => updateEditTicketTier(t.id, { name: e.target.value })}
                              className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs text-ink-900 outline-none dark:border-white/10 dark:bg-ink-800 dark:text-white" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-ink-400">Price (GH₵)</label>
                            <input type="number" disabled={editForm.isFree}
                              value={editForm.isFree ? 0 : t.price}
                              onChange={(e) => updateEditTicketTier(t.id, { price: e.target.value })}
                              className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs text-ink-900 outline-none disabled:bg-ink-100 dark:border-white/10 dark:bg-ink-800 dark:text-white dark:disabled:bg-ink-950" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-ink-400">Quantity</label>
                            <input type="number" value={t.quantity}
                              onChange={(e) => updateEditTicketTier(t.id, { quantity: e.target.value })}
                              className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs text-ink-900 outline-none dark:border-white/10 dark:bg-ink-800 dark:text-white" />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Description & Spotlight */}
              <div className="space-y-4 rounded-xl border border-ink-200/70 p-4 dark:border-white/10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">5. Description &amp; Spotlight</h4>
                <div>
                  <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300">Event Description</label>
                  <textarea rows={3} placeholder="Describe the event…" value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-ink-200 bg-white p-3 text-xs text-ink-900 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-ink-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300">Highlights (one per line)</label>
                  <textarea rows={2} placeholder="Highlight 1&#10;Highlight 2" value={editForm.highlights}
                    onChange={(e) => setEditForm({ ...editForm, highlights: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-ink-200 bg-white p-3 text-xs text-ink-900 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-ink-800 dark:text-white" />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-amber-200/60 bg-amber-50/40 p-3.5 dark:border-amber-800/40 dark:bg-amber-950/20">
                  <div className="flex items-center gap-2">
                    <Star className="size-4 text-amber-500 fill-amber-500" />
                    <div>
                      <p className="text-xs font-bold text-ink-900 dark:text-white">Feature on Homepage Spotlight</p>
                      <p className="text-[11px] text-ink-500 dark:text-ink-400">Places this event in the premier curated strip on the homepage.</p>
                    </div>
                  </div>
                  <input type="checkbox" checked={editForm.featured}
                    onChange={(e) => setEditForm({ ...editForm, featured: e.target.checked })}
                    className="size-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500" />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 border-t border-ink-100 pt-4 dark:border-white/10">
                <button type="button" onClick={() => setIsEditOpen(false)}
                  className="rounded-xl border border-ink-200 px-4 py-2 text-xs font-medium text-ink-700 hover:bg-ink-50 dark:border-white/10 dark:text-ink-300 dark:hover:bg-white/5">
                  Cancel
                </button>
                <button type="submit" disabled={editSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60">
                  <Check className="size-3.5" />
                  {editSubmitting ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
