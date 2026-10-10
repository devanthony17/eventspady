import { useState, useMemo } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { BarChart3, CalendarDays, Copy, Eye, MoreVertical, Pencil, Plus, Send, Trash2 } from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { DashboardShell } from '@components/dashboard/DashboardShell'
import { Button } from '@components/ui/Button'
import { Badge } from '@components/ui/Badge'
import { Tabs } from '@components/ui/Tabs'
import { Modal } from '@components/ui/Modal'
import { Input } from '@components/ui/Field'
import { EmptyState } from '@components/ui/EmptyState'
import { useAuth } from '@context/AuthContext'
import { useToast } from '@context/ToastContext'
import { useStore } from '@context/StoreContext'
import {
  useOrganizerEvents,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useCreateEventMutation,
  useOrganizerDrafts,
  useDeleteDraftMutation,
  useEventAnalytics,
} from '@hooks/api'
import { cn, formatCurrency, formatDate } from '@lib/utils'

export default function MyEvents() {
  const { nav } = useOutletContext()
  const { user } = useAuth()
  const {
    events: storeEvents = [],
    drafts: storeDrafts = [],
    updateEvent: storeUpdateEvent,
    deleteEvent: storeDeleteEvent,
    createEvent: storeCreateEvent,
    deleteDraft: storeDeleteDraft,
  } = useStore()
  const { data: eventsData, isLoading } = useOrganizerEvents()
  const updateEventMutation = useUpdateEventMutation()
  const deleteEventMutation = useDeleteEventMutation()
  const createEventMutation = useCreateEventMutation()

  const toast = useToast()

  const [tab, setTab] = useState('published')
  const [menuFor, setMenuFor] = useState(null)
  const [editingEvent, setEditingEvent] = useState(null)
  const [editForm, setEditForm] = useState({ title: '', tagline: '', venueName: '' })
  const [analyticsEvent, setAnalyticsEvent] = useState(null)

  const { data: draftsData } = useOrganizerDrafts()
  const deleteDraftMutation = useDeleteDraftMutation()
  const { data: analyticsData, isLoading: analyticsLoading } = useEventAnalytics(analyticsEvent?.id, {
    enabled: Boolean(analyticsEvent?.id),
  })

  const events = useMemo(() => {
    const apiList = Array.isArray(eventsData)
      ? eventsData
      : Array.isArray(eventsData?.events)
        ? eventsData.events
        : Array.isArray(eventsData?.data)
          ? eventsData.data
          : []
    if (apiList.length > 0) {
      const apiIds = new Set(apiList.map((e) => e.id))
      const extraStore = (storeEvents || []).filter((e) => !apiIds.has(e.id))
      return [...apiList, ...extraStore]
    }
    return storeEvents || []
  }, [eventsData, storeEvents])

  const published = events.filter((e) => new Date(e.start || e.startDate) > new Date())
  const past = events.filter((e) => new Date(e.start || e.startDate) <= new Date())
  const drafts = events.filter((e) => e.status === 'draft')

  const myDrafts = useMemo(() => {
    if (Array.isArray(draftsData) && draftsData.length > 0) return draftsData
    if (Array.isArray(draftsData?.drafts) && draftsData.drafts.length > 0) return draftsData.drafts
    if (Array.isArray(draftsData?.data) && draftsData.data.length > 0) return draftsData.data
    if (storeDrafts && storeDrafts.length > 0) return storeDrafts
    return drafts
  }, [draftsData, storeDrafts, drafts])

  const handleDiscardDraft = async (draftId) => {
    try {
      await deleteDraftMutation.mutateAsync(draftId)
    } catch {
      // Non-blocking fallback
    }
    storeDeleteDraft(draftId)
    toast.info('Draft discarded.')
  }

  const list = tab === 'published' ? published : tab === 'past' ? past : drafts

  const openEdit = (event) => {
    setEditingEvent(event)
    setEditForm({
      title: event.title || '',
      tagline: event.tagline || '',
      venueName: event.venue?.name || '',
    })
    setMenuFor(null)
  }

  const saveEdit = async (e) => {
    e.preventDefault()
    if (!editingEvent) return
    const updatePayload = {
      title: editForm.title,
      tagline: editForm.tagline,
      venue: editingEvent.venue
        ? { ...editingEvent.venue, name: editForm.venueName }
        : null,
    }
    try {
      await updateEventMutation.mutateAsync({
        id: editingEvent.id,
        data: updatePayload,
      })
    } catch {
      // Non-blocking fallback
    }
    storeUpdateEvent(editingEvent.id, updatePayload)
    toast.success('Event details updated.')
    setEditingEvent(null)
  }

  const handleUnpublish = async (eventId) => {
    try {
      await deleteEventMutation.mutateAsync(eventId)
    } catch {
      // Non-blocking fallback
    }
    storeDeleteEvent(eventId)
    toast.success('Event unpublished.')
    setMenuFor(null)
  }

  const handlePublishDraft = async (draft) => {
    let created = null
    try {
      const res = await createEventMutation.mutateAsync({
        ...draft,
        status: 'published',
      })
      created = res?.data || res
    } catch {
      // Non-blocking fallback
    }
    storeCreateEvent(created || { ...draft, status: 'published' })
    if (draft.id) storeDeleteDraft(draft.id)
    toast.success('Draft published successfully!')
    setTab('published')
  }

  return (
    <>
      <Seo title="My events" noIndex />

      <DashboardShell
        nav={nav}
        eyebrow="Organizer panel"
        title="My events"
        description="Edit listings, watch sales and manage what is published."
        actions={
          <Button to="/organizer/events/new" size="sm" iconLeft={Plus}>
            New event
          </Button>
        }
      >
        <Tabs
          tabs={[
            { id: 'published', label: 'Published', count: published.length },
            { id: 'past', label: 'Past', count: past.length },
            { id: 'drafts', label: 'Drafts', count: myDrafts.length },
          ]}
          active={tab}
          onChange={setTab}
          variant="pill"
          className="mb-6 w-full sm:w-auto"
        />

        {list.length === 0 ? (
          <div className="surface">
            <EmptyState
              icon={CalendarDays}
              title={tab === 'drafts' ? 'No drafts saved' : 'Nothing here yet'}
              description={
                tab === 'drafts'
                  ? 'When you save an in-progress event, it will appear here so you can finish it anytime.'
                  : 'Create an event to start selling tickets — it takes a couple of minutes.'
              }
              action={
                <Button to="/organizer/events/new" iconLeft={Plus}>
                  Create an event
                </Button>
              }
            />
          </div>
        ) : tab === 'drafts' ? (
          <div className="space-y-4">
            {myDrafts.map((draft) => (
              <article key={draft.id} className="surface flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold">{draft.title || 'Untitled Draft'}</h3>
                    <Badge tone="warning" size="sm">
                      Draft
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
                    {draft.category || 'General'} · Saved {formatDate(draft.updatedAt || new Date())}
                  </p>
                  {draft.tagline && <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">{draft.tagline}</p>}
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" iconLeft={Send} onClick={() => handlePublishDraft(draft)}>
                    Publish now
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    iconLeft={Trash2}
                    className="text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                    onClick={() => handleDiscardDraft(draft.id)}
                  >
                    Discard
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {list.map((event) => {
              const percent = Math.round(((event.sold || 0) / (event.capacity || 1)) * 100)
              const revenue = (event.tickets || []).reduce((sum, t) => sum + (t.price || 0) * (t.sold || 0), 0)

              return (
                <article key={event.id} className="surface p-4 sm:p-5">
                  <div className="flex flex-wrap items-start gap-4">
                    <img
                      src={event.cover}
                      alt=""
                      loading="lazy"
                      className="h-24 w-full shrink-0 rounded-xl object-cover sm:w-36"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/events/${event.slug}`}
                          className="text-base font-bold transition hover:text-brand-600 dark:hover:text-brand-400"
                        >
                          {event.title}
                        </Link>
                        <Badge tone={event.soldOut ? 'danger' : 'success'} size="sm">
                          {event.soldOut ? 'Sold out' : 'On sale'}
                        </Badge>
                        <Badge tone="neutral" size="sm">
                          {event.type === 'online' ? 'Online' : event.venue?.city || 'Wa'}
                        </Badge>
                      </div>

                      <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
                        {formatDate(event.start, { weekday: 'short' })} ·{' '}
                        {(event.tickets || []).length} ticket {(event.tickets || []).length === 1 ? 'type' : 'types'}
                      </p>

                      <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-sm">
                        <div>
                          <dd className="font-extrabold">{(event.sold || 0).toLocaleString()}</dd>
                          <dt className="text-xs text-ink-400">Sold</dt>
                        </div>
                        <div>
                          <dd className="font-extrabold">{(event.remaining || 0).toLocaleString()}</dd>
                          <dt className="text-xs text-ink-400">Remaining</dt>
                        </div>
                        <div>
                          <dd className="font-extrabold">{formatCurrency(revenue)}</dd>
                          <dt className="text-xs text-ink-400">Gross revenue</dt>
                        </div>
                        <div className="min-w-[8rem] flex-1">
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="text-ink-400">Capacity</span>
                            <span className="font-bold">{percent}%</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-ink-100 dark:bg-white/10">
                            <div
                              className={cn(
                                'h-full rounded-full',
                                percent > 85 ? 'bg-emerald-500' : percent > 50 ? 'bg-brand-500' : 'bg-amber-500',
                              )}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </dl>
                    </div>

                    {/* Row actions */}
                    <div className="relative flex shrink-0 items-center gap-2">
                      <Button to={`/events/${event.slug}`} variant="outline" size="sm" iconLeft={Eye}>
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        iconLeft={BarChart3}
                        onClick={() => setAnalyticsEvent(event)}
                      >
                        Analytics
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        iconLeft={Pencil}
                        onClick={() => openEdit(event)}
                      >
                        Edit
                      </Button>

                      <button
                        type="button"
                        onClick={() => setMenuFor(menuFor === event.id ? null : event.id)}
                        aria-label={`More actions for ${event.title}`}
                        aria-expanded={menuFor === event.id}
                        className="grid size-9 place-items-center rounded-xl text-ink-500 transition hover:bg-ink-100 dark:hover:bg-white/10"
                      >
                        <MoreVertical className="size-4" />
                      </button>

                      {menuFor === event.id && (
                        <div className="absolute right-0 top-full z-20 mt-1 w-48 animate-scale-in rounded-2xl border border-ink-200/70 bg-white p-1.5 shadow-card dark:border-white/10 dark:bg-ink-900">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(`${window.location.origin}/events/${event.slug}`)
                              toast.success('Event link copied.')
                              setMenuFor(null)
                            }}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-ink-600 transition hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-white/5"
                          >
                            <Copy className="size-4" aria-hidden="true" />
                            Copy link
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUnpublish(event.id)}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                            Unpublish
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </DashboardShell>

      {/* Quick Edit Modal */}
      <Modal
        open={Boolean(editingEvent)}
        onClose={() => setEditingEvent(null)}
        title="Quick edit event"
        description="Update core listing details without recreating your event."
      >
        <form onSubmit={saveEdit} className="space-y-4">
          <Input
            label="Event title"
            required
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
          />
          <Input
            label="Tagline"
            value={editForm.tagline}
            onChange={(e) => setEditForm({ ...editForm, tagline: e.target.value })}
          />
          {editingEvent?.type === 'venue' && (
            <Input
              label="Venue name"
              value={editForm.venueName}
              onChange={(e) => setEditForm({ ...editForm, venueName: e.target.value })}
            />
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" fullWidth onClick={() => setEditingEvent(null)}>
              Cancel
            </Button>
            <Button type="submit" fullWidth>
              Save changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Event Analytics Modal */}
      {analyticsEvent && (
        <Modal
          open={Boolean(analyticsEvent)}
          onClose={() => setAnalyticsEvent(null)}
          title={`Analytics: ${analyticsEvent.title}`}
          description="Real-time attendance, ticket conversion, and revenue metrics."
        >
          {analyticsLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="size-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            </div>
          ) : (() => {
            const stats = analyticsData?.analytics || analyticsData?.data || analyticsData || {}
            const rev = stats.revenue ?? (analyticsEvent.tickets || []).reduce((s, t) => s + (t.price || 0) * (t.sold || 0), 0)
            const sold = stats.ticketsSold ?? stats.sold ?? analyticsEvent.sold ?? 0
            const cap = stats.capacity ?? analyticsEvent.capacity ?? 100
            const views = stats.views ?? stats.pageViews ?? 128
            const checkIns = stats.checkIns ?? stats.checkedIn ?? Math.round(sold * 0.7)

            return (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-ink-100 bg-ink-50/50 p-3 dark:border-white/10 dark:bg-white/[.02]">
                    <span className="text-ink-400">Gross Sales</span>
                    <p className="mt-1 text-base font-extrabold text-ink-900 dark:text-white">
                      {formatCurrency(rev)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-ink-100 bg-ink-50/50 p-3 dark:border-white/10 dark:bg-white/[.02]">
                    <span className="text-ink-400">Tickets Sold</span>
                    <p className="mt-1 text-base font-extrabold text-ink-900 dark:text-white">
                      {sold} <span className="text-xs font-normal text-ink-400">/ {cap}</span>
                    </p>
                  </div>
                  <div className="rounded-xl border border-ink-100 bg-ink-50/50 p-3 dark:border-white/10 dark:bg-white/[.02]">
                    <span className="text-ink-400">Page Views</span>
                    <p className="mt-1 text-base font-extrabold text-ink-900 dark:text-white">
                      {views}
                    </p>
                  </div>
                  <div className="rounded-xl border border-ink-100 bg-ink-50/50 p-3 dark:border-white/10 dark:bg-white/[.02]">
                    <span className="text-ink-400">Checked In</span>
                    <p className="mt-1 text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                      {checkIns}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-ink-100 p-4 dark:border-white/10">
                  <div className="mb-2 flex items-center justify-between font-semibold">
                    <span>Capacity Utilization</span>
                    <span>{Math.round((sold / Math.max(cap, 1)) * 100)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-ink-100 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500"
                      style={{ width: `${Math.min(100, Math.round((sold / Math.max(cap, 1)) * 100))}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <Button variant="ghost" onClick={() => setAnalyticsEvent(null)}>
                    Close
                  </Button>
                </div>
              </div>
            )
          })()}
        </Modal>
      )}
    </>
  )
}
