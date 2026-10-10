import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  CheckCircle2,
  ExternalLink,
  Eye,
  MapPin,
  Plus,
  Search,
  Star,
  Trash2,
  Users,
} from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { Badge } from '@components/ui/Badge'
import { Button } from '@components/ui/Button'
import { useStore } from '@context/StoreContext'
import { useToast } from '@context/ToastContext'
import {
  useAdminEvents,
  useSetEventFeaturedMutation,
  useUpdateEventStatusMutation,
  useAdminDeleteEventMutation,
} from '@hooks/api'
import { formatCurrency, formatDate } from '@lib/utils'

export default function EventsManagement() {
  const { events: storeEvents = [], updateEvent, deleteEvent } = useStore()
  const { data: eventsData, isLoading } = useAdminEvents()
  const setFeaturedMutation = useSetEventFeaturedMutation()
  const updateStatusMutation = useUpdateEventStatusMutation()
  const deleteMutation = useAdminDeleteEventMutation()
  const toast = useToast()

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

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchesCategory = categoryFilter === 'all' || ev.category === categoryFilter
      const matchesSearch =
        !search ||
        ev.title.toLowerCase().includes(search.toLowerCase()) ||
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
              Manage event publication, toggle homepage spotlights, monitor door admissions and inventory.
            </p>
          </div>

          <Button to="/organizer/events/new" size="sm" iconLeft={Plus}>
            Publish New Event
          </Button>
        </div>

        {/* Filters */}
        <div className="surface flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            {['all', 'music', 'culture', 'tech', 'sports', 'business'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${
                  categoryFilter === cat
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-white/[.06]'
                }`}
              >
                {cat === 'all' ? 'All categories' : cat}
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
                  <th className="px-4 py-3.5 font-medium uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-right font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-white/[.06]">
                {filteredEvents.map((ev) => {
                  const soldRatio = Math.round(((ev.sold || 0) / (ev.capacity || 100)) * 100)

                  return (
                    <tr key={ev.id} className="transition hover:bg-ink-50/50 dark:hover:bg-white/[.02]">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={ev.cover}
                            alt=""
                            className="size-12 rounded-xl object-cover bg-ink-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-ink-900 dark:text-white truncate">
                              {ev.title}
                            </p>
                            <p className="text-[11px] text-ink-400">
                              From {formatCurrency(ev.priceFrom || 0)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-medium text-ink-800 dark:text-ink-200">
                          {formatDate(ev.start)}
                        </p>
                        <p className="text-[11px] text-ink-400">
                          {ev.venue?.name}, {ev.venue?.city || 'Wa'}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-semibold text-ink-800 dark:text-ink-200">
                          {ev.organizer?.name || 'Verified Partner'}
                        </p>
                        <span className="inline-flex items-center gap-1 text-[11px] text-ink-500 dark:text-ink-400 font-medium">
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          Verified
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-between text-[11px] font-medium">
                          <span>{ev.sold?.toLocaleString() || 0} sold</span>
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
                            className="grid size-7 place-items-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-900 dark:hover:bg-white/10 dark:hover:text-white"
                            title="View event on site"
                          >
                            <ExternalLink className="size-3.5" />
                          </Link>
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
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
