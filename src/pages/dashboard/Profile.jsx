import { useState, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import { BadgeCheck, Camera, Mail, MapPin, Phone, Save, ShieldAlert, User } from 'lucide-react'
import { Seo } from '@components/ui/Seo'
import { DashboardShell } from '@components/dashboard/DashboardShell'
import { Avatar } from '@components/ui/Avatar'
import { Badge } from '@components/ui/Badge'
import { Button } from '@components/ui/Button'
import { Input, Textarea } from '@components/ui/Field'
import { useAuth } from '@context/AuthContext'
import { useToast } from '@context/ToastContext'
import { useUploadAvatarMutation } from '@hooks/api'
import { formatDate } from '@lib/utils'

export default function Profile() {
  const { nav } = useOutletContext()
  const { user, updateProfile } = useAuth()
  const uploadAvatarMutation = useUploadAvatarMutation()
  const fileInputRef = useRef(null)
  const toast = useToast()

  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    location: user?.location ?? '',
    bio: user?.bio ?? '',
  })
  const [saving, setSaving] = useState(false)

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('avatar', file)
    try {
      const res = await uploadAvatarMutation.mutateAsync(formData)
      const avatarUrl = res.avatarUrl || res.url || res.data?.avatarUrl
      if (avatarUrl) {
        updateProfile({ avatar: avatarUrl })
      }
      toast.success('Avatar updated successfully.')
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to upload avatar.')
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile(form)
      toast.success('Your profile has been updated.')
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Seo title="Profile" noIndex />

      <DashboardShell nav={nav} title="Profile" description="How you appear to organizers when you book.">
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <form onSubmit={onSubmit} className="surface p-6">
            <div className="mb-6 flex flex-wrap items-center gap-5 border-b border-ink-200/70 pb-6 dark:border-white/10">
              <div className="relative">
                <Avatar src={user?.avatar} name={user?.name} size="2xl" />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  className="hidden"
                  aria-label="Upload avatar file"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full bg-brand-600 text-white shadow-lift transition hover:bg-brand-700"
                  aria-label="Change avatar"
                >
                  <Camera className="size-4" />
                </button>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold">{user?.name}</h2>
                  {user?.verified?.email && (
                    <Badge tone="success" size="sm" icon={BadgeCheck}>
                      Email verified
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
                  Member since {user?.joinedAt ? formatDate(user.joinedAt, { month: 'long' }) : '—'}
                </p>
                {user?.provider === 'google' && (
                  <p className="mt-1 text-xs text-ink-400">Signed in with Google</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Full name"
                icon={User}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                autoComplete="name"
              />
              <Input
                label="Email address"
                type="email"
                icon={Mail}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
              <Input
                label="Phone number"
                type="tel"
                icon={Phone}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                autoComplete="tel"
              />
              <Input
                label="Location"
                icon={MapPin}
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="City, country"
              />
              <Textarea
                label="About you"
                wrapperClassName="sm:col-span-2"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="A short line organizers see when you book — optional."
                rows={3}
              />
            </div>

            <div className="mt-6 flex justify-end">
              <Button type="submit" loading={saving} iconLeft={Save}>
                Save changes
              </Button>
            </div>
          </form>

          {/* Verification status */}
          <aside className="space-y-5">
            <div className="surface p-5">
              <h2 className="mb-4 text-base font-bold">Verification</h2>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="size-4 shrink-0 text-ink-400" aria-hidden="true" />
                  <span className="flex-1 text-sm">Email</span>
                  <Badge tone={user?.verified?.email ? 'success' : 'warning'} size="sm">
                    {user?.verified?.email ? 'Verified' : 'Pending'}
                  </Badge>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="size-4 shrink-0 text-ink-400" aria-hidden="true" />
                  <span className="flex-1 text-sm">Phone</span>
                  <Badge tone={user?.verified?.phone ? 'success' : 'warning'} size="sm">
                    {user?.verified?.phone ? 'Verified' : 'Pending'}
                  </Badge>
                </div>
              </div>

              {!user?.verified?.phone && (
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  className="mt-4"
                  onClick={() => toast.info('Verification code sent by SMS.')}
                >
                  Verify phone by SMS
                </Button>
              )}

              <p className="mt-4 flex gap-2 rounded-xl bg-ink-50 p-3 text-xs text-ink-500 dark:bg-white/[.04] dark:text-ink-400">
                <ShieldAlert className="size-4 shrink-0" aria-hidden="true" />
                The admin decides whether email, SMS or both are required before you can book.
              </p>
            </div>

            <div className="surface p-5">
              <h2 className="mb-2 text-base font-bold">Delete account</h2>
              <p className="text-sm text-ink-500 dark:text-ink-400">
                Permanently removes your profile. Tickets for events that have not happened yet are refunded to
                your wallet first.
              </p>
              <Button
                variant="danger"
                size="sm"
                fullWidth
                className="mt-4"
                onClick={() => toast.warning('Account deletion requires confirmation by email.')}
              >
                Request deletion
              </Button>
            </div>
          </aside>
        </div>
      </DashboardShell>
    </>
  )
}
