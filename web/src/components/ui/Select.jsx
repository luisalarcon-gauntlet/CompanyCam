import { clsx } from 'clsx'

export function Select({ label, error, options = [], placeholder, className = '', containerClassName = '', ...props }) {
  return (
    <div className={clsx('flex flex-col gap-1', containerClassName)}>
      {label && (
        <label className="text-sm font-semibold text-navy">{label}</label>
      )}
      <div className="relative">
        <select
          className={clsx(
            'w-full h-12 px-4 pr-10 rounded-xl border-2 text-base text-navy bg-white appearance-none',
            'transition-colors duration-150',
            'focus:outline-none focus:border-primary',
            error ? 'border-red-400' : 'border-slate-200 hover:border-slate-300',
            !props.value && 'text-muted',
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.emoji ? `${opt.emoji} ` : ''}{opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted">
          ▼
        </div>
      </div>
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
    </div>
  )
}
