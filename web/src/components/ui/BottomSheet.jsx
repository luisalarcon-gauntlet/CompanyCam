import { useEffect } from 'react'
import { X } from 'lucide-react'

export function BottomSheet({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('sheet-open')
    } else {
      document.body.classList.remove('sheet-open')
    }
    return () => document.body.classList.remove('sheet-open')
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="relative bg-white rounded-t-2xl animate-slide-up max-h-[90vh] overflow-hidden flex flex-col" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
          <div className="w-10 h-1.5 bg-slate-200 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-100 flex-shrink-0">
            <h2 className="text-lg font-bold text-navy">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-muted"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-4">
          {children}
        </div>
      </div>
    </div>
  )
}
