import { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, Trash2, MoreVertical, Mic, Camera, Clock, ZoomIn } from 'lucide-react'
import { clsx } from 'clsx'
import { itemsApi } from '../../services/api'
import { useOfflineStore } from '../../stores/offlineStore'
import { useNetworkStatus } from '../../hooks/useNetworkStatus'
import { ItemDetailSheet } from './ItemDetailSheet'
import { toast } from '../ui/toastStore'

function relativeTime(dateString) {
  if (!dateString) return ''
  const now = Date.now()
  const then = new Date(dateString).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay === 1) return 'yesterday'
  if (diffDay < 7) return `${diffDay}d ago`
  return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function ChecklistItem({ item, projectId }) {
  const queryClient = useQueryClient()
  const isOnline = useNetworkStatus()
  const { pendingItemIds, syncedItemIds, queueAction } = useOfflineStore()
  const [showMenu, setShowMenu] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [longPressTimer, setLongPressTimer] = useState(null)
  const [showFullPhoto, setShowFullPhoto] = useState(false)
  const menuRef = useRef(null)

  const isPending = pendingItemIds.has(item.id)
  const justSynced = syncedItemIds.has(item.id)

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['project', projectId] })
  }

  const completeMutation = useMutation({
    mutationFn: () => itemsApi.complete(item.id, { via: 'manual' }),
    onSuccess: () => { invalidate(); toast('Item completed!') },
    onError: () => toast('Failed to update item', 'error'),
  })

  const uncompleteMutation = useMutation({
    mutationFn: () => itemsApi.uncomplete(item.id),
    onSuccess: () => { invalidate() },
    onError: () => toast('Failed to update item', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => itemsApi.delete(item.id),
    onSuccess: () => { invalidate(); toast('Item deleted') },
    onError: () => toast('Failed to delete item', 'error'),
  })

  const handleCheckboxClick = async () => {
    if (item.status === 'complete') {
      if (isOnline) {
        uncompleteMutation.mutate()
      } else {
        await queueAction({ type: 'UNCOMPLETE_ITEM', itemId: item.id })
        invalidate()
        toast('Change queued — will sync when online')
      }
    } else {
      if (isOnline) {
        completeMutation.mutate()
      } else {
        await queueAction({ type: 'COMPLETE_ITEM', itemId: item.id, via: 'manual' })
        invalidate()
        toast('Change queued — will sync when online')
      }
    }
  }

  const handleItemTap = () => {
    if (item.status === 'complete') {
      setShowDetail(true)
    }
  }

  const handleLongPressStart = () => {
    const timer = setTimeout(() => setShowMenu(true), 500)
    setLongPressTimer(timer)
  }

  const handleLongPressEnd = () => {
    if (longPressTimer) clearTimeout(longPressTimer)
  }

  const isComplete = item.status === 'complete'
  const isLoading = completeMutation.isPending || uncompleteMutation.isPending

  const completedViaIcon = {
    voice: <Mic size={12} />,
    photo: <Camera size={12} />,
    manual: <Check size={12} />,
  }

  return (
    <>
      <div
        className={clsx(
          'flex items-start gap-3 px-4 py-3 min-h-[56px] relative group',
          'border-b border-slate-100 last:border-0',
          isComplete && 'opacity-70'
        )}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
      >
        {/* Checkbox */}
        <button
          onClick={handleCheckboxClick}
          disabled={isLoading}
          aria-label={isComplete ? 'Uncheck item' : 'Check item'}
          className={clsx(
            'flex-shrink-0 w-7 h-7 mt-0.5 rounded-lg border-2 flex items-center justify-center',
            'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
            isComplete
              ? 'bg-success border-success'
              : 'border-slate-300 hover:border-primary bg-white',
            isLoading && 'opacity-50'
          )}
        >
          {isComplete && <Check size={15} strokeWidth={3} className="text-white" />}
        </button>

        {/* Content — tappable for completed items */}
        <div
          className={clsx('flex-1 min-w-0 pt-0.5', isComplete && 'cursor-pointer')}
          onClick={handleItemTap}
        >
          <span className={clsx(
            'text-base font-medium leading-snug block',
            isComplete ? 'line-through text-muted' : 'text-navy'
          )}>
            {item.title}
          </span>

          {/* Metadata for completed items */}
          {isComplete && item.completed_at && (
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {item.completed_via && (
                <span className="inline-flex items-center gap-1 text-xs text-muted bg-slate-100 px-2 py-0.5 rounded-full capitalize">
                  {completedViaIcon[item.completed_via]}
                  {item.completed_via}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-xs text-muted">
                <Clock size={10} />
                {relativeTime(item.completed_at)}
              </span>
            </div>
          )}

          {/* Voice transcription */}
          {isComplete && item.voice_transcription && (
            <p className="text-sm text-slate-400 italic mt-1 truncate">
              &ldquo;{item.voice_transcription}&rdquo;
            </p>
          )}
        </div>

        {/* Offline sync badges */}
        {isPending && (
          <span className="flex-shrink-0 text-base" title="Pending sync">⏳</span>
        )}
        {justSynced && (
          <span className="flex-shrink-0 text-base animate-fade-in" title="Synced">✓</span>
        )}

        {/* Photo thumbnail */}
        {item.photo_thumbnail_url && (
          <button
            onClick={() => setShowFullPhoto(true)}
            className="relative flex-shrink-0 group"
            aria-label="View completion photo"
          >
            <img
              src={item.photo_thumbnail_url}
              alt="Completion photo"
              className="w-14 h-14 rounded-lg object-cover border border-slate-200 group-hover:opacity-80 transition-opacity"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn size={14} className="text-white drop-shadow" />
            </div>
          </button>
        )}

        {/* Menu button — always visible on mobile, hover-only on desktop */}
        <button
          onClick={() => setShowMenu(true)}
          className="w-8 h-8 flex items-center justify-center rounded-full text-muted hover:bg-slate-100 flex-shrink-0 xl:opacity-0 xl:group-hover:opacity-100 xl:transition-opacity"
          aria-label="Item options"
        >
          <MoreVertical size={16} />
        </button>

        {/* Full-screen photo viewer */}
        {showFullPhoto && item.photo_url && (
          <div
            className="fixed inset-0 z-[60] bg-black flex flex-col"
            onClick={() => setShowFullPhoto(false)}
          >
            <div className="flex items-center justify-between px-4 py-3 bg-black/60">
              <div>
                <p className="text-white font-semibold text-sm leading-tight">{item.title}</p>
                {item.completed_at && (
                  <p className="text-slate-400 text-xs mt-0.5">
                    Completed via {item.completed_via || 'photo'} &bull;{' '}
                    {new Date(item.completed_at).toLocaleString(undefined, {
                      month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowFullPhoto(false)}
                className="w-10 h-10 flex items-center justify-center text-white text-xl"
                aria-label="Close photo"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center p-4">
              <img
                src={item.photo_url}
                alt={`${item.title} completion photo`}
                className="max-w-full max-h-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}

        {/* Context menu */}
        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />
            <div
              ref={menuRef}
              className="absolute right-2 top-10 z-50 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden min-w-[160px]"
            >
              <button
                onClick={() => {
                  setShowMenu(false)
                  deleteMutation.mutate()
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 text-base font-medium"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </>
        )}
      </div>

      {/* Item Detail Sheet (US-023) */}
      <ItemDetailSheet
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        item={item}
      />
    </>
  )
}
