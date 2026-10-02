import { Suspense, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Bell, Heart, LayoutDashboard, Settings, User } from 'lucide-react'
import { Ticket } from '@components/icons/AppIcons'
import { PortalTopNav } from '@components/layout/PortalTopNav'
import { PortalSideNav } from '@components/layout/PortalSideNav'
import { useWishlist } from '@hooks/useWishlist'
import { useUserNotifications } from '@hooks/api'

export const dashboardNav = (savedCount, unread) => [
  { label: 'Overview', to: '/dashboard', icon: LayoutDashboard, end: true },
  { label: 'My tickets', to: '/dashboard/tickets', icon: Ticket },
  { label: 'Saved events', to: '/dashboard/saved', icon: Heart, badge: savedCount },
  { label: 'Notifications', to: '/dashboard/notifications', icon: Bell, badge: unread },
  { label: 'Profile', to: '/dashboard/profile', icon: User },
  { label: 'Settings', to: '/dashboard/settings', icon: Settings },
]

function PortalFallback() {
  return (
    <div className="grid min-h-[40vh] place-items-center" role="status" aria-label="Loading section">
      <div className="size-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
    </div>
  )
}

/** Provides the attendee top navigation, vertical side navigation, and content container. */
export default function DashboardLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const { count } = useWishlist()
  const { data: notificationsData } = useUserNotifications()

  const notifications = Array.isArray(notificationsData)
    ? notificationsData
    : notificationsData?.notifications || notificationsData?.data || []
  const unread = notifications.filter((n) => !n.read && !n.isRead).length

  return (
    <div className="flex min-h-screen flex-col bg-ink-50/60 dark:bg-ink-950">
      <PortalTopNav portal="attendee" onToggleMobileNav={() => setMobileNavOpen((v) => !v)} />
      <div className="mx-auto flex w-full max-w-[1440px] flex-1">
        <PortalSideNav
          portal="attendee"
          mobileOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <Suspense fallback={<PortalFallback />}>
            <Outlet context={{ nav: dashboardNav(count, unread) }} />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
