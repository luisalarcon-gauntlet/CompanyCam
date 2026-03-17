import { useEffect, useRef, useState } from 'react'
import { Check, X, RefreshCw, Sparkles } from 'lucide-react'
import { clsx } from 'clsx'
import { AI_CONFIDENCE } from '../../constants/ai'
import { Button } from '../ui/Button'

const AUTO_CONFIRM_SECONDS = 2

/**
 * Renders the AI match result with confidence-appropriate UI:
 *
 * ≥ 0.90 → auto-suggest with 2-second countdown (user can cancel or confirm early)
 * 0.70–0.89 → show suggestion, require explicit tap
 * 0.50–0.69 → show as guess "My best guess: [item]" + "Is this right? Yes / No"
 * < 0.50 → no suggestion (caller should show item list instead)
 */
export function ConfidenceMatchCard({
  matchedItem,        // { id, title }
  confidence,
  reasoning,
  description,        // photo only — brief AI description
  onConfirm,          // () => void
  onReject,           // () => void — "that's wrong"
}) {
  const [countdown, setCountdown] = useState(AUTO_CONFIRM_SECONDS)
  const [confirmed, setConfirmed] = useState(false)
  const timerRef = useRef(null)

  const isAutoSuggest = confidence >= AI_CONFIDENCE.AUTO_SUGGEST
  const isSuggest     = confidence >= AI_CONFIDENCE.SUGGEST && confidence < AI_CONFIDENCE.AUTO_SUGGEST
  const isGuess       = confidence >= AI_CONFIDENCE.GUESS && confidence < AI_CONFIDENCE.SUGGEST

  // Start countdown for auto-suggest
  useEffect(() => {
    if (!isAutoSuggest || confirmed) return

    setCountdown(AUTO_CONFIRM_SECONDS)
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval)
          if (!confirmed) {
            setConfirmed(true)
            onConfirm()
          }
          return 0
        }
        return c - 1
      })
    }, 1000)

    timerRef.current = interval
    return () => clearInterval(interval)
  }, [isAutoSuggest, matchedItem?.id])

  const handleConfirm = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setConfirmed(true)
    onConfirm()
  }

  const handleReject = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    onReject()
  }

  if (!matchedItem) return null

  return (
    <div className="flex flex-col gap-4">
      {/* AI badge */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
          <Sparkles size={14} className="text-violet-600" />
        </div>
        <span className="text-sm font-semibold text-violet-700">
          {isAutoSuggest && 'Great match — confirming in…'}
          {isSuggest && 'AI found a match'}
          {isGuess && 'My best guess'}
        </span>
      </div>

      {/* Description (photo mode) */}
      {description && (
        <p className="text-sm text-muted italic leading-snug">"{description}"</p>
      )}

      {/* Matched item card */}
      <div className={clsx(
        'rounded-xl border-2 p-4',
        isAutoSuggest && 'border-violet-400 bg-violet-50',
        isSuggest && 'border-blue-300 bg-blue-50',
        isGuess && 'border-yellow-300 bg-yellow-50',
      )}>
        <p className={clsx(
          'font-bold text-lg leading-snug',
          isAutoSuggest && 'text-violet-900',
          isSuggest && 'text-blue-900',
          isGuess && 'text-yellow-900',
        )}>
          {matchedItem.title}
        </p>
        {reasoning && (
          <p className="text-sm text-muted mt-1 leading-snug">{reasoning}</p>
        )}
      </div>

      {/* Confidence bar (visual only — no raw number) */}
      <ConfidenceBar confidence={confidence} />

      {/* Actions */}
      {isAutoSuggest && (
        <div className="flex gap-3">
          <Button
            variant="ai"
            size="lg"
            fullWidth
            onClick={handleConfirm}
            disabled={confirmed}
          >
            <Check size={18} />
            Confirm now ({countdown}s)
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={handleReject}
            disabled={confirmed}
            className="flex-shrink-0"
            aria-label="That's wrong"
          >
            <X size={18} />
          </Button>
        </div>
      )}

      {isSuggest && (
        <div className="flex flex-col gap-2">
          <Button variant="ai" size="lg" fullWidth onClick={handleConfirm}>
            <Check size={18} />
            Yes, that's it
          </Button>
          <Button variant="secondary" size="lg" fullWidth onClick={handleReject}>
            <RefreshCw size={16} />
            That's wrong — pick another
          </Button>
        </div>
      )}

      {isGuess && (
        <>
          <p className="text-center text-base font-semibold text-navy">Is this right?</p>
          <div className="flex gap-3">
            <Button variant="success" size="lg" fullWidth onClick={handleConfirm}>
              <Check size={18} />
              Yes
            </Button>
            <Button variant="secondary" size="lg" fullWidth onClick={handleReject}>
              <X size={18} />
              No
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

function ConfidenceBar({ confidence }) {
  const pct = Math.round(confidence * 100)
  const color = confidence >= AI_CONFIDENCE.AUTO_SUGGEST
    ? 'bg-violet-500'
    : confidence >= AI_CONFIDENCE.SUGGEST
      ? 'bg-blue-500'
      : 'bg-yellow-400'

  return (
    <div className="flex items-center gap-2" aria-label={`Match confidence: ${pct}%`}>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-muted font-medium w-12 text-right">
        {pct >= 90 ? 'Strong' : pct >= 70 ? 'Good' : 'Low'}
      </span>
    </div>
  )
}
