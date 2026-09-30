import { Link } from 'react-router-dom'
import { cn } from '@lib/utils'

/**
 * Brand logo, served from `public/images`.
 * Two files are shipped so the wordmark stays legible on both themes:
 * `logo.svg` (dark text) and `logo-dark.svg` (light text). Swap those files
 * to rebrand — no code change needed.
 */
export function Logo({ className, showWordmark = true, to = '/', tone = 'auto', size = 'md' }) {
  const heights = {
    sm: 'h-7',
    md: 'h-9',
    lg: 'h-11',
  }
  const height = heights[size] ?? heights.md

  const src = showWordmark ? '/images/logo.jpeg' : '/images/logo.jpeg'
  const darkSrc = showWordmark ? '/images/logo.jpeg' : '/images/logo.jpeg'

  return (
    <Link
      to={to}
      className={cn('inline-flex shrink-0 items-center transition-opacity hover:opacity-85', className)}
      aria-label="Eventspady home"
    >
      {tone === 'inverse' ? (
        <img src={darkSrc} alt="Eventspady" className={cn(height, 'w-auto')} />
      ) : (
        <>
          <img src={src} alt="Eventspady" className={cn(height, 'w-auto dark:hidden')} />
          <img src={darkSrc} alt="Eventspady" className={cn(height, 'hidden w-auto dark:block')} />
        </>
      )}
    </Link>
  )
}
