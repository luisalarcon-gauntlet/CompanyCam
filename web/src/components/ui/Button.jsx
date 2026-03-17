import { clsx } from 'clsx'

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-bold rounded-pill transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 select-none'

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary',
    secondary: 'bg-white text-navy border-2 border-slate-200 hover:border-primary hover:text-primary focus:ring-primary',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent text-navy hover:bg-slate-100 focus:ring-slate-300',
    ai: 'bg-ai-purple text-white hover:bg-violet-700 focus:ring-ai-purple',
    success: 'bg-success text-white hover:bg-green-700 focus:ring-success',
    yellow: 'bg-warning text-navy hover:bg-yellow-500 focus:ring-warning',
  }

  const sizes = {
    sm: 'h-10 px-4 text-sm',
    md: 'h-12 px-6 text-base',
    lg: 'h-14 px-8 text-lg',
    xl: 'h-16 px-10 text-xl',
    icon: 'h-12 w-12 p-0',
  }

  return (
    <button
      className={clsx(
        base,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        (disabled || loading) && 'opacity-60 cursor-not-allowed active:scale-100',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </>
      ) : children}
    </button>
  )
}
