import { forwardRef, useId } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@lib/utils'

function Wrapper({ id, label, hint, error, required, children, className }) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={id} className="label">
          {label}
          {required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-ink-500 dark:text-ink-400">{hint}</p>
      )}
    </div>
  )
}

export const Input = forwardRef(function Input(
  { label, hint, error, className, wrapperClassName, icon: Icon, required, ...props },
  ref,
) {
  const autoId = useId()
  const id = props.id ?? autoId

  return (
    <Wrapper id={id} label={label} hint={hint} error={error} required={required} className={wrapperClassName}>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
        )}
        <input
          ref={ref}
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          className={cn('field', Icon && 'pl-10', error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/25', className)}
          {...props}
        />
      </div>
    </Wrapper>
  )
})

export const Textarea = forwardRef(function Textarea(
  { label, hint, error, className, wrapperClassName, required, rows = 4, ...props },
  ref,
) {
  const autoId = useId()
  const id = props.id ?? autoId

  return (
    <Wrapper id={id} label={label} hint={hint} error={error} required={required} className={wrapperClassName}>
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        className={cn('field resize-y', error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/25', className)}
        {...props}
      />
    </Wrapper>
  )
})

export const Select = forwardRef(function Select(
  { label, hint, error, className, wrapperClassName, children, required, ...props },
  ref,
) {
  const autoId = useId()
  const id = props.id ?? autoId

  return (
    <Wrapper id={id} label={label} hint={hint} error={error} required={required} className={wrapperClassName}>
      <div className="relative">
        <select
          ref={ref}
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          className={cn('field cursor-pointer appearance-none pr-10', className)}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
      </div>
    </Wrapper>
  )
})

export const Checkbox = forwardRef(function Checkbox({ label, description, className, ...props }, ref) {
  const autoId = useId()
  const id = props.id ?? autoId

  return (
    <div className={cn('flex items-start gap-3', className)}>
      <span className="relative mt-0.5 flex size-5 shrink-0 items-center justify-center">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          className="peer size-5 cursor-pointer appearance-none rounded-md border border-ink-300 bg-white transition checked:border-brand-600 checked:bg-brand-600 dark:border-white/20 dark:bg-white/5"
          {...props}
        />
        <Check className="pointer-events-none absolute size-3.5 text-white opacity-0 transition peer-checked:opacity-100" strokeWidth={3} aria-hidden="true" />
      </span>
      {(label || description) && (
        <label htmlFor={id} className="cursor-pointer select-none text-sm leading-snug">
          <span className="font-medium text-ink-800 dark:text-ink-100">{label}</span>
          {description && <span className="mt-0.5 block text-xs text-ink-500 dark:text-ink-400">{description}</span>}
        </label>
      )}
    </div>
  )
})

export function Switch({ checked, onChange, label, description, id: providedId, disabled }) {
  const autoId = useId()
  const id = providedId ?? autoId

  return (
    <div className="flex items-center justify-between gap-4">
      {(label || description) && (
        <label htmlFor={id} className="cursor-pointer select-none">
          <span className="text-sm font-semibold text-ink-800 dark:text-ink-100">{label}</span>
          {description && <span className="mt-0.5 block text-xs text-ink-500 dark:text-ink-400">{description}</span>}
        </label>
      )}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50',
          checked ? 'bg-brand-600' : 'bg-ink-300 dark:bg-white/20',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform',
            checked ? 'translate-x-[1.375rem]' : 'translate-x-0.5',
          )}
        />
      </button>
    </div>
  )
}
