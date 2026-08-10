import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@lib/utils'

/** Disclosure list. `allowMultiple` lets several panels stay open at once. */
export function Accordion({ items, allowMultiple = false, defaultOpen = [], className }) {
  const [open, setOpen] = useState(new Set(defaultOpen))

  const toggle = (index) => {
    setOpen((prev) => {
      const next = new Set(allowMultiple ? prev : [])
      if (prev.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  return (
    <div className={cn('divide-y divide-ink-200/70 dark:divide-white/10', className)}>
      {items.map((item, index) => {
        const isOpen = open.has(index)
        const Icon = isOpen ? Minus : Plus

        return (
          <div key={item.q ?? index}>
            <h3>
              <button
                type="button"
                onClick={() => toggle(index)}
                aria-expanded={isOpen}
                className="group flex w-full items-center justify-between gap-6 py-5 text-left"
              >
                <span
                  className={cn(
                    'text-base font-semibold transition-colors sm:text-lg',
                    isOpen ? 'text-brand-600 dark:text-brand-400' : 'group-hover:text-brand-600 dark:group-hover:text-brand-400',
                  )}
                >
                  {item.q}
                </span>
                <span
                  className={cn(
                    'grid size-8 shrink-0 place-items-center rounded-full transition-colors',
                    isOpen
                      ? 'bg-brand-600 text-white'
                      : 'bg-ink-100 text-ink-600 group-hover:bg-brand-100 group-hover:text-brand-700 dark:bg-white/10 dark:text-ink-200 dark:group-hover:bg-brand-500/20',
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
              </button>
            </h3>
            <div
              className={cn(
                'grid transition-all duration-300 ease-out',
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
              )}
            >
              <div className="overflow-hidden">
                <p className="pb-6 pr-14 text-sm leading-relaxed text-ink-600 dark:text-ink-300 sm:text-base">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
