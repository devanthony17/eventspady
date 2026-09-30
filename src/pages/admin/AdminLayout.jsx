import { Suspense, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { PortalTopNav } from '@components/layout/PortalTopNav'
import { PortalSideNav } from '@components/layout/PortalSideNav'

function PortalFallback() {
  return (
    <div className="grid min-h-[40vh] place-items-center" role="status" aria-label="Loading section">
      <div className="size-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
    </div>
  )
}

export default function AdminLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-ink-50/70 dark:bg-ink-950">
      <PortalTopNav portal="admin" onToggleMobileNav={() => setMobileNavOpen((v) => !v)} />
      <div className="mx-auto flex w-full max-w-[1440px] flex-1">
        <PortalSideNav
          portal="admin"
          mobileOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <Suspense fallback={<PortalFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
