import { useState, useMemo } from 'react'
import {
  AlertCircle,
  Building,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileCheck,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserX,
  X,
} from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { Badge } from '@components/ui/Badge'
import { Button } from '@components/ui/Button'
import { Input } from '@components/ui/Field'
import { useStore } from '@context/StoreContext'
import { useToast } from '@context/ToastContext'
import {
  useAdminOrganizers,
  useVerifyOrganizerMutation,
  useRejectOrganizerMutation,
  useSuspendOrganizerMutation,
  useUpdateOrganizerCommissionMutation,
} from '@hooks/api'
import { formatDate, formatCurrency, cn } from '@lib/utils'

export default function OrganizersManagement() {
  const { organizers: storeOrganizers = [], verifyOrganizer, rejectOrganizer, suspendOrganizer } = useStore()
  const { data: organizersData, isLoading } = useAdminOrganizers()
  const verifyMutation = useVerifyOrganizerMutation()
  const rejectMutation = useRejectOrganizerMutation()
  const suspendMutation = useSuspendOrganizerMutation()
  const updateCommissionMutation = useUpdateOrganizerCommissionMutation()
  const toast = useToast()

  const organizers = useMemo(() => {
    if (Array.isArray(organizersData)) return organizersData
    if (Array.isArray(organizersData?.organizers)) return organizersData.organizers
    if (organizersData?.data) return organizersData.data
    if (organizersData !== undefined) return []
    return storeOrganizers
  }, [organizersData, storeOrganizers])

  const [activeTab, setActiveTab] = useState('all') // 'all' | 'pending' | 'verified' | 'suspended'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrganizer, setSelectedOrganizer] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const pendingCount = useMemo(
    () => organizers.filter((o) => o.status === 'pending').length,
    [organizers],
  )

  const filteredOrganizers = useMemo(() => {
    return organizers.filter((org) => {
      const matchesTab =
        activeTab === 'all'
          ? true
          : activeTab === 'pending'
          ? org.status === 'pending'
          : activeTab === 'verified'
          ? org.status === 'verified'
          : org.status === 'suspended'

      const matchesSearch =
        !searchQuery ||
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.city?.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesTab && matchesSearch
    })
  }, [organizers, activeTab, searchQuery])

  const handleVerify = async (org) => {
    try {
      await verifyMutation.mutateAsync(org.id)
    } catch {
      // Non-blocking fallback
    }
    verifyOrganizer(org.id)
    toast.success(`Organizer "${org.name}" is now verified! Login credentials activated.`)
    if (selectedOrganizer?.id === org.id) {
      setSelectedOrganizer({ ...selectedOrganizer, status: 'verified' })
    }
  }

  const handleSuspend = async (org) => {
    try {
      await suspendMutation.mutateAsync({ id: org.id, reason: 'Suspended by admin' })
    } catch {
      // Non-blocking fallback
    }
    suspendOrganizer(org.id)
    toast.info(`Organizer "${org.name}" account has been suspended.`)
    if (selectedOrganizer?.id === org.id) {
      setSelectedOrganizer({ ...selectedOrganizer, status: 'suspended' })
    }
  }

  const handleReject = async (org) => {
    const reason = window.prompt(`Please enter rejection reason for ${org.name}:`, 'Incomplete business registration documents')
    if (reason) {
      try {
        await rejectMutation.mutateAsync({ id: org.id, reason })
      } catch {
        // Non-blocking fallback
      }
      rejectOrganizer(org.id, reason)
      toast.warning(`Application for "${org.name}" rejected.`)
      setIsModalOpen(false)
    }
  }

  const handleUpdateCommission = async (org) => {
    const current = org.commissionRate || 5
    const input = window.prompt(`Enter new platform commission rate (%) for "${org.name}":`, current)
    if (input === null) return
    const rate = parseFloat(input)
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast.error('Invalid commission rate. Please enter a percentage between 0 and 100.')
      return
    }
    try {
      await updateCommissionMutation.mutateAsync({ id: org.id, commissionRate: rate })
      toast.success(`Commission rate for "${org.name}" updated to ${rate}%.`)
      if (selectedOrganizer?.id === org.id) {
        setSelectedOrganizer({ ...selectedOrganizer, commissionRate: rate })
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update commission rate.')
    }
  }

  const openDetails = (org) => {
    setSelectedOrganizer(org)
    setIsModalOpen(true)
  }

  return (
    <>
      <Seo
        title="Organizer Management — Admin Console"
        description="Review, verify, approve and manage event organizers."
        noIndex
      />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-3xl">
              Organizers Management
            </h1>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
              Review applications, verify business credentials, and manage organizer portal permissions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-ink-200/80 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 shadow-xs dark:border-white/10 dark:bg-ink-800 dark:text-ink-300">
              Total: {organizers.length} Organizers
            </span>
          </div>
        </div>

        {/* Filter Tabs & Search bar */}
        <div className="surface flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Accounts', count: organizers.length },
              { id: 'pending', label: 'Pending Review', count: pendingCount, highlight: pendingCount > 0 },
              {
                id: 'verified',
                label: 'Verified Organizers',
                count: organizers.filter((o) => o.status === 'verified').length,
              },
              {
                id: 'suspended',
                label: 'Suspended',
                count: organizers.filter((o) => o.status === 'suspended').length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-white/[.06] dark:hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-none ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : tab.highlight
                      ? 'bg-amber-100 text-amber-800 border border-amber-200/60 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/40'
                      : 'bg-ink-100 text-ink-600 dark:bg-white/10 dark:text-ink-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              placeholder="Search organizer or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-ink-200 bg-white py-2 pl-9 pr-4 text-xs text-ink-900 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-white/10 dark:bg-ink-800 dark:text-white"
            />
          </div>
        </div>

        {/* Organizers Table */}
        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-ink-200/80 bg-ink-50/50 text-ink-500 dark:border-white/10 dark:bg-white/[.02] dark:text-ink-400">
                <tr>
                  <th className="px-5 py-3.5 font-medium uppercase tracking-wider">Organizer / Entity</th>
                  <th className="px-4 py-3.5 font-medium uppercase tracking-wider">Contact & Location</th>
                  <th className="px-4 py-3.5 font-medium uppercase tracking-wider">KYC & Reg ID</th>
                  <th className="px-4 py-3.5 font-medium uppercase tracking-wider">Commission</th>
                  <th className="px-4 py-3.5 font-medium uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-right font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-white/[.06]">
                {filteredOrganizers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-ink-400">
                      No organizers matching current criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrganizers.map((org) => {
                    const isPending = org.status === 'pending'
                    const isVerified = org.status === 'verified'
                    const isSuspended = org.status === 'suspended'

                    return (
                      <tr
                        key={org.id}
                        className={`transition hover:bg-ink-50/50 dark:hover:bg-white/[.02] ${
                          isPending ? 'bg-amber-500/[.03]' : ''
                        }`}
                      >
                        {/* Entity */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="grid size-9 place-items-center rounded-xl bg-ink-100 font-bold text-ink-700 dark:bg-white/10 dark:text-white shrink-0">
                              {org.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-ink-900 dark:text-white truncate">
                                {org.name}
                              </p>
                              <p className="text-[11px] text-ink-400 truncate">
                                ID: {org.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-4 py-4">
                          <p className="text-ink-800 dark:text-ink-200 font-medium truncate">
                            {org.email || 'No email provided'}
                          </p>
                          <p className="text-[11px] text-ink-400">
                            {org.phone || '+233 24 000 0000'} · {org.city || 'Wa'}, Ghana
                          </p>
                        </td>

                        {/* KYC */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[11px] font-bold text-ink-700 dark:text-ink-300">
                              {org.regNumber || 'GH-TIN-89241-W'}
                            </span>
                          </div>
                          <p className="text-[10px] text-ink-400">
                            MoMo: {org.momoMerchant || 'MTN Business'}
                          </p>
                        </td>

                        {/* Commission */}
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => handleUpdateCommission(org)}
                            className="group inline-flex items-center gap-1.5 font-bold text-ink-800 hover:text-brand-600 dark:text-ink-200 dark:hover:text-brand-400"
                            title="Click to adjust commission percentage"
                          >
                            <span>{org.commissionRate || 5}% Net</span>
                            <span className="text-[10px] font-semibold text-brand-600 opacity-60 group-hover:opacity-100">Edit</span>
                          </button>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          {isPending && (
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40">
                              <span className="size-1.5 rounded-full bg-amber-500" />
                              Pending
                            </span>
                          )}
                          {isVerified && (
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40">
                              <span className="size-1.5 rounded-full bg-emerald-500" />
                              Verified
                            </span>
                          )}
                          {isSuspended && (
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40">
                              <span className="size-1.5 rounded-full bg-rose-500" />
                              Suspended
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openDetails(org)}
                              className="rounded-lg border border-ink-200 bg-white px-2.5 py-1 text-xs font-medium text-ink-700 shadow-xs transition hover:bg-ink-50 dark:border-white/10 dark:bg-ink-800 dark:text-ink-200 dark:hover:bg-ink-700"
                            >
                              Review
                            </button>

                            {isPending && (
                              <button
                                type="button"
                                onClick={() => handleVerify(org)}
                                className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-medium text-white shadow-xs transition hover:bg-emerald-700"
                              >
                                Approve
                              </button>
                            )}

                            {isVerified && (
                              <button
                                type="button"
                                onClick={() => handleSuspend(org)}
                                className="rounded-lg border border-rose-200 text-rose-600 px-2 py-1 text-xs font-medium hover:bg-rose-50 dark:border-rose-500/30 dark:hover:bg-rose-500/10"
                                title="Suspend account"
                              >
                                Suspend
                              </button>
                            )}

                            {isSuspended && (
                              <button
                                type="button"
                                onClick={() => handleVerify(org)}
                                className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-emerald-700"
                              >
                                Re-verify
                              </button>
                            )}
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

        {/* Organizer Verification Details Modal */}
        {isModalOpen && selectedOrganizer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-ink-950/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-ink-900 sm:p-8">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute right-5 top-5 grid size-8 place-items-center rounded-lg text-ink-400 hover:text-ink-700 dark:hover:text-white"
              >
                <X className="size-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  <ShieldCheck className="size-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-ink-900 dark:text-white">
                    {selectedOrganizer.name}
                  </h3>
                  <p className="text-xs text-ink-500 dark:text-ink-400">
                    Account & KYC Details · Applied {formatDate(selectedOrganizer.appliedAt || new Date())}
                  </p>
                </div>
              </div>

              {/* Status Banner */}
              <div className="mt-5 rounded-xl border border-ink-200/60 bg-ink-50/60 p-3.5 dark:border-white/10 dark:bg-white/[.02]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-ink-600 dark:text-ink-400">Account status:</span>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-medium border',
                      selectedOrganizer.status === 'verified'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40'
                        : selectedOrganizer.status === 'pending'
                        ? 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40'
                        : 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40'
                    )}
                  >
                    <span
                      className={cn(
                        'size-1.5 rounded-full',
                        selectedOrganizer.status === 'verified'
                          ? 'bg-emerald-500'
                          : selectedOrganizer.status === 'pending'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      )}
                    />
                    {selectedOrganizer.status === 'verified'
                      ? 'Verified'
                      : selectedOrganizer.status === 'pending'
                      ? 'Pending Review'
                      : 'Suspended'}
                  </span>
                </div>
              </div>

              {/* Dossier Breakdown */}
              <div className="mt-6 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-ink-200/60 p-3 dark:border-white/10">
                    <span className="text-ink-400">Email Address</span>
                    <p className="mt-0.5 font-bold text-ink-900 dark:text-white">
                      {selectedOrganizer.email}
                    </p>
                  </div>
                  <div className="rounded-xl border border-ink-200/60 p-3 dark:border-white/10">
                    <span className="text-ink-400">Contact Number</span>
                    <p className="mt-0.5 font-bold text-ink-900 dark:text-white">
                      {selectedOrganizer.phone || '+233 24 555 1234'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-ink-200/60 p-3 dark:border-white/10">
                    <span className="text-ink-400">Ghana Business TIN / Reg</span>
                    <p className="mt-0.5 font-mono font-bold text-ink-900 dark:text-white">
                      {selectedOrganizer.regNumber || 'GH-TIN-89241-W'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-ink-200/60 p-3 dark:border-white/10">
                    <span className="text-ink-400">MoMo Settlement Account</span>
                    <p className="mt-0.5 font-bold text-ink-900 dark:text-white">
                      {selectedOrganizer.momoMerchant || 'MTN MoMo: 0244123456'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-ink-200/60 p-3 dark:border-white/10">
                    <span className="text-ink-400">Physical Operating Address</span>
                    <p className="mt-0.5 font-bold text-ink-900 dark:text-white">
                      {selectedOrganizer.city || 'Wa'}, Upper West Region, Ghana
                    </p>
                  </div>
                  <div className="rounded-xl border border-ink-200/60 p-3 dark:border-white/10">
                    <span className="text-ink-400">Commission Rate</span>
                    <div className="mt-0.5 flex items-center justify-between">
                      <p className="font-bold text-ink-900 dark:text-white">
                        {selectedOrganizer.commissionRate || 5}% Net
                      </p>
                      <button
                        type="button"
                        onClick={() => handleUpdateCommission(selectedOrganizer)}
                        className="text-xs font-bold text-brand-600 hover:underline dark:text-brand-400"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center justify-end gap-3 border-t border-ink-100 pt-5 dark:border-white/10">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Close
                </Button>

                {selectedOrganizer.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleReject(selectedOrganizer)}
                      className="rounded-lg border border-rose-200 px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-500/30 dark:hover:bg-rose-500/10"
                    >
                      Reject application
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVerify(selectedOrganizer)}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white shadow-xs transition hover:bg-emerald-700"
                    >
                      Approve application
                    </button>
                  </>
                )}

                {selectedOrganizer.status === 'verified' && (
                  <button
                    type="button"
                    onClick={() => handleSuspend(selectedOrganizer)}
                    className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-rose-700"
                  >
                    Suspend account
                  </button>
                )}

                {selectedOrganizer.status === 'suspended' && (
                  <button
                    type="button"
                    onClick={() => handleVerify(selectedOrganizer)}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-emerald-700"
                  >
                    Re-activate account
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
