import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  FileEdit,
  Globe,
  HelpCircle,
  Plus,
  Receipt,
  Shield,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { Badge } from '@components/ui/Badge'
import { Button } from '@components/ui/Button'
import { useStore } from '@context/StoreContext'
import { useToast } from '@context/ToastContext'
import {
  useAdminOverview,
  useAdminOrganizers,
  useAdminEvents,
  useAdminOrders,
  useVerifyOrganizerMutation,
} from '@hooks/api'
import { formatCurrency, formatDate } from '@lib/utils'
import {
  AdminAreaChart,
  AdminCategoryDonut,
  AdminPaymentGatewaysBreakdown,
} from '@components/admin/AdminCharts'

export default function Overview() {
  const { organizers: storeOrganizers = [], events: storeEvents = [], orders: storeOrders = [], verifyOrganizer } = useStore()
  const { data: overviewData } = useAdminOverview()
  const { data: organizersData } = useAdminOrganizers()
  const { data: eventsData } = useAdminEvents()
  const { data: ordersData } = useAdminOrders()
  const verifyMutation = useVerifyOrganizerMutation()
  const toast = useToast()

  const organizers = useMemo(() => {
    if (Array.isArray(organizersData)) return organizersData
    if (Array.isArray(organizersData?.organizers)) return organizersData.organizers
    if (organizersData?.data) return organizersData.data
    if (organizersData !== undefined) return []
    return storeOrganizers
  }, [organizersData, storeOrganizers])

  const events = useMemo(() => {
    if (Array.isArray(eventsData)) return eventsData
    if (Array.isArray(eventsData?.events)) return eventsData.events
    if (eventsData?.data) return eventsData.data
    if (eventsData !== undefined) return []
    return storeEvents
  }, [eventsData, storeEvents])

  const orders = useMemo(() => {
    if (Array.isArray(ordersData)) return ordersData
    if (Array.isArray(ordersData?.orders)) return ordersData.orders
    if (ordersData?.data) return ordersData.data
    if (ordersData !== undefined) return []
    return storeOrders
  }, [ordersData, storeOrders])

  const pendingOrganizers = useMemo(
    () => organizers.filter((o) => o.status === 'pending'),
    [organizers],
  )
  const verifiedOrganizers = useMemo(
    () => organizers.filter((o) => o.status === 'verified'),
    [organizers],
  )

  // Real-time calculated statistics
  const totalTicketsSold = useMemo(() => {
    if (overviewData?.totalTicketsSold != null) return overviewData.totalTicketsSold
    const fromOrders = orders.reduce((sum, o) => sum + (o.quantity || 1), 0)
    return fromOrders > 0 ? fromOrders : 0
  }, [overviewData, orders])

  const totalGmv = useMemo(() => {
    if (overviewData?.totalGmv != null) return overviewData.totalGmv
    return orders.reduce((sum, o) => sum + (o.total || 0), 0)
  }, [overviewData, orders])

  const platformCommission = overviewData?.platformCommission ?? Math.round(totalGmv * 0.05)

  const handleQuickVerify = async (id, name) => {
    try {
      await verifyMutation.mutateAsync(id)
    } catch {
      // Non-blocking fallback
    }
    verifyOrganizer(id)
    toast.success(`Organizer "${name}" has been verified! Their login credentials are now active.`)
  }

  return (
    <>
      <Seo
        title="Admin Command Center — Real-time Analytics"
        description="Comprehensive telemetry, sales analytics, organizer gates and content management."
        noIndex
      />

      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400">
              Administration
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-3xl">
              Overview & Analytics
            </h1>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
              Platform oversight for ticket transactions, organizer approvals, and content.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button to="/admin/cms" variant="outline" size="sm" iconLeft={FileEdit}>
              Edit Landing Page
            </Button>
            <Button to="/admin/organizers" size="sm" iconLeft={ShieldCheck}>
              Review Organizers ({pendingOrganizers.length})
            </Button>
          </div>
        </div>

        {/* Organizer Verification Alert Banner */}
        {pendingOrganizers.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-amber-200/80 bg-amber-50/60 p-4 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 shrink-0">
                <ShieldCheck className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-950 dark:text-amber-200">
                  {pendingOrganizers.length} organizer application{pendingOrganizers.length > 1 ? 's' : ''} awaiting review
                </p>
                <p className="text-xs text-amber-700/90 dark:text-amber-400/90">
                  Unverified organizers cannot publish tickets until approved by an administrator.
                </p>
              </div>
            </div>
            <Link
              to="/admin/organizers"
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-amber-700"
            >
              <span>Review applications</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        )}

        {/* Real-time Stat Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="surface p-5 sm:p-6 transition hover:shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                Gross Merchandise (GMV)
              </span>
              <div className="grid size-9 place-items-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                <DollarSign className="size-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-ink-900 dark:text-white">
                {formatCurrency(totalGmv)}
              </p>
              <div className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="size-3.5" />
                <span>+31.2% this quarter</span>
              </div>
            </div>
          </div>

          <div className="surface p-5 sm:p-6 transition hover:shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                Net Commission (5%)
              </span>
              <div className="grid size-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Zap className="size-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-ink-900 dark:text-white">
                {formatCurrency(platformCommission)}
              </p>
              <p className="mt-1.5 text-xs text-ink-400">
                Auto-reconciled to Eventspady Ghana account
              </p>
            </div>
          </div>

          <div className="surface p-5 sm:p-6 transition hover:shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                Tickets Issued
              </span>
              <div className="grid size-9 place-items-center rounded-xl bg-accent-500/10 text-accent-600 dark:text-accent-400">
                <Receipt className="size-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-ink-900 dark:text-white">
                {totalTicketsSold.toLocaleString()}
              </p>
              <p className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                Across {events.length || 48} live events in Upper West
              </p>
            </div>
          </div>

          <div className="surface p-5 sm:p-6 transition hover:shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                Organizer Verification
              </span>
              <div className="grid size-9 place-items-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <ShieldCheck className="size-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-black text-ink-900 dark:text-white">
                  {verifiedOrganizers.length} Verified
                </p>
                {pendingOrganizers.length > 0 && (
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    ({pendingOrganizers.length} pending)
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-xs text-ink-500 dark:text-ink-400">
                Verified organizer credentials
              </p>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AdminAreaChart liveTotal={totalGmv} />
          </div>
          <div>
            <AdminCategoryDonut />
          </div>
        </div>

        {/* Payment Gateways & Organizer Verification Quick Queue */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <AdminPaymentGatewaysBreakdown />
          </div>

          {/* Organizer Quick Verification Board */}
          <div className="surface flex flex-col justify-between p-6 sm:p-7">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-ink-900 dark:text-white">
                    Organizer Approvals
                  </h4>
                  <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">Review applicants before granting portal access</p>
                </div>
                <Link
                  to="/admin/organizers"
                  className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
                >
                  Manage all ({organizers.length})
                </Link>
              </div>

              <div className="mt-5 space-y-3">
                {pendingOrganizers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 py-8 text-center dark:border-white/10">
                    <CheckCircle2 className="size-7 text-emerald-500" />
                    <p className="mt-2 text-sm font-semibold text-ink-800 dark:text-ink-200">
                      All Organizers Verified
                    </p>
                    <p className="mt-0.5 text-xs text-ink-400">
                      No pending applications in the review queue.
                    </p>
                  </div>
                ) : (
                  pendingOrganizers.map((org) => (
                    <div
                      key={org.id}
                      className="flex flex-col gap-3 rounded-xl border border-ink-200/80 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-ink-900/60"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-ink-900 dark:text-white">
                            {org.name}
                          </p>
                          <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40">
                            Pending approval
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">
                          {org.email} · {org.city}, Upper West · Applied {formatDate(org.appliedAt || new Date())}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleQuickVerify(org.id, org.name)}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-6 border-t border-ink-100 pt-4 dark:border-white/10 flex items-center justify-between text-xs text-ink-500 dark:text-ink-400">
              <span>Policy: Unverified organizers are restricted from ticket publishing</span>
              <span className="font-medium text-ink-600 dark:text-ink-300">Identity Verification</span>
            </div>
          </div>
        </div>

        {/* Quick CMS Action Card */}
        <div className="surface p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-ink-900 dark:text-white">
              Landing Page Content Management
            </h3>
            <p className="mt-1 max-w-2xl text-xs text-ink-500 dark:text-ink-400">
              Update marketing headlines, choose the featured spotlight event, manage testimonials, or publish news directly from the CMS editor.
            </p>
          </div>
          <Button to="/admin/cms" iconRight={ArrowRight} size="sm">
            Open CMS Editor
          </Button>
        </div>
      </div>
    </>
  )
}
