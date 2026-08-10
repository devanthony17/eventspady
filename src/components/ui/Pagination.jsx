import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@lib/utils'

/** Builds a page list with ellipses, e.g. [1, '…', 4, 5, 6, '…', 12]. */
function pageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  if (start > 2) pages.push('start-ellipsis')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < total - 1) pages.push('end-ellipsis')
  pages.push(total)

  return pages
}

export function Pagination({ page, totalPages, onChange, className }) {
  if (totalPages <= 1) return null

  const go = (next) => onChange(Math.min(Math.max(1, next), totalPages))

  const buttonClass =
    'grid size-10 place-items-center rounded-xl text-sm font-semibold transition disabled:opacity-40 disabled:pointer-events-none'

  return (
    <nav className={cn('flex items-center justify-center gap-1.5', className)} aria-label="Pagination">
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className={cn(buttonClass, 'border border-ink-200 hover:bg-ink-100 dark:border-white/10 dark:hover:bg-white/10')}
      >
        <ChevronLeft className="size-4" />
      </button>

      {pageRange(page, totalPages).map((item) =>
        typeof item === 'number' ? (
          <button
            key={item}
            type="button"
            onClick={() => go(item)}
            aria-current={item === page ? 'page' : undefined}
            className={cn(
              buttonClass,
              item === page
                ? 'bg-brand-600 text-white shadow-lift'
                : 'border border-ink-200 hover:bg-ink-100 dark:border-white/10 dark:hover:bg-white/10',
            )}
          >
            {item}
          </button>
        ) : (
          <span key={item} className="grid size-10 place-items-center text-ink-400">
            …
          </span>
        ),
      )}

      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className={cn(buttonClass, 'border border-ink-200 hover:bg-ink-100 dark:border-white/10 dark:hover:bg-white/10')}
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  )
}
