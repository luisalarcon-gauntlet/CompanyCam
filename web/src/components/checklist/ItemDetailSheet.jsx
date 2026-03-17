import { BottomSheet } from '../ui/BottomSheet'
import { Check, Mic, Camera, Clock, User, ZoomIn } from 'lucide-react'
import { useState } from 'react'

const METHOD_CONFIG = {
  voice: { icon: Mic, label: 'Voice', color: 'bg-violet-100 text-violet-700' },
  photo: { icon: Camera, label: 'Photo', color: 'bg-blue-100 text-blue-700' },
  manual: { icon: Check, label: 'Manual', color: 'bg-slate-100 text-slate-700' },
}

function formatFullDate(dateString) {
  if (!dateString) return '—'
  const d = new Date(dateString)
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) + ' at ' + d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ItemDetailSheet({ isOpen, onClose, item }) {
  const [showFullPhoto, setShowFullPhoto] = useState(false)

  if (!item) return null

  const method = METHOD_CONFIG[item.completed_via] || METHOD_CONFIG.manual
  const MethodIcon = method.icon

  return (
    <>
      <BottomSheet isOpen={isOpen} onClose={onClose} title="Item Details">
        <div className="flex flex-col gap-5">
          {/* Item title */}
          <div>
            <h3 className="text-lg font-bold text-navy leading-snug">{item.title}</h3>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${method.color}`}>
                <MethodIcon size={14} />
                Completed via {method.label}
              </span>
            </div>
          </div>

          {/* Timestamp */}
          <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-3">
            <Clock size={18} className="text-muted flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-navy">Completed</p>
              <p className="text-sm text-muted">{formatFullDate(item.completed_at)}</p>
            </div>
          </div>

          {/* Who completed it */}
          {item.completed_by_name && (
            <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-3">
              <User size={18} className="text-muted flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-navy">Completed by</p>
                <p className="text-sm text-muted">{item.completed_by_name}</p>
              </div>
            </div>
          )}

          {/* Photo */}
          {item.photo_url && (
            <div>
              <p className="text-sm font-semibold text-navy mb-2">Attached Photo</p>
              <button
                onClick={() => setShowFullPhoto(true)}
                className="relative group w-full"
              >
                <img
                  src={item.photo_thumbnail_url || item.photo_url}
                  alt="Completion photo"
                  className="w-full h-48 object-cover rounded-xl border border-slate-200 group-hover:opacity-90 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/50 rounded-full p-2">
                    <ZoomIn size={20} className="text-white" />
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Voice transcription */}
          {item.voice_transcription && (
            <div>
              <p className="text-sm font-semibold text-navy mb-2">Voice Transcription</p>
              <div className="bg-violet-50 border border-violet-200 rounded-xl p-3">
                <p className="text-base text-violet-900 italic">
                  &ldquo;{item.voice_transcription}&rdquo;
                </p>
              </div>
            </div>
          )}
        </div>
      </BottomSheet>

      {/* Full-screen photo viewer */}
      {showFullPhoto && item.photo_url && (
        <div
          className="fixed inset-0 z-[70] bg-black flex flex-col"
          onClick={() => setShowFullPhoto(false)}
        >
          <div className="flex items-center justify-between px-4 py-3 bg-black/60">
            <div>
              <p className="text-white font-semibold text-sm">{item.title}</p>
              <p className="text-slate-400 text-xs mt-0.5">
                {formatFullDate(item.completed_at)}
              </p>
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
    </>
  )
}
