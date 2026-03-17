import { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { itemsApi } from '../../services/api'
import { toast } from '../ui/toastStore'

export function AddItemInput({ checklistId, projectId }) {
  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState('')
  const inputRef = useRef(null)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (itemTitle) => itemsApi.create(checklistId, { title: itemTitle }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      setTitle('')
      inputRef.current?.focus()
    },
    onError: () => toast('Failed to add item', 'error'),
  })

  const handleStartAdding = () => {
    setIsAdding(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleSubmit = (e) => {
    e?.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) {
      setIsAdding(false)
      return
    }
    mutation.mutate(trimmed)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === 'Escape') {
      setTitle('')
      setIsAdding(false)
    }
  }

  if (isAdding) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-3 border-t border-slate-100">
        <div className="w-7 h-7 rounded-lg border-2 border-dashed border-slate-300 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (!title.trim()) setIsAdding(false)
          }}
          placeholder="Type item name, press Enter..."
          className="flex-1 text-base text-navy placeholder:text-muted focus:outline-none bg-transparent"
          disabled={mutation.isPending}
        />
        <button
          type="submit"
          disabled={!title.trim() || mutation.isPending}
          className="text-primary font-semibold text-sm disabled:opacity-40"
        >
          Add
        </button>
      </form>
    )
  }

  return (
    <button
      onClick={handleStartAdding}
      className="flex items-center gap-2 px-4 py-3 w-full text-left border-t border-slate-100 text-muted hover:text-primary hover:bg-slate-50 transition-colors min-h-[48px]"
    >
      <Plus size={18} />
      <span className="text-sm font-medium">Add item</span>
    </button>
  )
}
