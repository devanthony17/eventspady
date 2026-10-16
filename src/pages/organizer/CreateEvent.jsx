import { useMemo, useRef, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import {
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Crown,
  Droplets,
  ExternalLink,
  HelpCircle,
  ImagePlus,
  Layers,
  MapPin,
  Navigation,
  Plus,
  Save,
  ShieldCheck,
  Store,
  Trash2,
  TrendingUp,
  UploadCloud,
  Users,
  Video,
  Wifi,
  Wine,
  X,
  Zap,
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
import { useStore } from '@context/StoreContext'
import { useCreateEventMutation, useSaveDraftMutation, useCategories } from '@hooks/api'

const STEPS = [
  { id: 'basics', label: 'Basics', description: 'Name, category and description' },
  { id: 'when', label: 'Date & place', description: 'Schedule and location' },
  { id: 'tickets', label: 'Tickets & Space', description: 'Admission, tables & vendor booths' },
  { id: 'review', label: 'Review', description: 'Check and publish' },
]

export const TICKET_PRESETS = [
  // Admission passes
  {
    category: 'admission',
    badge: 'Standard',
    label: 'Standard Pass',
    type: 'paid',
    name: 'General Admission',
    price: '50',
    quantity: '250',
    perOrderLimit: 10,
    description: 'General admission pass granting entry to all standard stage and festival areas.',
  },
  {
    category: 'admission',
    badge: 'VIP Pass',
    label: 'VIP Fast-Track Pass',
    type: 'paid',
    name: 'VIP Fast-Track Pass',
    price: '150',
    quantity: '75',
    perOrderLimit: 5,
    description: 'Express queue jump, elevated viewing deck access, and 1 welcome drink voucher.',
  },
  {
    category: 'admission',
    badge: 'Early Bird',
    label: 'Early Bird Pass',
    type: 'paid',
    name: 'Early Bird Discount Pass',
    price: '35',
    quantity: '100',
    perOrderLimit: 4,
    description: 'Special early supporter pass at discounted rate. Limited allocation.',
  },

  // Table Reservations
  {
    category: 'table',
    badge: '6 Guests',
    label: 'VIP Table for 6 (Stage Front)',
    type: 'table',
    name: 'VIP Table for 6 (Stage Front)',
    price: '1200',
    quantity: '10',
    perOrderLimit: 2,
    seatsPerTable: 6,
    tableLocation: 'Stage Front / Golden Circle',
    tablePackage: '1 Moët Champagne + 6 Energy Drinks & Chasers, Gourmet Finger Food Platter',
    minSpend: 0,
    dedicatedWaiter: true,
    vipParking: 2,
    expressEntry: true,
    description: 'Front-row stage view with table seating for 6, dedicated waiter, and bottle service.',
  },
  {
    category: 'table',
    badge: '10 Guests',
    label: 'VVIP Royal Lounge for 10',
    type: 'table',
    name: 'VVIP Royal Lounge for 10',
    price: '2500',
    quantity: '5',
    perOrderLimit: 1,
    seatsPerTable: 10,
    tableLocation: 'VIP Elevated Deck / Private Terrace',
    tablePackage: '2 Premium Champagnes + 1 Cognac VSOP + Unlimited Soft Mixers + Chef Luxury Platter',
    minSpend: 0,
    dedicatedWaiter: true,
    vipParking: 3,
    expressEntry: true,
    description: 'Ultra-exclusive private sofa lounge for 10 on the elevated deck with dedicated security and butler.',
  },
  {
    category: 'table',
    badge: '4 Guests',
    label: 'High-Top Cocktail Table for 4',
    type: 'table',
    name: 'High-Top Cocktail Table for 4',
    price: '600',
    quantity: '15',
    perOrderLimit: 2,
    seatsPerTable: 4,
    tableLocation: 'Lounge / Bar Perimeter',
    tablePackage: '1 Spirit Bottle of Choice + 4 Chasers + Bar Nibbles',
    minSpend: 0,
    dedicatedWaiter: false,
    vipParking: 1,
    expressEntry: true,
    description: 'Reserved cocktail table with 4 high stools near the bar area.',
  },

  // Vendor Spaces
  {
    category: 'vendor',
    badge: '10x10 ft',
    label: 'Food & Beverage Canopy (10x10 ft)',
    type: 'vendor',
    name: 'Food & Beverage Canopy (10x10 ft)',
    price: '500',
    quantity: '12',
    perOrderLimit: 2,
    spaceSize: '10x10 ft Canopy Pitch',
    vendorCategory: 'Cooked Food, Grills, Cocktails & Beverages',
    passesIncluded: 3,
    tablesChairsIncluded: '1 Table + 2 Chairs',
    powerIncluded: true,
    waterIncluded: true,
    wifiIncluded: true,
    securityIncluded: true,
    setupHours: 'Setup: 8:00 AM – 11:30 AM',
    teardownHours: 'Teardown: 11:00 PM – 1:30 AM',
    description: 'Covered canopy space with dedicated 220V electricity point, water access, and 3 vendor badges.',
  },
  {
    category: 'vendor',
    badge: '10x10 ft',
    label: 'Fashion & Retail Booth (10x10 ft)',
    type: 'vendor',
    name: 'Fashion & Retail Booth (10x10 ft)',
    price: '400',
    quantity: '16',
    perOrderLimit: 2,
    spaceSize: '10x10 ft Covered Stall',
    vendorCategory: 'Clothing, Smocks, Footwear, Accessories & Crafts',
    passesIncluded: 2,
    tablesChairsIncluded: '1 Table + 2 Chairs',
    powerIncluded: true,
    waterIncluded: false,
    wifiIncluded: true,
    securityIncluded: true,
    setupHours: 'Setup: 8:30 AM – 12:00 PM',
    teardownHours: 'Teardown: 10:30 PM – midnight',
    description: 'Exhibition space in the retail marquee for fashion, artisanal wear, and merchandise.',
  },
  {
    category: 'vendor',
    badge: '6x3 ft',
    label: 'Artisan Tabletop Display (6x3 ft)',
    type: 'vendor',
    name: 'Artisan & Craft Tabletop (6x3 ft)',
    price: '200',
    quantity: '20',
    perOrderLimit: 2,
    spaceSize: '6x3 ft Tabletop Stall',
    vendorCategory: 'Handmade Crafts, Art, Jewelry & Souvenirs',
    passesIncluded: 1,
    tablesChairsIncluded: '1 Table + 1 Chair',
    powerIncluded: false,
    waterIncluded: false,
    wifiIncluded: true,
    securityIncluded: false,
    setupHours: 'Setup: 9:00 AM – 12:00 PM',
    teardownHours: 'Teardown: 9:30 PM – 11:00 PM',
    description: 'Compact display space for solo artisans and craft makers.',
  },
  {
    category: 'vendor',
    badge: '20x10 ft',
    label: 'Food Truck / Mobile Cart Pitch',
    type: 'vendor',
    name: 'Food Truck / Mobile Cart Pitch (20x10 ft)',
    price: '750',
    quantity: '6',
    perOrderLimit: 1,
    spaceSize: '20x10 ft Vehicle Pitch',
    vendorCategory: 'Food Trucks, Mobile Coffee/Smoothie Vans, Grills',
    passesIncluded: 4,
    tablesChairsIncluded: 'Pitch space only',
    powerIncluded: true,
    waterIncluded: true,
    wifiIncluded: true,
    securityIncluded: true,
    setupHours: 'Setup: 7:00 AM – 10:00 AM',
    teardownHours: 'Teardown: 11:30 PM – 2:00 AM',
    description: 'Vehicle parking pitch with heavy-duty 16A/220V power point and 4 vendor staff badges.',
  },
]

const emptyTicket = (type = 'paid') => {
  const isTable = type === 'table'
  const isVendor = type === 'vendor'
  const isFree = type === 'free'

  return {
    id: `tkt-${Math.random().toString(36).slice(2, 8)}`,
    name: isTable
      ? 'VIP Table for 6 (Bottle Service)'
      : isVendor
        ? 'Vendor Exhibition Space (10x10 ft)'
        : '',
    type,
    price: isFree ? '0' : isTable ? '1200' : isVendor ? '450' : '',
    quantity: isTable ? '8' : isVendor ? '12' : '',
    perOrderLimit: isTable ? 2 : isVendor ? 2 : 10,
    description: isTable
      ? 'Reserved table seating for up to 6 guests with dedicated server and hospitality package.'
      : isVendor
        ? '10x10 ft covered space, standard 220V power point, 1 table, 2 chairs, and 2 vendor admission badges.'
        : '',
    // Table specifics
    seatsPerTable: isTable ? 6 : 4,
    tableLocation: isTable ? 'VIP Elevated Terrace / Stage Deck' : '',
    tablePackage: isTable ? '1 Champagne bottle + chasers & VIP fruit platter' : '',
    minSpend: 0,
    dedicatedWaiter: isTable ? true : false,
    vipParking: isTable ? 2 : 0,
    expressEntry: isTable ? true : false,
    // Vendor specifics
    spaceSize: isVendor ? '10x10 ft' : '',
    vendorCategory: isVendor ? 'Food & Drink, Crafts or Retail' : '',
    passesIncluded: isVendor ? 2 : 1,
    tablesChairsIncluded: isVendor ? '1 Table + 2 Chairs' : '',
    powerIncluded: isVendor ? true : false,
    waterIncluded: isVendor ? false : false,
    wifiIncluded: isVendor ? true : false,
    securityIncluded: isVendor ? true : false,
    setupHours: isVendor ? 'Setup: 8:00 AM – 11:30 AM' : '',
    teardownHours: isVendor ? 'Teardown: 11:00 PM – midnight' : '',
  }
}

export default function CreateEvent() {
  const { nav } = useOutletContext()
  const { user } = useAuth()
  const store = useStore()
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
    cover: '',
    type: 'venue',
    start: '',
    end: '',
    venueName: '',
    address: '',
    city: 'Wa',
    country: 'Ghana',
    venueLat: '',
    venueLng: '',
    googleMapsUrl: '',
    onlinePlatform: '',
    joinNote: '',
    ageLimit: 'All ages',
    schedule: [],
    faq: [],
  })
  const [tickets, setTickets] = useState([
    {
      id: `tkt-1`,
      name: 'General Admission',
      type: 'paid',
      price: '',
      quantity: '',
      perOrderLimit: 5,
      description: '',
    },
  ])

  const applyPreset = (preset) => {
    setTickets((prev) => [
      ...prev,
      {
        ...preset,
        id: `tkt-${Math.random().toString(36).slice(2, 8)}`,
      },
    ])
    toast.success(`Added ${preset.label} to your ticket tiers.`)
  }

  const handleDetectCoordinates = () => {
    if (!navigator.geolocation) {
      toast.warning('Geolocation is not supported by your browser.')
      return
    }
    toast.info('Detecting device location coordinates...')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6)
        const lng = pos.coords.longitude.toFixed(6)
        setForm((prev) => ({
          ...prev,
          venueLat: lat,
          venueLng: lng,
          googleMapsUrl: prev.googleMapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
        }))
        toast.success(`Coordinates captured: ${lat}, ${lng}`)
      },
      (err) => {
        toast.warning(err.message || 'Unable to access device location.')
      },
      { timeout: 10000, enableHighAccuracy: true },
    )
  }

  const ticketStats = useMemo(() => {
    let admissionsCount = 0
    let admissionsRev = 0
    let tablesCount = 0
    let tableSeats = 0
    let tablesRev = 0
    let vendorsCount = 0
    let vendorsRev = 0

    tickets.forEach((t) => {
      const qty = Number(t.quantity) || 0
      const price = Number(t.price) || 0
      const rev = qty * price

      if (t.type === 'table') {
        tablesCount += qty
        tableSeats += qty * (Number(t.seatsPerTable) || 4)
        tablesRev += rev
      } else if (t.type === 'vendor') {
        vendorsCount += qty
        vendorsRev += rev
      } else {
        admissionsCount += qty
        admissionsRev += rev
      }
    })

    const totalCapacity = admissionsCount + tableSeats
    const totalGrossRevenue = admissionsRev + tablesRev + vendorsRev

    return {
      admissionsCount,
      admissionsRev,
      tablesCount,
      tableSeats,
      tablesRev,
      vendorsCount,
      vendorsRev,
      totalCapacity,
      totalGrossRevenue,
    }
  }, [tickets])

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
    store.saveDraft({
      ...form,
      tickets,
      organizerId: user?.organizerId || user?.id || '',
    })

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
      name: form.title,
      cover: form.cover || '/images/events/event-1.svg',
      image: form.cover || '/images/events/event-1.svg',
      venueName: form.venueName || 'Wa Central',
      address: form.address || form.venueName || 'Wa Central',
      start_time: form.start,
      end_time: form.end || form.start,
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
              lat: form.venueLat ? Number(form.venueLat) : undefined,
              lng: form.venueLng ? Number(form.venueLng) : undefined,
              googleMapsUrl: form.googleMapsUrl?.trim() || undefined,
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
        perOrderLimit: Number(t.perOrderLimit) || (t.type === 'table' || t.type === 'vendor' ? 2 : 10),
        description: t.description || '',
        // Table specific
        seatsPerTable: t.type === 'table' ? Number(t.seatsPerTable) || 4 : undefined,
        tableLocation: t.type === 'table' ? t.tableLocation : undefined,
        tablePackage: t.type === 'table' ? t.tablePackage : undefined,
        minSpend: t.type === 'table' ? Number(t.minSpend) || 0 : undefined,
        dedicatedWaiter: t.type === 'table' ? Boolean(t.dedicatedWaiter) : undefined,
        vipParking: t.type === 'table' ? Number(t.vipParking) || 0 : undefined,
        expressEntry: t.type === 'table' ? Boolean(t.expressEntry) : undefined,
        // Vendor specific
        spaceSize: t.type === 'vendor' ? t.spaceSize || '10x10 ft' : undefined,
        vendorCategory: t.type === 'vendor' ? t.vendorCategory : undefined,
        passesIncluded: t.type === 'vendor' ? Number(t.passesIncluded) || 2 : undefined,
        tablesChairsIncluded: t.type === 'vendor' ? t.tablesChairsIncluded : undefined,
        powerIncluded: t.type === 'vendor' ? Boolean(t.powerIncluded) : undefined,
        waterIncluded: t.type === 'vendor' ? Boolean(t.waterIncluded) : undefined,
        wifiIncluded: t.type === 'vendor' ? Boolean(t.wifiIncluded) : undefined,
        securityIncluded: t.type === 'vendor' ? Boolean(t.securityIncluded) : undefined,
        setupHours: t.type === 'vendor' ? t.setupHours : undefined,
        teardownHours: t.type === 'vendor' ? t.teardownHours : undefined,
        sold: 0,
        salesEnd: form.start,
      })),
      capacity: ticketStats.totalCapacity || tickets.reduce((s, t) => s + (Number(t.quantity) || 0), 0),
      sold: 0,
      remaining: ticketStats.totalCapacity || tickets.reduce((s, t) => s + (Number(t.quantity) || 0), 0),
    }

    const createdEvent = store.createEvent(eventPayload)
    let targetSlug = createdEvent?.slug || createdEvent?.id || 'events'

    try {
      const res = await createEventMutation.mutateAsync(eventPayload)
      setPublishing(false)
      toast.success('Your event is live and ready to sell tickets!', { title: 'Published' })
      targetSlug = res?.slug || res?.data?.slug || res?.id || targetSlug
      navigate(`/events/${targetSlug}`)
    } catch {
      setPublishing(false)
      toast.success('Your event is live and ready to sell tickets!', { title: 'Published' })
      navigate(`/events/${targetSlug}`)
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
                          onClick={() => set({ cover: '' })}
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

                  {/* Dedicated Venue Coordinates & Google Maps Directions Integration */}
                  <div className="sm:col-span-2 rounded-2xl border border-brand-500/20 bg-brand-50/40 p-4 dark:border-brand-500/20 dark:bg-brand-950/20 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Navigation className="size-4 text-brand-600 dark:text-brand-400" />
                        <h3 className="text-sm font-bold text-ink-900 dark:text-white">
                          Venue GPS Coordinates &amp; Google Maps Directions
                        </h3>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        iconLeft={MapPin}
                        onClick={handleDetectCoordinates}
                      >
                        Detect My Coordinates
                      </Button>
                    </div>
                    <p className="text-xs text-ink-500 dark:text-ink-400">
                      Provide exact location coordinates or paste a direct Google Maps venue link. Attendees will click &quot;Get Directions&quot; on the website to open turn-by-turn Google Maps navigation.
                    </p>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <Input
                        label="Latitude (e.g. 10.0601)"
                        type="number"
                        step="any"
                        value={form.venueLat}
                        onChange={(e) => set({ venueLat: e.target.value })}
                        placeholder="10.0601"
                      />
                      <Input
                        label="Longitude (e.g. -2.5099)"
                        type="number"
                        step="any"
                        value={form.venueLng}
                        onChange={(e) => set({ venueLng: e.target.value })}
                        placeholder="-2.5099"
                      />
                      <div>
                        <Input
                          label="Google Maps Link (Optional)"
                          type="url"
                          value={form.googleMapsUrl}
                          onChange={(e) => set({ googleMapsUrl: e.target.value })}
                          placeholder="https://maps.app.goo.gl/..."
                        />
                        {(form.googleMapsUrl || (form.venueLat && form.venueLng) || form.venueName) && (
                          <a
                            href={
                              form.googleMapsUrl ||
                              (form.venueLat && form.venueLng
                                ? `https://www.google.com/maps/dir/?api=1&destination=${form.venueLat},${form.venueLng}`
                                : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${form.venueName || ''}, ${form.city || 'Wa'}, Ghana`)}`)
                            }
                            target="_blank"
                            rel="noreferrer noopener"
                            className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                          >
                            <ExternalLink className="size-3" />
                            <span>Preview directions in Google Maps</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
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
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold">Ticket Tiers, Tables & Vendor Spaces</h2>
                  <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
                    Add standard admission passes, VIP table reservations with bottle service, and commercial vendor exhibition booths.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    iconLeft={Plus}
                    onClick={() => setTickets((prev) => [...prev, emptyTicket('paid')])}
                  >
                    Add Ticket
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    iconLeft={Wine}
                    onClick={() => setTickets((prev) => [...prev, emptyTicket('table')])}
                    className="border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800/60 dark:text-purple-300 dark:hover:bg-purple-950/30"
                  >
                    Add Table Reservation
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    iconLeft={Store}
                    onClick={() => setTickets((prev) => [...prev, emptyTicket('vendor')])}
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800/60 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
                  >
                    Add Vendor Space
                  </Button>
                </div>
              </div>

              {/* Live Inventory & Gross Financial Projection Banner */}
              <div className="overflow-hidden rounded-2xl border border-ink-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-ink-900/60">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                      <TrendingUp className="size-4" />
                    </span>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                      Inventory & Revenue Projection
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-ink-400">
                    {tickets.length} active {tickets.length === 1 ? 'tier' : 'tiers'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <div className="rounded-xl border border-ink-100 bg-ink-50/60 p-3.5 dark:border-white/5 dark:bg-white/[.02]">
                    <p className="text-[11px] font-semibold text-ink-500 dark:text-ink-400">Total Gross Potential</p>
                    <p className="mt-1 text-lg font-extrabold text-brand-600 dark:text-brand-400">
                      GH₵ {ticketStats.totalGrossRevenue.toLocaleString()}
                    </p>
                    <p className="mt-0.5 text-[10px] text-ink-400">Projected full sell-out</p>
                  </div>

                  <div className="rounded-xl border border-ink-100 bg-ink-50/60 p-3.5 dark:border-white/5 dark:bg-white/[.02]">
                    <p className="text-[11px] font-semibold text-ink-500 dark:text-ink-400">Standard Admissions</p>
                    <p className="mt-1 text-lg font-extrabold text-ink-900 dark:text-white">
                      {ticketStats.admissionsCount.toLocaleString()} <span className="text-xs font-normal text-ink-400">passes</span>
                    </p>
                    <p className="mt-0.5 text-[10px] text-ink-400">
                      GH₵ {ticketStats.admissionsRev.toLocaleString()} capacity
                    </p>
                  </div>

                  <div className="rounded-xl border border-purple-200/50 bg-purple-50/30 p-3.5 dark:border-purple-800/30 dark:bg-purple-950/20">
                    <div className="flex items-center gap-1.5">
                      <Wine className="size-3.5 text-purple-600 dark:text-purple-400" />
                      <p className="text-[11px] font-semibold text-purple-700 dark:text-purple-300">Table Reservations</p>
                    </div>
                    <p className="mt-1 text-lg font-extrabold text-purple-900 dark:text-purple-100">
                      {ticketStats.tablesCount} <span className="text-xs font-normal text-purple-600 dark:text-purple-400">tables ({ticketStats.tableSeats} seats)</span>
                    </p>
                    <p className="mt-0.5 text-[10px] text-purple-600 dark:text-purple-400">
                      GH₵ {ticketStats.tablesRev.toLocaleString()} value
                    </p>
                  </div>

                  <div className="rounded-xl border border-emerald-200/50 bg-emerald-50/30 p-3.5 dark:border-emerald-800/30 dark:bg-emerald-950/20">
                    <div className="flex items-center gap-1.5">
                      <Store className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                      <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">Vendor Spaces</p>
                    </div>
                    <p className="mt-1 text-lg font-extrabold text-emerald-900 dark:text-emerald-100">
                      {ticketStats.vendorsCount} <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400">booths</span>
                    </p>
                    <p className="mt-0.5 text-[10px] text-emerald-600 dark:text-emerald-400">
                      GH₵ {ticketStats.vendorsRev.toLocaleString()} value
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Template Presets */}
              <div className="rounded-2xl border border-dashed border-ink-300/80 p-4 dark:border-white/15">
                <div className="mb-2.5 flex items-center gap-2">
                  <Layers className="size-4 text-brand-500" />
                  <p className="text-xs font-bold text-ink-700 dark:text-ink-200">
                    Quick One-Click Presets & Templates:
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TICKET_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition',
                        preset.type === 'table'
                          ? 'border-purple-200 bg-purple-50/70 text-purple-700 hover:bg-purple-100 dark:border-purple-800/40 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/40'
                          : preset.type === 'vendor'
                            ? 'border-emerald-200 bg-emerald-50/70 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/40'
                            : 'border-ink-200 bg-ink-50 text-ink-700 hover:bg-ink-100 dark:border-white/10 dark:bg-white/5 dark:text-ink-200 dark:hover:bg-white/10',
                      )}
                    >
                      {preset.type === 'table' ? (
                        <Wine className="size-3 text-purple-600 dark:text-purple-400" />
                      ) : preset.type === 'vendor' ? (
                        <Store className="size-3 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Plus className="size-3 text-ink-500" />
                      )}
                      <span>+ {preset.label}</span>
                      <span className="rounded bg-black/10 px-1 py-0.2 text-[10px] font-bold dark:bg-white/10">
                        GH₵{preset.price}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ticket Cards List */}
              <div className="space-y-5">
                {tickets.map((ticket, index) => {
                  const isTable = ticket.type === 'table'
                  const isVendor = ticket.type === 'vendor'

                  return (
                    <div
                      key={ticket.id}
                      className={cn(
                        'rounded-2xl border p-5 transition shadow-sm',
                        isTable
                          ? 'border-purple-200/90 bg-purple-50/[.04] dark:border-purple-800/50 dark:bg-purple-950/[.07]'
                          : isVendor
                            ? 'border-emerald-200/90 bg-emerald-50/[.04] dark:border-emerald-800/50 dark:bg-emerald-950/[.07]'
                            : 'border-ink-200/80 bg-white dark:border-white/10 dark:bg-ink-900/50',
                      )}
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold">Tier {index + 1}</h3>
                          {isTable ? (
                            <span className="inline-flex items-center gap-1 rounded-md border border-purple-200/70 bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:border-purple-800/40 dark:bg-purple-950/50 dark:text-purple-300">
                              <Wine className="size-3" /> Table Reservation
                            </span>
                          ) : isVendor ? (
                            <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200/70 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/50 dark:text-emerald-300">
                              <Store className="size-3" /> Vendor Exhibition Space
                            </span>
                          ) : ticket.type === 'free' ? (
                            <span className="inline-flex items-center gap-1 rounded-md border border-blue-200/60 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-800/40 dark:bg-blue-950/40 dark:text-blue-300">
                              Free Registration
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md border border-ink-200/60 bg-ink-50 px-2.5 py-0.5 text-xs font-semibold text-ink-700 dark:border-white/10 dark:bg-white/[.04] dark:text-ink-300">
                              Standard Admission
                            </span>
                          )}
                        </div>

                        {tickets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setTickets((prev) => prev.filter((t) => t.id !== ticket.id))}
                            aria-label={`Remove tier ${index + 1}`}
                            className="grid size-8 place-items-center rounded-lg text-ink-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                          label={isTable ? 'Table Name / Tier Title' : isVendor ? 'Vendor Space / Stall Name' : 'Ticket Name'}
                          required
                          value={ticket.name}
                          onChange={(e) => updateTicket(ticket.id, { name: e.target.value })}
                          placeholder={
                            isTable
                              ? 'e.g. VIP Table for 6 (Stage Front)'
                              : isVendor
                                ? 'e.g. Food & Beverage Canopy (10x10 ft)'
                                : 'e.g. Regular Pass'
                          }
                        />

                        <Select
                          label="Inventory Category"
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
                          label={isTable ? 'Price per Table (GHS)' : isVendor ? 'Rental Price per Space (GHS)' : 'Price (GHS)'}
                          type="number"
                          min="0"
                          step="1"
                          disabled={ticket.type === 'free'}
                          value={ticket.type === 'free' ? 0 : ticket.price}
                          onChange={(e) => updateTicket(ticket.id, { price: e.target.value })}
                          placeholder={isTable ? '1200' : isVendor ? '500' : '50'}
                        />

                        <Input
                          label={isTable ? 'Total Tables Available' : isVendor ? 'Total Booths Available' : 'Quantity Available'}
                          type="number"
                          min="1"
                          required
                          value={ticket.quantity}
                          onChange={(e) => updateTicket(ticket.id, { quantity: e.target.value })}
                          placeholder={isTable ? '10' : isVendor ? '15' : '500'}
                        />

                        {/* Table Reservation Specific Fields */}
                        {isTable && (
                          <>
                            <Input
                              label="Seats / Guests Included per Table"
                              type="number"
                              min="1"
                              max="30"
                              value={ticket.seatsPerTable ?? 6}
                              onChange={(e) => updateTicket(ticket.id, { seatsPerTable: e.target.value })}
                              placeholder="6"
                            />

                            <Input
                              label="Table Zone / Placement"
                              value={ticket.tableLocation || ''}
                              onChange={(e) => updateTicket(ticket.id, { tableLocation: e.target.value })}
                              placeholder="e.g. Stage Front / Golden Circle, VIP Deck, Poolside"
                            />

                            <div className="sm:col-span-2">
                              <Input
                                label="Included Hospitality & Bottle Package"
                                value={ticket.tablePackage || ''}
                                onChange={(e) => updateTicket(ticket.id, { tablePackage: e.target.value })}
                                placeholder="e.g. 1 Champagne bottle + 6 Energy Drinks, Mixers & Gourmet Finger Food Platter"
                              />
                            </div>

                            <Input
                              label="Included Bar Credit / Min Spend (GHS)"
                              type="number"
                              min="0"
                              value={ticket.minSpend ?? 0}
                              onChange={(e) => updateTicket(ticket.id, { minSpend: e.target.value })}
                              placeholder="0 (leave 0 if included in table price)"
                            />

                            <Input
                              label="VIP Parking Passes Included"
                              type="number"
                              min="0"
                              max="10"
                              value={ticket.vipParking ?? 2}
                              onChange={(e) => updateTicket(ticket.id, { vipParking: e.target.value })}
                              placeholder="2"
                            />

                            <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2 pt-1">
                              <label className="flex items-center gap-2 text-xs font-semibold text-ink-700 dark:text-ink-300 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={ticket.dedicatedWaiter ?? true}
                                  onChange={(e) => updateTicket(ticket.id, { dedicatedWaiter: e.target.checked })}
                                  className="rounded border-ink-300 text-purple-600 focus:ring-purple-500"
                                />
                                <span>Dedicated Waiter / Butler Service</span>
                              </label>

                              <label className="flex items-center gap-2 text-xs font-semibold text-ink-700 dark:text-ink-300 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={ticket.expressEntry ?? true}
                                  onChange={(e) => updateTicket(ticket.id, { expressEntry: e.target.checked })}
                                  className="rounded border-ink-300 text-purple-600 focus:ring-purple-500"
                                />
                                <span>VIP Fast-Track Express Entry Gate</span>
                              </label>
                            </div>
                          </>
                        )}

                        {/* Vendor Space Specific Fields */}
                        {isVendor && (
                          <>
                            <Input
                              label="Space Dimensions & Format"
                              value={ticket.spaceSize || '10x10 ft Canopy Pitch'}
                              onChange={(e) => updateTicket(ticket.id, { spaceSize: e.target.value })}
                              placeholder="e.g. 10x10 ft Canopy, 10x20 ft Double Booth, 6x3 ft Tabletop"
                            />

                            <Input
                              label="Permitted Vendor Category"
                              value={ticket.vendorCategory || 'Food & Beverages, Crafts or Retail'}
                              onChange={(e) => updateTicket(ticket.id, { vendorCategory: e.target.value })}
                              placeholder="e.g. Cooked Food, Grills, Fashion & Apparel, Tech"
                            />

                            <Input
                              label="Staff Badges / Passes Included"
                              type="number"
                              min="1"
                              max="12"
                              value={ticket.passesIncluded ?? 2}
                              onChange={(e) => updateTicket(ticket.id, { passesIncluded: e.target.value })}
                              placeholder="2"
                            />

                            <Input
                              label="Tables & Chairs Provided"
                              value={ticket.tablesChairsIncluded || '1 Table + 2 Chairs'}
                              onChange={(e) => updateTicket(ticket.id, { tablesChairsIncluded: e.target.value })}
                              placeholder="e.g. 1 Table + 2 Chairs, or Bring Own Stand"
                            />

                            <Input
                              label="Setup Hours Access"
                              value={ticket.setupHours || 'Setup: 8:00 AM – 11:30 AM'}
                              onChange={(e) => updateTicket(ticket.id, { setupHours: e.target.value })}
                              placeholder="e.g. Setup: 8:00 AM – 11:30 AM"
                            />

                            <Input
                              label="Teardown Hours Access"
                              value={ticket.teardownHours || 'Teardown: 11:00 PM – 1:30 AM'}
                              onChange={(e) => updateTicket(ticket.id, { teardownHours: e.target.value })}
                              placeholder="e.g. Teardown: 11:00 PM – 1:30 AM"
                            />

                            <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2 pt-1">
                              <label className="flex items-center gap-2 text-xs font-semibold text-ink-700 dark:text-ink-300 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={ticket.powerIncluded ?? true}
                                  onChange={(e) => updateTicket(ticket.id, { powerIncluded: e.target.checked })}
                                  className="rounded border-ink-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span>220V Electricity Outlet Included</span>
                              </label>

                              <label className="flex items-center gap-2 text-xs font-semibold text-ink-700 dark:text-ink-300 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={ticket.waterIncluded ?? false}
                                  onChange={(e) => updateTicket(ticket.id, { waterIncluded: e.target.checked })}
                                  className="rounded border-ink-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span>Running Water Access Point</span>
                              </label>

                              <label className="flex items-center gap-2 text-xs font-semibold text-ink-700 dark:text-ink-300 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={ticket.wifiIncluded ?? true}
                                  onChange={(e) => updateTicket(ticket.id, { wifiIncluded: e.target.checked })}
                                  className="rounded border-ink-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span>High-Speed Wi-Fi for POS / MoMo</span>
                              </label>

                              <label className="flex items-center gap-2 text-xs font-semibold text-ink-700 dark:text-ink-300 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={ticket.securityIncluded ?? true}
                                  onChange={(e) => updateTicket(ticket.id, { securityIncluded: e.target.checked })}
                                  className="rounded border-ink-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span>Overnight Security Guarding</span>
                              </label>
                            </div>
                          </>
                        )}

                        <Input
                          label="Max Quantity per Order"
                          type="number"
                          min="1"
                          value={ticket.perOrderLimit ?? (isTable || isVendor ? 2 : 10)}
                          onChange={(e) => updateTicket(ticket.id, { perOrderLimit: e.target.value })}
                        />

                        <Input
                          label={isTable ? 'Table Notes / Perks' : isVendor ? 'Logistics / Setup Guidelines' : 'Perks / Description'}
                          value={ticket.description || ''}
                          onChange={(e) => updateTicket(ticket.id, { description: e.target.value })}
                          placeholder={
                            isTable
                              ? 'e.g. VIP priority parking pass included. Table reserved until 11:30 PM.'
                              : isVendor
                                ? 'e.g. Vehicle unloading permitted between 7am and 9am via Gate B.'
                                : 'e.g. General admission into all concert areas.'
                          }
                        />
                      </div>
                    </div>
                  )
                })}
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
                  { label: 'Ticket types', value: `${tickets.length} tier(s)` },
                  {
                    label: 'Standard Admissions',
                    value: `${ticketStats.admissionsCount.toLocaleString()} passes (GH₵ ${ticketStats.admissionsRev.toLocaleString()})`,
                  },
                  {
                    label: 'Table Reservations',
                    value: `${ticketStats.tablesCount} tables (${ticketStats.tableSeats} seats, GH₵ ${ticketStats.tablesRev.toLocaleString()})`,
                  },
                  {
                    label: 'Vendor Exhibition Spaces',
                    value: `${ticketStats.vendorsCount} booths (GH₵ ${ticketStats.vendorsRev.toLocaleString()})`,
                  },
                  {
                    label: 'Total Capacity',
                    value: `${ticketStats.totalCapacity.toLocaleString()} attendees & seated guests`,
                  },
                  {
                    label: 'Projected Gross Inventory Value',
                    value: `GH₵ ${ticketStats.totalGrossRevenue.toLocaleString()}`,
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
                  Publishing makes the listing visible immediately on the Eventspady website and opens ticket, table, and vendor sales. You can edit the
                  description, images, and schedule at any time.
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
