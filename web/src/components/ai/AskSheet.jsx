import { useState, useRef, useCallback, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Send, Mic, MicOff, Sparkles, AlertCircle } from 'lucide-react'
import { BottomSheet } from '../ui/BottomSheet'
import { Button } from '../ui/Button'
import { useVoiceRecorder, blobToBase64 } from '../../hooks/useVoiceRecorder'
import { aiApi } from '../../services/api'
import { toast } from '../ui/toastStore'

const QUICK_QUESTIONS = [
  "What's next?",
  "What's left?",
  "Am I done?",
  "What did I finish today?",
]

const MAX_HISTORY = 3

// US-020
export function AskSheet({ isOpen, onClose, projectId }) {
  const { isRecording, error: recorderError, startRecording, stopRecording, cancelRecording, resetError } = useVoiceRecorder()
  const inputRef = useRef(null)

  const [question, setQuestion] = useState('')
  const [history, setHistory] = useState([])   // [{ q, a }] last 3 exchanges
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [voiceError, setVoiceError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      setQuestion('')
      setVoiceError(null)
      resetError()
    } else {
      cancelRecording()
    }
  }, [isOpen])

  // Show voice errors
  useEffect(() => {
    if (!recorderError) return
    const messages = {
      permission: "Microphone access denied.",
      too_short: "Didn't catch that — try again.",
      unavailable: "Microphone unavailable.",
    }
    setVoiceError(messages[recorderError] || "Voice input failed.")
  }, [recorderError])

  // ── Ask mutation ──────────────────────────────────────────────────────────
  const askMutation = useMutation({
    mutationFn: (q) => aiApi.ask({ question: q, project_id: projectId }),
    onSuccess: (res, sentQuestion) => {
      const answer = res.data.data.answer
      setHistory(prev => {
        const next = [...prev, { q: sentQuestion, a: answer }]
        return next.slice(-MAX_HISTORY)
      })
      setQuestion('')
    },
    onError: (err) => {
      const msg = err.response?.data?.errors?.[0] || "Couldn't get an answer — please try again."
      toast(msg, 'error')
    },
  })

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleAsk = useCallback((q) => {
    const text = (q || question).trim()
    if (!text) return
    askMutation.mutate(text)
  }, [question, askMutation])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAsk()
    }
  }

  const handleVoiceToggle = useCallback(async () => {
    setVoiceError(null)
    resetError()

    if (isRecording) {
      setIsTranscribing(true)
      const result = await stopRecording()
      setIsTranscribing(false)

      if (!result) return   // recorderError useEffect will handle

      const base64 = await blobToBase64(result.blob)

      // Use voice-match endpoint with transcription only mode — get the transcription back
      try {
        // We need Whisper just for transcription; reuse the voice-match endpoint
        // and read the transcription field back from the response
        const res = await aiApi.voiceMatch({
          audio_data: base64,
          audio_format: result.format,
          checklist_id: null,   // no checklist — we only want transcription
        })
        const transcript = res.data.data?.transcription
        if (transcript) {
          setQuestion(transcript)
          setTimeout(() => inputRef.current?.focus(), 50)
        }
      } catch {
        // If that fails, fall back to letting user type
        setVoiceError("Couldn't transcribe — type your question instead.")
      }
    } else {
      await startRecording()
    }
  }, [isRecording, startRecording, stopRecording])

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={() => { cancelRecording(); onClose() }}
      title={
        <span className="flex items-center gap-2">
          <Sparkles size={16} className="text-violet-500" />
          Ask AI
        </span>
      }
    >
      <div className="flex flex-col gap-4 pb-2">

        {/* Conversation history */}
        {history.length > 0 && (
          <div className="flex flex-col gap-3 max-h-64 overflow-y-auto">
            {history.map((exchange, i) => (
              <div key={i} className="flex flex-col gap-2">
                {/* Question bubble */}
                <div className="flex justify-end">
                  <div className="bg-primary text-white rounded-2xl rounded-tr-md px-4 py-2.5 max-w-[80%]">
                    <p className="text-sm font-medium leading-snug">{exchange.q}</p>
                  </div>
                </div>
                {/* Answer bubble */}
                <div className="flex justify-start">
                  <div className="bg-violet-50 border border-violet-200 rounded-2xl rounded-tl-md px-4 py-2.5 max-w-[85%]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Sparkles size={12} className="text-violet-500" />
                      <span className="text-xs font-semibold text-violet-600">AI</span>
                    </div>
                    <p className="text-sm text-navy leading-snug">{exchange.a}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Thinking indicator */}
            {askMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-violet-50 border border-violet-200 rounded-2xl rounded-tl-md px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-violet-500 animate-pulse" />
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 150}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick question chips */}
        {history.length === 0 && !askMutation.isPending && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted font-medium uppercase tracking-wide">Quick questions</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleAsk(q)}
                  className="px-4 py-2 bg-violet-50 border border-violet-200 rounded-full
                             text-sm font-medium text-violet-700 hover:bg-violet-100
                             active:scale-95 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Voice error */}
        {voiceError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600">{voiceError}</p>
          </div>
        )}

        {/* Input area */}
        <div className="flex items-end gap-2">
          {/* Voice toggle */}
          <button
            onClick={handleVoiceToggle}
            disabled={isTranscribing || askMutation.isPending}
            className={`w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center
                        transition-all active:scale-95
                        ${isRecording
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-violet-100 text-violet-600 hover:bg-violet-200'
                        }`}
            aria-label={isRecording ? 'Stop voice input' : 'Start voice input'}
          >
            {isTranscribing
              ? <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              : isRecording
                ? <MicOff size={20} />
                : <Mic size={20} />
            }
          </button>

          {/* Text input */}
          <div className="flex-1 flex items-end border border-slate-200 rounded-2xl overflow-hidden bg-white">
            <textarea
              ref={inputRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about this project…"
              rows={1}
              className="flex-1 px-4 py-3 text-base text-navy placeholder-muted resize-none
                         focus:outline-none max-h-28 overflow-y-auto"
              style={{ minHeight: '48px' }}
              aria-label="Ask a question"
            />
            <button
              onClick={() => handleAsk()}
              disabled={!question.trim() || askMutation.isPending}
              className="w-12 h-12 flex items-center justify-center flex-shrink-0
                         text-primary disabled:text-slate-300 hover:text-primary-dark
                         transition-colors"
              aria-label="Send question"
            >
              <Send size={20} />
            </button>
          </div>
        </div>

        {/* Recording indicator */}
        {isRecording && (
          <p className="text-center text-sm text-red-500 font-medium animate-pulse">
            🎤 Listening… tap mic to stop
          </p>
        )}

        <p className="text-xs text-muted text-center">
          ✦ AI answers are read-only and never modify your checklist
        </p>
      </div>
    </BottomSheet>
  )
}
