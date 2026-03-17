import { clsx } from 'clsx'
import { forwardRef } from 'react'

export const Input = forwardRef(function Input({
  label,
  error,
  hint,
  className = '',
  containerClassName = '',
  ...props
}, ref) {
  return (
    <div className={clsx('flex flex-col gap-1', containerClassName)}>
      {label && (
        <label className="text-sm font-semibold text-navy">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={clsx(
          'w-full h-12 px-4 rounded-xl border-2 text-base text-navy bg-white',
          'transition-colors duration-150',
          'focus:outline-none focus:border-primary',
          'placeholder:text-muted',
          error
            ? 'border-red-400 focus:border-red-500'
            : 'border-slate-200 hover:border-slate-300',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 font-medium">{error}</p>
      )}
      {hint && !error && (
        <p className="text-sm text-muted">{hint}</p>
      )}
    </div>
  )
})
