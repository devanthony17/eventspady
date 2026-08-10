import { Star } from 'lucide-react'
import { cn } from '@lib/utils'

/** Read-only star rating with partial fill on the last star. */
export function Rating({ value = 0, count, size = 'md', showValue = true, className }) {
  const sizes = { sm: 'size-3.5', md: 'size-4', lg: 'size-5' }
  const starClass = sizes[size] ?? sizes.md

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div
        className="flex items-center gap-0.5"
        role="img"
        aria-label={`Rated ${value} out of 5`}
      >
        {Array.from({ length: 5 }, (_, i) => {
          const fill = Math.max(0, Math.min(1, value - i))
          return (
            <span key={i} className={cn('relative', starClass)}>
              <Star className={cn(starClass, 'absolute inset-0 text-ink-300 dark:text-white/20')} fill="currentColor" />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star className={cn(starClass, 'text-amber-400')} fill="currentColor" />
              </span>
            </span>
          )
        })}
      </div>
      {showValue && <span className="text-sm font-bold leading-none">{Number(value).toFixed(1)}</span>}
      {count != null && (
        <span className="text-xs text-ink-500 dark:text-ink-400">({count.toLocaleString()})</span>
      )}
    </div>
  )
}
