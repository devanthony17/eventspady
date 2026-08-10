import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@lib/utils'

export function StatCard({ label, value, delta, icon: Icon, tone = 'brand', className }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300',
    accent: 'bg-accent-50 text-accent-600 dark:bg-accent-500/15 dark:text-accent-300',
    success: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
    info: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300',
  }

  const isUp = delta != null && delta >= 0
  const DeltaIcon = isUp ? TrendingUp : TrendingDown

  return (
    <div className={cn('surface p-5', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink-500 dark:text-ink-400">{label}</p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">{value}</p>
        </div>
        {Icon && (
          <span className={cn('grid size-11 shrink-0 place-items-center rounded-xl', tones[tone] ?? tones.brand)}>
            <Icon className="size-5" aria-hidden="true" />
          </span>
        )}
      </div>

      {delta != null && (
        <p
          className={cn(
            'mt-3 inline-flex items-center gap-1 text-xs font-semibold',
            isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
          )}
        >
          <DeltaIcon className="size-3.5" aria-hidden="true" />
          {isUp ? '+' : ''}
          {delta}%
          <span className="font-medium text-ink-400 dark:text-ink-500">vs last month</span>
        </p>
      )}
    </div>
  )
}
