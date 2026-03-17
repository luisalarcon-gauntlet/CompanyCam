import { clsx } from 'clsx'

export function Card({ children, className = '', onClick, ...props }) {
  const Component = onClick ? 'button' : 'div'
  return (
    <Component
      className={clsx(
        'bg-white rounded-xl border border-slate-200 p-4',
        onClick && 'w-full text-left active:scale-99 transition-transform cursor-pointer hover:border-primary/30 hover:shadow-sm',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  )
}
