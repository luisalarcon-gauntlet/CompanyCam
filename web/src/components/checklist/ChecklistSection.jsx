import { useState } from 'react'
import { ChevronDown, ChevronRight, CheckCircle, Trash2 } from 'lucide-react'
import { clsx } from 'clsx'
import { ChecklistItem } from './ChecklistItem'
import { AddItemInput } from './AddItemInput'

export function ChecklistSection({ checklist, projectId, onDeleteConfirm }) {
  const [isExpanded, setIsExpanded] = useState(true)

  const items = checklist.items || []
  const incompleteItems = items.filter((i) => i.status !== 'complete')
  const completeItems = items.filter((i) => i.status === 'complete')
  const sortedItems = [...incompleteItems, ...completeItems]

  const isAllDone = checklist.is_complete

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-3">
      {/* Checklist Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={clsx(
          'w-full flex items-center gap-3 px-4 py-3 min-h-[56px] transition-colors',
          isAllDone
            ? 'bg-green-50 hover:bg-green-100'
            : 'bg-slate-50 hover:bg-slate-100'
        )}
      >
        <span className="text-muted">
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </span>

        <div className="flex-1 min-w-0 text-left">
          <h3 className="font-bold text-navy text-lg leading-tight">{checklist.name}</h3>
          <p className="text-sm text-muted">
            {checklist.completed_count} of {checklist.total_count} items
          </p>
        </div>

        {isAllDone ? (
          <span className="flex items-center gap-1 bg-green-100 text-success text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 border border-green-200">
            <CheckCircle size={14} />
            ✓ Complete
          </span>
        ) : (
          <span className="bg-slate-200 text-muted text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0">
            {checklist.completion_percentage}%
          </span>
        )}

        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDeleteConfirm(checklist)
          }}
          className="w-8 h-8 flex items-center justify-center rounded-full text-muted hover:text-red-500 hover:bg-red-50 flex-shrink-0"
          aria-label="Delete checklist"
        >
          <Trash2 size={16} />
        </button>
      </button>

      {/* Progress bar */}
      {checklist.total_count > 0 && (
        <div className="h-1.5 bg-slate-100">
          <div
            className={clsx(
              'h-full transition-all duration-700 ease-out',
              isAllDone ? 'bg-success' : 'bg-primary'
            )}
            style={{ width: `${checklist.completion_percentage}%` }}
          />
        </div>
      )}

      {/* Items */}
      {isExpanded && (
        <div>
          {sortedItems.length === 0 ? (
            <p className="px-4 py-6 text-center text-muted text-sm">
              No items yet — add one below
            </p>
          ) : (
            sortedItems.map((item) => (
              <ChecklistItem key={item.id} item={item} projectId={projectId} />
            ))
          )}
          <AddItemInput checklistId={checklist.id} projectId={projectId} />
        </div>
      )}
    </div>
  )
}
