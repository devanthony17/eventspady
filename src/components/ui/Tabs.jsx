import { cn } from '@lib/utils'

/**
 * Controlled tab strip. `tabs`: [{ id, label, icon?, count? }].
 * Scrolls horizontally on narrow screens rather than wrapping.
 */
export function Tabs({ tabs, active, onChange, className, variant = 'underline' }) {
  const isPill = variant === 'pill'

  return (
    <div
      role="tablist"
      className={cn(
        'no-scrollbar flex gap-1 overflow-x-auto',
        isPill
          ? 'rounded-2xl bg-ink-100 p-1 dark:bg-white/[.06]'
          : 'border-b border-ink-200/70 dark:border-white/10',
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active
        const Icon = tab.icon

        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative flex shrink-0 items-center gap-2 whitespace-nowrap text-sm font-semibold transition',
              isPill
                ? cn(
                    'rounded-xl px-4 py-2',
                    isActive
                      ? 'bg-white text-ink-900 shadow-sm dark:bg-ink-800 dark:text-white'
                      : 'text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-white',
                  )
                : cn(
                    '-mb-px border-b-2 px-4 py-3',
                    isActive
                      ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                      : 'border-transparent text-ink-500 hover:border-ink-300 hover:text-ink-800 dark:text-ink-400 dark:hover:text-white',
                  ),
            )}
          >
            {Icon && <Icon className="size-4" aria-hidden="true" />}
            {tab.label}
            {tab.count != null && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[11px] font-bold leading-none',
                  isActive
                    ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/25 dark:text-brand-200'
                    : 'bg-ink-100 text-ink-600 dark:bg-white/10 dark:text-ink-300',
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
