import { Link } from 'react-router-dom'
import { cn } from '@lib/utils'

/**
 * Inline SVG mark + wordmark so the logo inherits theme colours
 * without a second network request.
 */
export function Logo({ className, showWordmark = true, to = '/', tone = 'default' }) {
  const wordColor =
    tone === 'inverse' ? 'text-white' : 'text-ink-900 dark:text-white'

  return (
    <Link to={to} className={cn('group inline-flex items-center gap-2.5', className)} aria-label="Eventspady home">
      <span className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 shadow-lift transition-transform duration-300 group-hover:scale-105">
        <svg viewBox="0 0 64 64" className="size-6" aria-hidden="true">
          <path
            d="M20 21h24a3 3 0 0 1 3 3v5a5 5 0 0 0 0 10v5a3 3 0 0 1-3 3H20a3 3 0 0 1-3-3v-5a5 5 0 0 0 0-10v-5a3 3 0 0 1 3-3Z"
            fill="white"
            fillOpacity=".95"
          />
          <path
            d="M32 21v3m0 5v3m0 5v3m0 5v3"
            stroke="#0038bd"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeDasharray="3 4"
          />
        </svg>
      </span>

      {showWordmark && (
        <span className={cn('text-lg font-extrabold tracking-tight', wordColor)}>
          Events<span className="text-brand-600 dark:text-brand-400">pady</span>
        </span>
      )}
    </Link>
  )
}
