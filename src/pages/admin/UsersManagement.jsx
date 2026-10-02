import { useState, useMemo } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  Search,
  Shield,
  ShieldAlert,
  Trash2,
  UserX,
  Users,
} from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { Avatar } from '@components/ui/Avatar'
import { Badge } from '@components/ui/Badge'
import { useStore } from '@context/StoreContext'
import { useToast } from '@context/ToastContext'
import {
  useAdminUsers,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useUpdateUserRoleMutation,
  useAddGateViolationMutation,
  useRemoveGateViolationMutation,
} from '@hooks/api'
import { formatCurrency, formatDate } from '@lib/utils'

export default function UsersManagement() {
  const { getGateStatus, recordGateViolation, pardonGateViolation } = useStore()
  const { data: usersData, isLoading } = useAdminUsers()
  const updateUserStatusMutation = useUpdateUserStatusMutation()
  const deleteUserMutation = useDeleteUserMutation()
  const updateUserRoleMutation = useUpdateUserRoleMutation()
  const addGateViolationMutation = useAddGateViolationMutation()
  const removeGateViolationMutation = useRemoveGateViolationMutation()
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [gateFilter, setGateFilter] = useState('all') // 'all' | 'clean' | 'flagged' | 'barred'

  const users = useMemo(() => {
    if (Array.isArray(usersData)) return usersData
    if (Array.isArray(usersData?.users)) return usersData.users
    if (Array.isArray(usersData?.data)) return usersData.data
    return []
  }, [usersData])

  const handleAdminFlag = async (user) => {
    const status = getGateStatus(user.email)
    const isSecond = status.strikes >= 1
    try {
      await addGateViolationMutation.mutateAsync({
        userId: user.id,
        email: user.email,
        notes: isSecond ? 'Second violation: Barred permanently from Pay at the Gate' : 'First violation: Flagged with warning',
      })
    } catch {
      // Non-blocking fallback
    }
    recordGateViolation(user.email, {
      name: user.name,
      eventId: 'admin-action',
      eventTitle: 'Admin Platform Action',
      notes: isSecond ? 'Second violation: Barred permanently from Pay at the Gate' : 'First violation: Flagged with warning',
      reportedBy: 'Platform Admin',
    })
    toast.warning(
      isSecond
        ? `${user.name} now has 2 violations and is PERMANENTLY BARRED from Pay at the Gate.`
        : `${user.name} has been FLAGGED with 1 violation for no-show.`,
    )
  }

  const handleAdminPardon = async (user) => {
    try {
      await removeGateViolationMutation.mutateAsync(user.id || user.email)
    } catch {
      // Non-blocking fallback
    }
    pardonGateViolation(user.email)
    toast.success(`Gate violations pardoned for ${user.name}. Account is now clean.`)
  }

  const handleToggleRole = async (user) => {
    const nextRole = user.role === 'admin' ? 'attendee' : 'admin'
    if (!window.confirm(`Change ${user.name}'s role to ${nextRole}?`)) return
    try {
      await updateUserRoleMutation.mutateAsync({ id: user.id, role: nextRole })
      toast.success(`${user.name}'s role updated to ${nextRole}.`)
    } catch (err) {
      toast.error(err.message || 'Failed to update user role.')
    }
  }

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to permanently delete user account "${user.name}"?`)) return
    try {
      await deleteUserMutation.mutateAsync(user.id)
      toast.success(`User "${user.name}" has been deleted.`)
    } catch (err) {
      toast.error(err.message || 'Failed to delete user.')
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = roleFilter === 'all' || u.role === roleFilter
      const status = getGateStatus(u.email)
      const matchesGate =
        gateFilter === 'all'
          ? true
          : gateFilter === 'clean'
          ? status.strikes === 0
          : gateFilter === 'flagged'
          ? status.isFlagged
          : status.barred

      const matchesSearch =
        !search ||
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.city?.toLowerCase().includes(search.toLowerCase())
      return matchesRole && matchesGate && matchesSearch
    })
  }, [users, search, roleFilter, gateFilter, getGateStatus])

  return (
    <>
      <Seo
        title="Attendees & Platform Users — Admin Console"
        description="Monitor registered attendees, ticket purchases, and MoMo customer accounts."
        noIndex
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-3xl">
              Attendees & Accounts ({users.length})
            </h1>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
              Overview of registered Ghanaian event goers, verified phone numbers, and booking history.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="surface flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            {['all', 'attendee', 'admin'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${
                  roleFilter === r
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-white/[.06]'
                }`}
              >
                {r === 'all' ? 'All Roles' : `${r}s`}
              </button>
            ))}

            <span className="hidden h-4 w-px bg-ink-200 dark:bg-white/10 sm:inline" />

            {[
              { id: 'all', label: 'All Status' },
              { id: 'clean', label: 'Good Standing' },
              { id: 'flagged', label: 'Flagged (1)' },
              { id: 'barred', label: 'Restricted (2)' },
            ].map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGateFilter(g.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  gateFilter === g.id
                    ? 'bg-ink-900 text-white dark:bg-white dark:text-ink-950'
                    : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-white/[.06]'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              placeholder="Search user name, email or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-ink-200 bg-white py-2 pl-9 pr-4 text-xs text-ink-900 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-ink-800 dark:text-white"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-ink-200/80 bg-ink-50/50 text-ink-500 dark:border-white/10 dark:bg-white/[.02] dark:text-ink-400">
                <tr>
                  <th className="px-5 py-3.5 font-medium uppercase tracking-wider">User</th>
                  <th className="px-4 py-3.5 font-medium uppercase tracking-wider">Contact & City</th>
                  <th className="px-4 py-3.5 font-medium uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3.5 font-medium uppercase tracking-wider">Gate Status</th>
                  <th className="px-4 py-3.5 font-medium uppercase tracking-wider">Total Spent</th>
                  <th className="px-5 py-3.5 text-right font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-white/[.06]">
                {filteredUsers.map((user) => {
                  const gate = getGateStatus(user.email)
                  return (
                    <tr key={user.id} className="transition hover:bg-ink-50/50 dark:hover:bg-white/[.02]">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} size="md" />
                          <div>
                            <p className="font-bold text-ink-900 dark:text-white">{user.name}</p>
                            <p className="text-[11px] text-ink-400">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-medium text-ink-800 dark:text-ink-200">{user.phone}</p>
                        <p className="text-[11px] text-ink-400">
                          {user.city}, {user.region}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleRole(user)}
                          title="Click to toggle user role"
                          className="group transition"
                        >
                          {user.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 border border-purple-200/60 group-hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/40">
                              <span className="size-1.5 rounded-full bg-purple-500" />
                              Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md bg-ink-50 px-2 py-0.5 text-xs font-medium text-ink-600 border border-ink-200/60 group-hover:bg-ink-100 dark:bg-white/[.04] dark:text-ink-300 dark:border-white/10">
                              Attendee
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Pay at Gate Status */}
                      <td className="px-4 py-4">
                        {gate.barred ? (
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40">
                            <span className="size-1.5 rounded-full bg-rose-500" />
                            Restricted (2 strikes)
                          </span>
                        ) : gate.isFlagged ? (
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40">
                            <span className="size-1.5 rounded-full bg-amber-500" />
                            Flagged (1 strike)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40">
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            Good standing
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4 font-bold text-ink-900 dark:text-white">
                        {formatCurrency(user.totalSpent)}
                      </td>

                      {/* Enforcement Action Buttons */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleAdminFlag(user)}
                            className="inline-flex items-center gap-1 rounded-lg border border-ink-200 bg-white px-2 py-1 text-[11px] font-medium text-amber-700 transition hover:bg-amber-50 dark:border-white/10 dark:bg-ink-800 dark:text-amber-300 dark:hover:bg-amber-950/40"
                            title="Add a no-show strike (flags on 1st, bars on 2nd)"
                          >
                            <UserX className="size-3" />
                            <span>+1 Strike</span>
                          </button>

                          {gate.strikes > 0 && (
                            <button
                              type="button"
                              onClick={() => handleAdminPardon(user)}
                              className="inline-flex items-center gap-1 rounded-lg border border-ink-200 bg-white px-2 py-1 text-[11px] font-medium text-ink-600 transition hover:bg-ink-100 dark:border-white/10 dark:bg-ink-800 dark:text-ink-300"
                              title="Pardon and clear all gate strikes"
                            >
                              <RotateCcw className="size-3" />
                              <span>Pardon</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2 py-1 text-[11px] font-medium text-rose-600 transition hover:bg-rose-50 dark:border-rose-500/30 dark:bg-ink-800 dark:text-rose-300 dark:hover:bg-rose-950/30"
                            title="Permanently delete user"
                          >
                            <Trash2 className="size-3" />
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
