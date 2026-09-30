import { Suspense, useState } from 'react'
import { Outlet } from 'react-router-dom'
import {
  BadgePercent,
  CalendarDays,
  LayoutDashboard,
  Plus,
  Receipt,
  ScanLine,
  Users,
} from 'lucide-react'
import { PortalTopNav } from '@components/layout/PortalTopNav'
import { PortalSideNav } from '@components/layout/PortalSideNav'

export const organizerNav = [
  { label: 'Overview', to: '/organizer', icon: LayoutDashboard, end: true },
  { label: 'My events', to: '/organizer/events', icon: CalendarDays },
  { label: 'Create event', to: '/organizer/events/new', icon: Plus },
  { label: 'Orders', to: '/organizer/orders', icon: Receipt },
  { label: 'Coupons', to: '/organizer/coupons', icon: BadgePercent },
  { label: 'Guest list', to: '/organizer/guests', icon: Users },
  { label: 'Scanner', to: '/organizer/scanner', icon: ScanLine },
]

function PortalFallback() {
  return (
    <div className="grid min-h-[40vh] place-items-center" role="status" aria-label="Loading section">
      <div className="size-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
    </div>
  )
}

export default function OrganizerLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-ink-50/60 dark:bg-ink-950">
      <PortalTopNav portal="organizer" onToggleMobileNav={() => setMobileNavOpen((v) => !v)} />
      <div className="mx-auto flex w-full max-w-[1440px] flex-1">
        <PortalSideNav
          portal="organizer"
          mobileOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <Suspense fallback={<PortalFallback />}>
            <Outlet context={{ nav: organizerNav }} />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
