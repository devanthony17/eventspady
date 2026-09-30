import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { events as seedEvents } from '@data/events'
import { coupons as seedCoupons } from '@data/coupons'
import { getCategory } from '@data/categories'
import { getOrganizer, organizers as baseOrganizers } from '@data/organizers'
import { testimonials as seedTestimonials } from '@data/testimonials'
import { posts as seedPosts } from '@data/blog'
import { generateOrderId, getEventCoordinates } from '@lib/utils'

const STORAGE_KEY = 'eventspady:store_v3'
const StoreContext = createContext(null)

function enrichEvent(event) {
  const coords = getEventCoordinates(event)
  const venue = event.venue
    ? {
        ...event.venue,
        lat: Number.isFinite(Number(event.venue.lat)) ? Number(event.venue.lat) : coords?.lat,
        lng: Number.isFinite(Number(event.venue.lng)) ? Number(event.venue.lng) : coords?.lng,
      }
    : null
  const tickets = (event.tickets || []).map((t) => ({
    currency: 'GHS',
    perOrderLimit: 10,
    sold: 0,
    ...t,
    remaining: Math.max(0, (t.quantity || 0) - (t.sold ?? 0)),
  }))

  const now = Date.now()
  const purchasable = tickets.filter((t) => t.remaining > 0 && (!t.salesEnd || new Date(t.salesEnd).getTime() > now))
  const prices = (purchasable.length > 0 ? purchasable : tickets).map((t) => Number(t.price) || 0)

  const capacity = tickets.reduce((sum, t) => sum + (Number(t.quantity) || 0), 0)
  const sold = tickets.reduce((sum, t) => sum + (Number(t.sold) || 0), 0)

  return {
    currency: 'GHS',
    gallery: [],
    tags: [],
    featured: false,
    trending: false,
    ageLimit: 'All ages',
    ...event,
    venue,
    tickets,
    capacity,
    sold,
    priceFrom: prices.length ? Math.min(...prices) : 0,
    priceTo: prices.length ? Math.max(...prices) : 0,
    isFree: prices.every((p) => p === 0),
    isSoldOut: capacity > 0 && sold >= capacity,
    category: getCategory(event.category),
    organizer: getOrganizer(event.organizerId) || {
      id: event.organizerId || 'eventspady',
      name: 'Eventspady Verified Organizer',
      logo: '/images/organizers/organizer-1.svg',
      verified: true,
      rating: 4.8,
      reviews: 120,
    },
  }
}

const DEFAULT_CMS = {
  hero: {
    badgeText: 'Discover the Upper West Region',
    titleLine1: 'The heartbeat of live events',
    titleLine2: 'across the Upper West',
    gradientText: 'Upper West',
    description:
      'Tickets for Dumba festival, sports championships, tech summits and sound clashes in Wa, Jirapa, Nandom and beyond. Real-time Mobile Money checkout, zero booking fees.',
    ctaPrimaryText: 'Explore events',
    ctaPrimaryLink: '/events',
    ctaSecondaryText: 'List your event',
    ctaSecondaryLink: '/organizer',
  },
  spotlight: {
    eventSlug: 'miss-dumba',
    customBadge: 'Spotlight event',
    customTitle: '',
    customTagline: '',
  },
  testimonials: seedTestimonials,
  blogPosts: seedPosts,
}

const seedOrganizersList = [
  ...baseOrganizers.map((o) => ({
    ...o,
    status: o.verified ? 'verified' : 'pending',
    email: `${o.id}@eventspady.com`,
    phone: '+233 24 000 1122',
    contactPerson: `${o.name.split(' ')[0]} Lead`,
    appliedAt: '2024-01-15T09:00:00.000Z',
    commissionRate: 7.5,
  })),
  {
    id: 'savannah-sound-clash',
    name: 'Savannah Sound Arena',
    logo: '/images/organizers/organizer-2.svg',
    verified: false,
    status: 'pending',
    email: 'info@savannahsound.gh',
    phone: '+233 50 112 3344',
    contactPerson: 'Kofi Mensah',
    appliedAt: '2024-03-01T10:30:00.000Z',
    commissionRate: 8.0,
    rating: 0,
    reviews: 0,
    events: 0,
    followers: 0,
    since: 2024,
    location: 'Wa, Upper West Region',
    bio: 'Premier sound-system and live band battle promoters in Wa Municipal.',
  },
  {
    id: 'wa-foodies-guild',
    name: 'Wa Foodies Guild',
    logo: '/images/organizers/organizer-4.svg',
    verified: false,
    status: 'pending',
    email: 'contact@wa-foodies.org',
    phone: '+233 20 445 6677',
    contactPerson: 'Fatima Adams',
    appliedAt: '2024-03-10T14:15:00.000Z',
    commissionRate: 7.5,
    rating: 0,
    reviews: 0,
    events: 0,
    followers: 0,
    since: 2024,
    location: 'Wa, Upper West Region',
    bio: 'Regional network of caterers, street food artists and indigenous culinary innovators.',
  },
]

const defaultGateViolations = {}

function getInitialData() {
  if (typeof window === 'undefined') {
    return {
      events: seedEvents.map(enrichEvent),
      orders: [],
      coupons: seedCoupons,
      transactions: [],
      drafts: [],
      comps: [],
      organizers: seedOrganizersList,
      cms: DEFAULT_CMS,
      gateViolations: {},
    }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        events: parsed.customEvents?.length
          ? [...seedEvents.map(enrichEvent), ...parsed.customEvents.map(enrichEvent)]
          : seedEvents.map(enrichEvent),
        orders: parsed.orders || [],
        coupons: parsed.coupons || seedCoupons,
        transactions: parsed.transactions || [],
        drafts: parsed.drafts || [],
        comps: parsed.comps || [],
        organizers: parsed.organizers?.length ? parsed.organizers : seedOrganizersList,
        cms: {
          ...DEFAULT_CMS,
          ...(parsed.cms || {}),
          testimonials: seedTestimonials,
          blogPosts: seedPosts,
        },
        gateViolations: parsed.gateViolations || {},
      }
    }
  } catch (e) {
    console.error('Failed to parse eventspady store:', e)
  }
  return {
    events: seedEvents.map(enrichEvent),
    orders: [],
    coupons: seedCoupons,
    transactions: [],
    drafts: [],
    comps: [],
    organizers: seedOrganizersList,
    cms: DEFAULT_CMS,
    gateViolations: {},
  }
}

export function StoreProvider({ children }) {
  const initial = useMemo(() => getInitialData(), [])
  const [hydrated, setHydrated] = useState(true)
  const [events, setEvents] = useState(initial.events)
  const [orders, setOrders] = useState(initial.orders)
  const [coupons, setCoupons] = useState(initial.coupons)
  const [transactions, setTransactions] = useState(initial.transactions)
  const [drafts, setDrafts] = useState(initial.drafts)
  const [comps, setComps] = useState(initial.comps)
  const [organizers, setOrganizers] = useState(initial.organizers)
  const [cms, setCms] = useState(initial.cms)
  const [gateViolations, setGateViolations] = useState(initial.gateViolations)

  // Persist to local storage
  useEffect(() => {
    if (!hydrated) return
    try {
      const customEvents = events.filter((e) => e.isCustom)
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          customEvents,
          orders,
          coupons,
          transactions,
          drafts,
          comps,
          organizers,
          cms,
          gateViolations,
        }),
      )
    } catch (e) {
      console.error('Failed to persist eventspady store:', e)
    }
  }, [hydrated, events, orders, coupons, transactions, drafts, comps, organizers, cms, gateViolations])

  /* ---------------- Event operations ---------------- */
  const createEvent = useCallback((eventData) => {
    const id = `evt-${Date.now()}`
    const enriched = enrichEvent({
      ...eventData,
      id,
      slug: eventData.slug || `${eventData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      isCustom: true,
      sold: 0,
    })
    setEvents((prev) => [enriched, ...prev])
    return enriched
  }, [])

  const updateEvent = useCallback((id, patch) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e
        return enrichEvent({ ...e, ...patch })
      }),
    )
  }, [])

  const deleteEvent = useCallback((id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }, [])

  /* ---------------- Draft operations ---------------- */
  const saveDraft = useCallback((draft) => {
    const id = draft.id || `draft-${Date.now()}`
    const entry = { ...draft, id, updatedAt: new Date().toISOString() }
    setDrafts((prev) => {
      const idx = prev.findIndex((d) => d.id === id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = entry
        return next
      }
      return [entry, ...prev]
    })
    return entry
  }, [])

  const deleteDraft = useCallback((id) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id))
  }, [])

  /* ---------------- Order operations ---------------- */
  const placeOrder = useCallback(
    (orderInput) => {
      const orderId = generateOrderId()
      const placedAt = new Date().toISOString()
      const newOrder = {
        id: orderId,
        placedAt,
        status: 'confirmed',
        ...orderInput,
      }

      setOrders((prev) => [newOrder, ...prev])

      // Decrement ticket quantities
      if (orderInput.eventId && orderInput.items) {
        setEvents((prev) =>
          prev.map((event) => {
            if (event.id !== orderInput.eventId) return event
            const updatedTickets = (event.tickets || []).map((ticket) => {
              const bought = orderInput.items.find((it) => it.ticketId === ticket.id)
              if (!bought) return ticket
              const sold = (ticket.sold || 0) + bought.quantity
              const remaining = Math.max(0, (ticket.quantity || 0) - sold)
              return { ...ticket, sold, remaining }
            })
            const totalSold = updatedTickets.reduce((sum, t) => sum + (t.sold || 0), 0)
            return enrichEvent({
              ...event,
              tickets: updatedTickets,
              sold: totalSold,
            })
          }),
        )
      }

      // Record wallet transaction if paid via wallet
      if (orderInput.method === 'wallet') {
        const tx = {
          id: `tx-${Date.now()}`,
          date: placedAt,
          type: 'purchase',
          label: `Tickets for ${orderInput.eventTitle || 'Event'}`,
          reference: orderId,
          amount: -orderInput.total,
          status: 'completed',
        }
        setTransactions((prev) => [tx, ...prev])
      }

      return newOrder
    },
    [],
  )

  const topUpWallet = useCallback((amount, method = 'momo') => {
    const tx = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString(),
      type: 'topup',
      label: `Top up via ${method.toUpperCase()}`,
      reference: `TOP-${Date.now().toString().slice(-6)}`,
      amount: Number(amount),
      status: 'completed',
    }
    setTransactions((prev) => [tx, ...prev])
    return tx
  }, [])

  /* ---------------- Coupons operations ---------------- */
  const createCoupon = useCallback((couponData) => {
    const id = `cpn-${Date.now()}`
    const newCoupon = {
      id,
      usedCount: 0,
      createdAt: new Date().toISOString(),
      ...couponData,
      code: couponData.code.trim().toUpperCase(),
    }
    setCoupons((prev) => [newCoupon, ...prev])
    return newCoupon
  }, [])

  const validateCoupon = useCallback(
    (code, eventId, total) => {
      const clean = String(code).trim().toUpperCase()
      const found = coupons.find((c) => c.code.toUpperCase() === clean)
      if (!found) {
        return { valid: false, message: 'Coupon code not found.' }
      }
      if (found.eventId && found.eventId !== eventId) {
        return { valid: false, message: 'This coupon is not valid for this event.' }
      }
      if (found.expiresAt && new Date(found.expiresAt) < new Date()) {
        return { valid: false, message: 'This coupon has expired.' }
      }
      if (found.maxUses && (found.usedCount || 0) >= found.maxUses) {
        return { valid: false, message: 'This coupon has reached its usage limit.' }
      }

      let discount = 0
      if (found.type === 'percent') {
        discount = (total * (found.discount || 0)) / 100
      } else {
        discount = Number(found.discount || 0)
      }
      discount = Math.min(total, discount)

      return {
        valid: true,
        coupon: found,
        discount,
        message: `${found.discount}${found.type === 'percent' ? '%' : ' GHS'} discount applied!`,
      }
    },
    [coupons],
  )

  /* ---------------- Check-in & Comps operations ---------------- */
  const checkInTicket = useCallback(
    (code, eventId) => {
      const trimmed = String(code).trim().toUpperCase()

      // 1. Check in regular orders
      let foundOrder = null
      let foundAttendee = null

      for (const order of orders) {
        if (eventId && order.eventId !== eventId) continue
        const att = (order.attendees || []).find((a) => a.code.toUpperCase() === trimmed)
        if (att) {
          foundOrder = order
          foundAttendee = att
          break
        }
      }

      // 2. Check in comps
      let foundComp = null
      if (!foundAttendee) {
        foundComp = comps.find((c) => c.code.toUpperCase() === trimmed && (!eventId || c.eventId === eventId))
      }

      if (!foundAttendee && !foundComp) {
        return { status: 'invalid', message: 'Ticket not recognized or not valid for this event.' }
      }

      const isChecked = foundAttendee ? foundAttendee.checkedIn : foundComp.checkedIn
      if (isChecked) {
        return {
          status: 'duplicate',
          ticket: foundAttendee || foundComp,
          order: foundOrder,
          message: 'Already checked in.',
        }
      }

      // Mark as checked in
      if (foundAttendee && foundOrder) {
        const isPayAtGate = (foundOrder.method || foundOrder.paymentMethod) === 'offline'
        setOrders((prev) =>
          prev.map((ord) => {
            if (ord.id !== foundOrder.id) return ord
            return {
              ...ord,
              paymentStatus: isPayAtGate ? 'paid' : ord.paymentStatus,
              attendees: ord.attendees.map((a) => (a.code.toUpperCase() === trimmed ? { ...a, checkedIn: true } : a)),
            }
          }),
        )
      } else if (foundComp) {
        setComps((prev) =>
          prev.map((c) => (c.code.toUpperCase() === trimmed ? { ...c, checkedIn: true } : c)),
        )
      }

      return {
        status: 'valid',
        ticket: foundAttendee || foundComp,
        order: foundOrder,
        message: 'Ticket valid — checked in!',
      }
    },
    [orders, comps],
  )

  const toggleCheckIn = useCallback((code) => {
    const trimmed = String(code).trim().toUpperCase()
    setOrders((prev) =>
      prev.map((ord) => {
        const hasAttendee = (ord.attendees || []).some((a) => a.code.toUpperCase() === trimmed)
        if (!hasAttendee) return ord
        const isPayAtGate = (ord.method || ord.paymentMethod) === 'offline'
        const targetAttendee = (ord.attendees || []).find((a) => a.code.toUpperCase() === trimmed)
        const willCheckIn = !targetAttendee?.checkedIn
        return {
          ...ord,
          paymentStatus: isPayAtGate && willCheckIn ? 'paid' : ord.paymentStatus,
          attendees: (ord.attendees || []).map((a) =>
            a.code.toUpperCase() === trimmed ? { ...a, checkedIn: !a.checkedIn } : a,
          ),
        }
      }),
    )
    setComps((prev) =>
      prev.map((c) => (c.code.toUpperCase() === trimmed ? { ...c, checkedIn: !c.checkedIn } : c)),
    )
  }, [])

  const issueComp = useCallback((compData) => {
    const id = `comp-${Date.now()}`
    const code = `CMP-${Date.now().toString().slice(-6).toUpperCase()}`
    const newComp = {
      id,
      code,
      issuedAt: new Date().toISOString(),
      checkedIn: false,
      ...compData,
    }
    setComps((prev) => [newComp, ...prev])
    return newComp
  }, [])

  const transferTicket = useCallback((orderId, ticketCode, recipientName, recipientEmail) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord
        return {
          ...ord,
          attendees: (ord.attendees || []).map((att) => {
            if (att.code !== ticketCode) return att
            return {
              ...att,
              name: recipientName,
              email: recipientEmail,
              transferredAt: new Date().toISOString(),
            }
          }),
        }
      }),
    )
  }, [])

  /* ---------------- Organizer verification & moderation ---------------- */
  const verifyOrganizer = useCallback((organizerId) => {
    setOrganizers((prev) =>
      prev.map((org) => {
        if (org.id !== organizerId) return org
        return {
          ...org,
          verified: true,
          status: 'verified',
          verifiedAt: new Date().toISOString(),
        }
      }),
    )
    setEvents((prev) =>
      prev.map((e) => {
        if (e.organizerId !== organizerId) return e
        return {
          ...e,
          organizer: {
            ...(e.organizer || {}),
            verified: true,
          },
        }
      }),
    )
  }, [])

  const rejectOrganizer = useCallback((organizerId, reason) => {
    setOrganizers((prev) =>
      prev.map((org) => {
        if (org.id !== organizerId) return org
        return {
          ...org,
          verified: false,
          status: 'rejected',
          rejectionReason: reason || 'Application declined by administrator.',
          rejectedAt: new Date().toISOString(),
        }
      }),
    )
  }, [])

  const suspendOrganizer = useCallback((organizerId, reason) => {
    setOrganizers((prev) =>
      prev.map((org) => {
        if (org.id !== organizerId) return org
        return {
          ...org,
          verified: false,
          status: 'suspended',
          suspensionReason: reason || 'Account suspended for policy violation.',
          suspendedAt: new Date().toISOString(),
        }
      }),
    )
  }, [])

  const isOrganizerVerified = useCallback(
    (organizerId) => {
      const org = organizers.find((o) => o.id === organizerId)
      return org ? Boolean(org.verified && org.status === 'verified') : false
    },
    [organizers],
  )

  /* ---------------- CMS management operations ---------------- */
  const updateHeroCms = useCallback((patch) => {
    setCms((prev) => ({
      ...prev,
      hero: { ...prev.hero, ...patch },
    }))
  }, [])

  const updateSpotlightCms = useCallback((patch) => {
    setCms((prev) => ({
      ...prev,
      spotlight: { ...prev.spotlight, ...patch },
    }))
  }, [])

  const addTestimonial = useCallback((item) => {
    const newTestimonial = {
      id: `t-${Date.now()}`,
      rating: 5,
      ...item,
    }
    setCms((prev) => ({
      ...prev,
      testimonials: [newTestimonial, ...prev.testimonials],
    }))
    return newTestimonial
  }, [])

  const updateTestimonial = useCallback((id, patch) => {
    setCms((prev) => ({
      ...prev,
      testimonials: prev.testimonials.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }))
  }, [])

  const deleteTestimonial = useCallback((id) => {
    setCms((prev) => ({
      ...prev,
      testimonials: prev.testimonials.filter((t) => t.id !== id),
    }))
  }, [])

  const addBlogPost = useCallback((post) => {
    const newPost = {
      id: `post-${Date.now()}`,
      slug: post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      publishedAt: new Date().toISOString(),
      featured: false,
      ...post,
    }
    setCms((prev) => ({ ...prev, blogPosts: [newPost, ...prev.blogPosts] }))
    return newPost
  }, [])

  const updateBlogPost = useCallback((id, patch) => {
    setCms((prev) => ({
      ...prev,
      blogPosts: prev.blogPosts.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }))
  }, [])

  const deleteBlogPost = useCallback((id) => {
    setCms((prev) => ({
      ...prev,
      blogPosts: prev.blogPosts.filter((p) => p.id !== id),
    }))
  }, [])

  const resetCmsToDefaults = useCallback(() => {
    setCms(DEFAULT_CMS)
  }, [])

  /* ---------------- Pay at the Gate Violation & Barring System ---------------- */
  const getGateStatus = useCallback(
    (email) => {
      if (!email) return { strikes: 0, barred: false, violations: [] }
      const cleanEmail = email.trim().toLowerCase()
      const record = gateViolations[cleanEmail]
      if (!record) return { strikes: 0, barred: false, violations: [] }
      return {
        strikes: record.strikes || 0,
        barred: Boolean(record.barred || record.strikes >= 2),
        violations: record.violations || [],
        name: record.name,
        email: cleanEmail,
      }
    },
    [gateViolations],
  )

  const recordGateViolation = useCallback((email, details = {}) => {
    if (!email) return null
    const cleanEmail = email.trim().toLowerCase()
    const now = new Date().toISOString()

    setGateViolations((prev) => {
      const existing = prev[cleanEmail] || {
        email: cleanEmail,
        name: details.name || cleanEmail.split('@')[0],
        strikes: 0,
        barred: false,
        violations: [],
      }

      const nextStrikes = existing.strikes + 1
      const isNowBarred = nextStrikes >= 2
      const newViolation = {
        id: `viol-${Date.now()}`,
        date: now,
        eventId: details.eventId || '',
        eventTitle: details.eventTitle || 'Unattended Reserved Event',
        orderId: details.orderId || '',
        reportedBy: details.reportedBy || 'Organizer / Door Staff',
        notes:
          details.notes ||
          (nextStrikes === 1
            ? 'First violation: Failed to turn up and settle Pay at the Gate reservation (Warning issued)'
            : 'Second violation: Second no-show on record — permanently barred from Pay at the Gate feature'),
      }

      return {
        ...prev,
        [cleanEmail]: {
          ...existing,
          strikes: nextStrikes,
          barred: isNowBarred,
          violations: [newViolation, ...existing.violations],
          lastViolationAt: now,
        },
      }
    })

    return cleanEmail
  }, [])

  const pardonGateViolation = useCallback((email) => {
    if (!email) return
    const cleanEmail = email.trim().toLowerCase()
    setGateViolations((prev) => {
      const next = { ...prev }
      if (next[cleanEmail]) {
        next[cleanEmail] = {
          ...next[cleanEmail],
          strikes: 0,
          barred: false,
          violations: [],
          pardonedAt: new Date().toISOString(),
        }
      }
      return next
    })
  }, [])

  const isBarredFromGate = useCallback(
    (email) => {
      if (!email) return false
      const status = getGateStatus(email)
      return status.barred || status.strikes >= 2
    },
    [getGateStatus],
  )

  const isFlaggedForGate = useCallback(
    (email) => {
      if (!email) return false
      const status = getGateStatus(email)
      return status.strikes === 1
    },
    [getGateStatus],
  )

  /* ---------------- Convenience selectors ---------------- */
  const getEventById = useCallback((id) => events.find((e) => e.id === id), [events])
  const getEventBySlug = useCallback((slug) => events.find((e) => e.slug === slug), [events])
  const getEventsByOrganizer = useCallback(
    (organizerId) => events.filter((e) => e.organizerId === organizerId),
    [events],
  )
  const getOrdersByOrganizer = useCallback(
    (organizerId) => {
      const orgEvents = new Set(events.filter((e) => e.organizerId === organizerId).map((e) => e.id))
      return orders.filter((o) => orgEvents.has(o.eventId))
    },
    [events, orders],
  )
  const getGuestsByEvent = useCallback(
    (eventId) => {
      const eventOrders = orders.filter((o) => o.eventId === eventId)
      const guests = []
      eventOrders.forEach((order) => {
        (order.attendees || []).forEach((att) => {
          guests.push({
            ...att,
            orderId: order.id,
            placedAt: order.placedAt,
            method: order.method || order.paymentMethod,
            buyerEmail: order.buyer?.email || order.buyerEmail || '',
            paymentStatus: order.paymentStatus || 'paid',
          })
        })
      })
      const eventComps = comps.filter((c) => c.eventId === eventId)
      eventComps.forEach((comp) => {
        guests.push({
          code: comp.code,
          name: comp.recipientName,
          email: comp.recipientEmail,
          ticketName: comp.ticketName || 'Complimentary VIP',
          checkedIn: comp.checkedIn,
          isComp: true,
          orderId: comp.id,
          placedAt: comp.issuedAt,
        })
      })
      return guests
    },
    [orders, comps],
  )

  const resetStore = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem('eventspady:store_v2')
    localStorage.removeItem('eventspady:store_v1')
    setEvents(seedEvents.map(enrichEvent))
    setOrders([])
    setCoupons(seedCoupons)
    setTransactions([])
    setDrafts([])
    setComps([])
    setOrganizers(seedOrganizersList)
    setCms(DEFAULT_CMS)
    setGateViolations({})
  }, [])

  const value = useMemo(
    () => ({
      events,
      orders,
      coupons,
      transactions,
      drafts,
      comps,
      organizers,
      cms,
      createEvent,
      updateEvent,
      deleteEvent,
      saveDraft,
      deleteDraft,
      placeOrder,
      topUpWallet,
      createCoupon,
      validateCoupon,
      checkInTicket,
      toggleCheckIn,
      issueComp,
      transferTicket,
      resetStore,
      getEventById,
      getEventBySlug,
      getEventsByOrganizer,
      getOrdersByOrganizer,
      getGuestsByEvent,
      verifyOrganizer,
      rejectOrganizer,
      suspendOrganizer,
      isOrganizerVerified,
      updateHeroCms,
      updateSpotlightCms,
      addTestimonial,
      updateTestimonial,
      deleteTestimonial,
      addBlogPost,
      updateBlogPost,
      gateViolations,
      getGateStatus,
      recordGateViolation,
      pardonGateViolation,
      isBarredFromGate,
      isFlaggedForGate,
      deleteBlogPost,
      resetCmsToDefaults,
    }),
    [
      events,
      orders,
      coupons,
      transactions,
      drafts,
      comps,
      organizers,
      cms,
      gateViolations,
      createEvent,
      updateEvent,
      deleteEvent,
      saveDraft,
      deleteDraft,
      placeOrder,
      topUpWallet,
      createCoupon,
      validateCoupon,
      checkInTicket,
      toggleCheckIn,
      issueComp,
      transferTicket,
      resetStore,
      getEventById,
      getEventBySlug,
      getEventsByOrganizer,
      getOrdersByOrganizer,
      getGuestsByEvent,
      getGateStatus,
      recordGateViolation,
      pardonGateViolation,
      isBarredFromGate,
      isFlaggedForGate,
      verifyOrganizer,
      rejectOrganizer,
      suspendOrganizer,
      isOrganizerVerified,
      updateHeroCms,
      updateSpotlightCms,
      addTestimonial,
      updateTestimonial,
      deleteTestimonial,
      addBlogPost,
      updateBlogPost,
      deleteBlogPost,
      resetCmsToDefaults,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within <StoreProvider>')
  return ctx
}
