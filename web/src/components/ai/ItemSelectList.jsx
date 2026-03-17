import { Check } from 'lucide-react'

/**
 * Fallback UI shown when AI confidence is too low.
 * Renders the list of incomplete items for manual selection.
 */
export function ItemSelectList({ items, onSelect, title = "Which item did you finish?" }) {
  if (!items?.length) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted">All items are already complete! 🎉</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="text-base font-semibold text-navy mb-3">{title}</p>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item)}
          className="w-full flex items-center gap-3 px-4 py-3.5 min-h-[56px] text-left
                     rounded-xl border border-slate-200 bg-white hover:bg-slate-50
                     hover:border-primary active:scale-[0.98] transition-all"
        >
          <div className="w-6 h-6 rounded-md border-2 border-slate-300 flex items-center justify-center flex-shrink-0">
            <Check size={14} className="text-transparent" />
          </div>
          <span className="text-base font-medium text-navy leading-snug flex-1">
            {item.title}
          </span>
        </button>
      ))}
    </div>
  )
}
