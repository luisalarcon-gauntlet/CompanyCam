import { useState, useRef, useCallback, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Camera, ImageIcon, Sparkles, AlertCircle, ZoomIn } from 'lucide-react'
import { BottomSheet } from '../ui/BottomSheet'
import { Button } from '../ui/Button'
import { ConfidenceMatchCard } from './ConfidenceMatchCard'
import { ItemSelectList } from './ItemSelectList'
import { aiApi, uploadsApi, itemsApi } from '../../services/api'
import { fileToBase64 } from '../../hooks/useVoiceRecorder'
import { toast } from '../ui/toastStore'
import { AI_CONFIDENCE } from '../../constants/ai'

// US-016, US-017, US-018
export function PhotoCheckoffSheet({ isOpen, onClose, checklist, projectId }) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  const [phase, setPhase] = useState('pick')
  // pick | analyzing | result | fallback | error

  const [photoPreview, setPhotoPreview] = useState(null)   // data URL for preview
  const [photoBase64, setPhotoBase64] = useState(null)      // raw base64 (no prefix)
  const [photoMediaType, setPhotoMediaType] = useState('image/jpeg')
  const [matchResult, setMatchResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [fullscreenPhoto, setFullscreenPhoto] = useState(false)

  const incompleteItems = checklist?.items?.filter(i => i.status !== 'complete') || []

  useEffect(() => {
    if (isOpen) {
      setPhase('pick')
      setPhotoPreview(null)
      setPhotoBase64(null)
      setMatchResult(null)
      setErrorMsg('')
      setFullscreenPhoto(false)
    }
  }, [isOpen])

  // ── Photo match mutation ──────────────────────────────────────────────────
  const photoMatchMutation = useMutation({
    mutationFn: (data) => aiApi.photoMatch(data),
    onSuccess: (res) => {
      const data = res.data.data
      setMatchResult(data)

      if (!data.matched_item_id || data.confidence < AI_CONFIDENCE.GUESS) {
        setPhase('fallback')
      } else {
        setPhase('result')
      }
    },
    onError: (err) => {
      const msg = err.response?.data?.errors?.[0] || "Couldn't analyze photo — try again or select manually."
      setErrorMsg(msg)
      setPhase('error')
    },
  })

  // ── Upload + complete mutation ────────────────────────────────────────────
  const uploadAndCompleteMutation = useMutation({
    mutationFn: async ({ itemId, confidence }) => {
      // 1. Upload photo to get permanent URL
      const uploadRes = await uploadsApi.photo(photoBase64, photoMediaType)
      const { url, thumbnail_url } = uploadRes.data.data

      // 2. Mark item complete with photo URLs
      return itemsApi.complete(itemId, {
        via: 'photo',
        photo_url: url,
        photo_thumbnail_url: thumbnail_url,
        ai_confidence: confidence,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      toast('Item checked off with photo! 📷', 'success')
      onClose()
    },
    onError: () => toast('Failed to save photo', 'error'),
  })

  // ── Handlers ─────────────────────────────────────────────────────────────
  const processPhoto = useCallback(async (file) => {
    if (!file) return

    setPhase('analyzing')

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    setPhotoPreview(previewUrl)
    setPhotoMediaType(file.type || 'image/jpeg')

    // Convert to base64
    const base64 = await fileToBase64(file)
    setPhotoBase64(base64)

    // Call AI
    photoMatchMutation.mutate({
      image_data: base64,
      image_media_type: file.type || 'image/jpeg',
      checklist_id: checklist?.id,
    })
  }, [checklist])

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) processPhoto(file)
    e.target.value = ''   // allow re-selecting same file
  }

  const handleConfirm = useCallback(() => {
    if (!matchResult?.matched_item_id) return
    uploadAndCompleteMutation.mutate({
      itemId: matchResult.matched_item_id,
      confidence: matchResult.confidence,
    })
  }, [matchResult])

  const handleReject = useCallback(() => setPhase('fallback'), [])

  const handleManualSelect = useCallback((item) => {
    uploadAndCompleteMutation.mutate({
      itemId: item.id,
      confidence: matchResult?.confidence || null,
    })
  }, [matchResult])

  const matchedItem = matchResult?.matched_item_id
    ? incompleteItems.find(i => i.id === matchResult.matched_item_id)
    : null

  const isCompleting = uploadAndCompleteMutation.isPending

  return (
    <>
      <BottomSheet
        isOpen={isOpen}
        onClose={onClose}
        title={
          <span className="flex items-center gap-2">
            <Sparkles size={16} className="text-violet-500" />
            Photo Check-off
          </span>
        }
      >
        <div className="flex flex-col gap-5 pb-2">

          {/* ── PICK phase ── */}
          {phase === 'pick' && (
            <div className="flex flex-col gap-3 py-2">
              <p className="text-sm text-muted text-center">
                Take a photo or upload one to check off an item.
              </p>

              {/* Take Photo (camera capture) */}
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="w-full flex items-center gap-4 px-5 py-4 min-h-[64px]
                           rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50
                           hover:border-primary active:scale-[0.98] transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <Camera size={24} className="text-violet-600" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-navy text-base">Take Photo</p>
                  <p className="text-sm text-muted">Opens your camera</p>
                </div>
              </button>

              {/* Upload from Library */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-4 px-5 py-4 min-h-[64px]
                           rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50
                           hover:border-primary active:scale-[0.98] transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <ImageIcon size={24} className="text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-navy text-base">Upload from Library</p>
                  <p className="text-sm text-muted">Choose an existing photo</p>
                </div>
              </button>

              <Button variant="ghost" fullWidth onClick={onClose}>
                Cancel
              </Button>
            </div>
          )}

          {/* ── ANALYZING phase ── */}
          {phase === 'analyzing' && (
            <div className="flex flex-col gap-4">
              {/* Photo preview */}
              {photoPreview && (
                <div className="relative rounded-xl overflow-hidden border border-slate-200">
                  <img
                    src={photoPreview}
                    alt="Your photo"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="bg-white/90 rounded-full px-4 py-2 flex items-center gap-2">
                      <Sparkles size={16} className="text-violet-600 animate-pulse" />
                      <span className="text-sm font-semibold text-violet-700">Analyzing…</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Skeleton lines */}
              <div className="space-y-2">
                <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-slate-100 rounded animate-pulse w-1/2" />
              </div>
            </div>
          )}

          {/* ── RESULT phase ── */}
          {(phase === 'result' || phase === 'fallback') && photoPreview && (
            <div className="relative">
              <img
                src={photoPreview}
                alt="Your photo"
                className="w-full h-40 object-cover rounded-xl border border-slate-200"
              />
              <button
                onClick={() => setFullscreenPhoto(true)}
                className="absolute top-2 right-2 w-8 h-8 bg-black/40 rounded-full
                           flex items-center justify-center text-white"
                aria-label="View fullscreen"
              >
                <ZoomIn size={14} />
              </button>
            </div>
          )}

          {phase === 'result' && matchedItem && matchResult && (
            <ConfidenceMatchCard
              matchedItem={matchedItem}
              confidence={matchResult.confidence}
              reasoning={matchResult.reasoning}
              description={matchResult.description}
              onConfirm={handleConfirm}
              onReject={handleReject}
            />
          )}

          {/* ── FALLBACK phase ── */}
          {phase === 'fallback' && (
            <ItemSelectList
              items={incompleteItems}
              onSelect={handleManualSelect}
              title="Which item does this photo go with?"
            />
          )}

          {/* ── ERROR phase ── */}
          {phase === 'error' && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle size={24} className="text-red-500" />
              </div>
              <p className="text-base text-navy text-center font-medium">{errorMsg}</p>
              <div className="flex flex-col gap-2 w-full">
                <Button variant="primary" fullWidth size="lg" onClick={() => setPhase('pick')}>
                  <Camera size={18} />
                  Try Another Photo
                </Button>
                <Button variant="secondary" fullWidth onClick={() => setPhase('fallback')}>
                  Select item manually
                </Button>
              </div>
            </div>
          )}

          {/* Completing spinner overlay */}
          {isCompleting && (
            <div className="flex items-center justify-center py-4">
              <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-sm text-muted">Saving…</span>
            </div>
          )}
        </div>
      </BottomSheet>

      {/* Fullscreen photo viewer (US-018) */}
      {fullscreenPhoto && photoPreview && (
        <div
          className="fixed inset-0 z-[60] bg-black flex items-center justify-center"
          onClick={() => setFullscreenPhoto(false)}
        >
          <img
            src={photoPreview}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
          />
          <button
            onClick={() => setFullscreenPhoto(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full
                       flex items-center justify-center text-white text-xl"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
        aria-hidden="true"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        aria-hidden="true"
      />
    </>
  )
}
