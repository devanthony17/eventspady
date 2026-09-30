import { useLocation } from 'react-router-dom'

/**
 * Shell shared by the attendee dashboard and organizer panel pages.
 * Displays page header (eyebrow, title, description, actions) and children
 * cleanly beside the vertical PortalSideNav.
 */
export function DashboardShell({ nav, title, description, actions, children, eyebrow }) {
  const { pathname } = useLocation()

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && (
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              {eyebrow}
            </p>
          )}
          <h1 className="text-2xl font-extrabold sm:text-3xl text-ink-900 dark:text-white">{title}</h1>
          {description && (
            <p className="mt-1.5 text-pretty text-sm text-ink-500 dark:text-ink-400 max-w-3xl">{description}</p>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      <div className="min-w-0">
        {children}
      </div>

      {/* Announce route changes for assistive tech */}
      <span className="sr-only" aria-live="polite">
        {pathname}
      </span>
    </div>
  )
}
