import { useState, useEffect, useCallback, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Mic, MicOff, AlertCircle, Sparkles } from 'lucide-react'
import { BottomSheet } from '../ui/BottomSheet'
import { Button } from '../ui/Button'
import { WaveformAnimation } from './WaveformAnimation'
import { ConfidenceMatchCard } from './ConfidenceMatchCard'
import { ItemSelectList } from './ItemSelectList'
import { useVoiceRecorder, blobToBase64 } from '../../hooks/useVoiceRecorder'
import { aiApi, itemsApi } from '../../services/api'
import { toast } from '../ui/toastStore'
import { AI_CONFIDENCE } from '../../constants/ai'

// US-013, US-014, US-015
export function VoiceCheckoffSheet({ isOpen, onClose, checklist, projectId }) {
  const queryClient = useQueryClient()
  const { error: recorderError, startRecording, stopRecording, cancelRecording, resetError } = useVoiceRecorder()

  const [phase, setPhase] = useState('idle')
  // idle | recording | transcribing | result | fallback | error

  const [transcription, setTranscription] = useState('')
  const [matchResult, setMatchResult] = useState(null)   // { matched_item_id, confidence, reasoning }
  const [errorMsg, setErrorMsg] = useState('')
  const [incompleteItems, setIncompleteItems] = useState([])
  const handleStartRecordingRef = useRef(null)

  const resetState = useCallback(() => {
    setPhase('idle')
    setTranscription('')
    setMatchResult(null)
    setErrorMsg('')
    resetError()
  }, [resetError])

  // Derive incomplete items from the checklist prop
  useEffect(() => {
    if (checklist?.items) {
      setIncompleteItems(checklist.items.filter(i => i.status !== 'complete'))
    }
  }, [checklist])

  // Sync recorder errors → our error phase (US-015)
  useEffect(() => {
    if (!recorderError) return

    const messages = {
      permission: "Microphone access denied. Please allow microphone in your browser settings and try again.",
      too_short: "I didn't catch that — tap the mic and try again.",
      unavailable: "Microphone is not available on this device.",
    }
    setErrorMsg(messages[recorderError] || "Recording failed. Please try again.")
    setPhase('error')
  }, [recorderError])

  // Auto-start recording when sheet opens (call via ref to avoid use-before-declare)
  useEffect(() => {
    if (isOpen) {
      resetState()
      const timer = setTimeout(() => handleStartRecordingRef.current?.(), 300)
      return () => clearTimeout(timer)
    } else {
      cancelRecording()
    }
  }, [isOpen, cancelRecording, resetState])

  // ── Voice match mutation ──────────────────────────────────────────────────
  const voiceMatchMutation = useMutation({
    mutationFn: (data) => aiApi.voiceMatch(data),
    onSuccess: (res) => {
      const data = res.data.data
      setTranscription(data.transcription || transcription)
      setMatchResult(data)

      if (!data.matched_item_id || data.confidence < AI_CONFIDENCE.GUESS) {
        setPhase('fallback')
      } else {
        setPhase('result')
      }
    },
    onError: (err) => {
      const msg = err.response?.data?.errors?.[0] || "Couldn't process audio — try again or select manually."
      setErrorMsg(msg)
      setPhase('error')
    },
  })

  // ── Complete item mutation ────────────────────────────────────────────────
  const completeMutation = useMutation({
    mutationFn: ({ itemId, data }) => itemsApi.complete(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      toast('Item checked off! ✓', 'success')
      onClose()
    },
    onError: () => toast('Failed to update item', 'error'),
  })

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleStartRecording = useCallback(async () => {
    const started = await startRecording()
    if (started) setPhase('recording')
  }, [startRecording])

  useEffect(() => {
    handleStartRecordingRef.current = handleStartRecording
  }, [handleStartRecording])

  const handleStopRecording = useCallback(async () => {
    setPhase('transcribing')
    const result = await stopRecording()

    if (!result) {
      // recorderError will trigger the useEffect above
      return
    }

    const base64 = await blobToBase64(result.blob)
    voiceMatchMutation.mutate({
      audio_data: base64,
      audio_format: result.format,
      checklist_id: checklist?.id,
    })
  }, [stopRecording, checklist])

  const handleConfirm = useCallback(() => {
    if (!matchResult?.matched_item_id) return
    completeMutation.mutate({
      itemId: matchResult.matched_item_id,
      data: {
        via: 'voice',
        transcription: transcription,
        ai_confidence: matchResult.confidence,
      },
    })
  }, [matchResult, transcription])

  const handleReject = useCallback(() => {
    setPhase('fallback')
  }, [])

  const handleManualSelect = useCallback((item) => {
    completeMutation.mutate({
      itemId: item.id,
      data: {
        via: 'voice',
        transcription: transcription,
        ai_confidence: matchResult?.confidence || null,
      },
    })
  }, [transcription, matchResult])

  const handleRetry = () => {
    resetState()
    setTimeout(() => handleStartRecording(), 100)
  }

  const matchedItem = matchResult?.matched_item_id
    ? incompleteItems.find(i => i.id === matchResult.matched_item_id)
    : null

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={() => { cancelRecording(); onClose() }}
      title={
        <span className="flex items-center gap-2">
          <Sparkles size={16} className="text-violet-500" />
          Voice Check-off
        </span>
      }
    >
      <div className="flex flex-col gap-5 pb-2">

        {/* ── RECORDING phase ── */}
        {(phase === 'idle' || phase === 'recording') && (
          <div className="flex flex-col items-center gap-5 py-4">
            <WaveformAnimation isActive={phase === 'recording'} />

            <p className="text-base font-semibold text-navy">
              {phase === 'recording' ? 'Listening…' : 'Starting…'}
            </p>
            <p className="text-sm text-muted text-center">
              Say what you just finished, e.g. "Done with the drip edge"
            </p>

            {phase === 'recording' && (
              <button
                onClick={handleStopRecording}
                className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600
                           flex items-center justify-center shadow-lg
                           active:scale-95 transition-transform"
                aria-label="Stop recording"
              >
                <div className="w-8 h-8 bg-white rounded-sm" />
              </button>
            )}

            {phase === 'idle' && (
              <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center animate-pulse">
                <Mic size={28} className="text-slate-400" />
              </div>
            )}
          </div>
        )}

        {/* ── TRANSCRIBING/ANALYZING phase ── */}
        {phase === 'transcribing' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center">
              <Sparkles size={28} className="text-violet-600 animate-pulse" />
            </div>
            <div className="w-full space-y-2">
              <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4 mx-auto" />
              <div className="h-4 bg-slate-100 rounded animate-pulse w-1/2 mx-auto" />
            </div>
            <p className="text-sm text-muted">Analyzing…</p>
          </div>
        )}

        {/* ── TRANSCRIPTION DISPLAY (always shown in result/fallback) ── */}
        {transcription && (phase === 'result' || phase === 'fallback') && (
          <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
            <p className="text-xs text-muted font-medium uppercase tracking-wide mb-1">You said</p>
            <p className="text-base text-navy italic">"{transcription}"</p>
          </div>
        )}

        {/* ── RESULT phase ── */}
        {phase === 'result' && matchedItem && matchResult && (
          <ConfidenceMatchCard
            matchedItem={matchedItem}
            confidence={matchResult.confidence}
            reasoning={matchResult.reasoning}
            onConfirm={handleConfirm}
            onReject={handleReject}
          />
        )}

        {/* ── FALLBACK phase ── */}
        {phase === 'fallback' && (
          <ItemSelectList
            items={incompleteItems}
            onSelect={handleManualSelect}
            title={
              matchResult?.matched_item_id
                ? "Which item did you actually finish?"
                : "Hmm, I didn't catch which item. Which one did you finish?"
            }
          />
        )}

        {/* ── ERROR phase (US-015) ── */}
        {phase === 'error' && (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
              {recorderError === 'permission'
                ? <MicOff size={24} className="text-red-500" />
                : <AlertCircle size={24} className="text-red-500" />
              }
            </div>
            <p className="text-base text-navy text-center font-medium">{errorMsg}</p>

            {recorderError === 'permission' ? (
              <div className="bg-slate-50 rounded-xl p-4 text-sm text-muted text-center border border-slate-200">
                Go to browser Settings → Privacy → Microphone and allow access for this site.
              </div>
            ) : (
              <div className="flex flex-col gap-2 w-full">
                <Button variant="primary" fullWidth size="lg" onClick={handleRetry}>
                  <Mic size={18} />
                  Try Again
                </Button>
                <Button variant="secondary" fullWidth onClick={() => setPhase('fallback')}>
                  Select item manually
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Cancel button (always available except when completing) */}
        {phase !== 'error' && (
          <Button
            variant="ghost"
            fullWidth
            onClick={() => { cancelRecording(); onClose() }}
            disabled={completeMutation.isPending}
          >
            Cancel
          </Button>
        )}
      </div>
    </BottomSheet>
  )
}
