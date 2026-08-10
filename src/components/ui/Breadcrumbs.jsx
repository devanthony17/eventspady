import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@lib/utils'

/** `items`: [{ label, to? }] — the last entry renders as the current page. */
export function Breadcrumbs({ items = [], className, tone = 'default' }) {
  const muted = tone === 'inverse' ? 'text-white/70' : 'text-ink-500 dark:text-ink-400'
  const active = tone === 'inverse' ? 'text-white' : 'text-ink-900 dark:text-white'
  const hover = tone === 'inverse' ? 'hover:text-white' : 'hover:text-brand-600 dark:hover:text-brand-400'

  return (
    <nav aria-label="Breadcrumb" className={cn('text-sm', className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link to="/" className={cn('flex items-center gap-1 transition', muted, hover)}>
            <Home className="size-3.5" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Home</span>
          </Link>
        </li>
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
              <ChevronRight className={cn('size-3.5 shrink-0', muted)} aria-hidden="true" />
              {isLast || !item.to ? (
                <span className={cn('max-w-[16rem] truncate font-semibold', active)} aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} className={cn('transition', muted, hover)}>
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
