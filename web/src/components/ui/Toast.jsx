import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'
import { clsx } from 'clsx'
import { useToastStore } from './toastStore'

function ToastItem({ id, message, type }) {
  const remove = useToastStore((s) => s.remove)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => remove(id), 300)
    }, 3500)
    return () => clearTimeout(timer)
  }, [id, remove])

  const icons = {
    success: <CheckCircle size={18} className="text-success" />,
    error: <XCircle size={18} className="text-red-500" />,
    warning: <AlertCircle size={18} className="text-warning" />,
  }

  return (
    <div className={clsx(
      'flex items-center gap-3 bg-navy-mid text-white px-4 py-3 rounded-xl shadow-lg max-w-sm',
      'transition-all duration-300',
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
    )}>
      {icons[type]}
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button onClick={() => { setVisible(false); setTimeout(() => remove(id), 300) }}
              className="text-white/50 hover:text-white">
        <X size={16} />
      </button>
    </div>
  )
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  return (
    <div className="fixed bottom-24 left-0 right-0 z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem {...t} />
        </div>
      ))}
    </div>
  )
}
