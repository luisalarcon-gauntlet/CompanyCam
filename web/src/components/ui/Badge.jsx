import { clsx } from 'clsx'
import { TRADE_EMOJI, TRADE_LABEL } from '../../constants/ai'

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    primary: 'bg-blue-100 text-primary',
    success: 'bg-green-100 text-success',
    warning: 'bg-yellow-100 text-yellow-700',
    ai: 'bg-violet-100 text-ai-purple',
    danger: 'bg-red-100 text-red-700',
  }

  return (
    <span className={clsx(
      'inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-sm font-semibold',
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}

export function TradeBadge({ tradeType, className = '' }) {
  const emoji = TRADE_EMOJI[tradeType] || '🔩'
  const label = TRADE_LABEL[tradeType] || tradeType || 'Other'
  return (
    <Badge variant="primary" className={className}>
      {emoji} {label}
    </Badge>
  )
}
