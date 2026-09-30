import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@context/ThemeContext'
import { cn } from '@lib/utils'

/**
 * Modern, accessible Theme Toggle Color Switch.
 *
 * Supports two presentation variants:
 * - 'switch': Interactive pill-shaped color switch with daylight/nightlight track and sliding thumb.
 * - 'icon': Compact rounded icon button with vibrant amber/indigo reactive colors and halo glows.
 *
 * Automatically detects 'icon' mode when fixed square dimensions (e.g. `size-9` or `grid`) are passed in `className`.
 */
export function ThemeToggle({ className, variant = 'switch' }) {
  const { isDark, toggleTheme } = useTheme()

  // Auto-detect icon mode if specified or if fixed square size / grid class is passed
  const isIcon =
    variant === 'icon' ||
    (variant !== 'switch' && className && /\b(size-\w+|grid)\b/.test(className))

  if (isIcon) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className={cn(
          'group relative grid size-10 place-items-center rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
          isDark
            ? 'text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/25 hover:border-indigo-400/40 hover:shadow-[0_0_12px_rgba(99,102,241,0.25)]'
            : 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 hover:border-amber-400/50 hover:shadow-[0_0_12px_rgba(245,158,11,0.25)]',
          className,
        )}
      >
        <Sun
          className={cn(
            'absolute size-5 transition-all duration-300 text-amber-500',
            isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100 group-hover:rotate-45',
          )}
        />
        <Moon
          className={cn(
            'absolute size-5 transition-all duration-300 text-indigo-400',
            isDark ? 'rotate-0 scale-100 opacity-100 group-hover:-rotate-12' : '-rotate-90 scale-0 opacity-0',
          )}
        />
      </button>
    )
  }

  // Pill Color Switch
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'group relative inline-flex h-8 w-16 shrink-0 cursor-pointer items-center rounded-full p-1 transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-ink-950',
        isDark
          ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/40 shadow-inner shadow-black/50 hover:border-indigo-400/70 hover:shadow-[0_0_14px_rgba(99,102,241,0.3)]'
          : 'bg-gradient-to-r from-amber-200/90 via-amber-100 to-sky-200/90 border border-amber-300/80 shadow-inner hover:border-amber-400 hover:shadow-[0_0_14px_rgba(245,158,11,0.3)]',
        className,
      )}
    >
      {/* Left indicator (Sun in light mode / dormant in dark) */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute left-2 transition-all duration-300 pointer-events-none',
          isDark ? 'opacity-35 scale-75 text-indigo-300' : 'opacity-0 scale-50',
        )}
      >
        <Sun className="size-3.5" />
      </span>

      {/* Right indicator (Moon in dark mode / dormant in light) */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute right-2 transition-all duration-300 pointer-events-none',
          isDark ? 'opacity-0 scale-50' : 'opacity-40 scale-75 text-amber-700',
        )}
      >
        <Moon className="size-3.5" />
      </span>

      {/* Sliding Color Thumb */}
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none grid size-6 place-items-center rounded-full shadow-md transition-all duration-300 ease-out',
          isDark
            ? 'translate-x-8 bg-ink-950 border border-indigo-400/40 text-indigo-300 shadow-indigo-950/60'
            : 'translate-x-0 bg-white border border-amber-200 text-amber-500 shadow-amber-500/25',
        )}
      >
        {isDark ? (
          <Moon className="size-3.5 transition-transform duration-300 group-hover:-rotate-12" />
        ) : (
          <Sun className="size-3.5 transition-transform duration-300 group-hover:rotate-45" />
        )}
      </span>
    </button>
  )
}
