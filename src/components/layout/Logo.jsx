import { Link } from 'react-router-dom'
import { cn } from '@lib/utils'

/**
 * Brand logo:
 * - `logo-light.webp` for light theme backgrounds.
 * - `logo-dark.webp` for dark theme backgrounds.
 */
export function Logo({ className, showWordmark = true, to = '/', tone = 'auto', size = 'md' }) {
  const heights = {
    sm: 'h-7',
    md: 'h-9',
    lg: 'h-11',
  }
  const height = heights[size] ?? heights.md

  const src = '/images/logo-light.webp'
  const darkSrc = '/images/logo-dark.webp'

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
