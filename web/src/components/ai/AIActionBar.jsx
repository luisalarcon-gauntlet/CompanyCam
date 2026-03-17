import { Mic, Camera, MessageCircle, Sparkles, WifiOff } from 'lucide-react'

/**
 * AI Action Bar — renders in two modes:
 *   'bar'   — horizontal bottom bar (mobile / tablet)
 *   'panel' — vertical stacked buttons (desktop right panel)
 */
export function AIActionBar({ hasItems, isOnline, onVoice, onPhoto, onAsk, mode = 'bar' }) {
  if (mode === 'panel') {
    return (
      <div className="flex flex-col h-full p-5 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-5">
          <Sparkles size={13} className="text-violet-400" />
          <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">
            AI Actions
          </span>
        </div>

        {/* Voice */}
        <PanelButton
          icon={<Mic size={20} />}
          label="Voice Check-off"
          description="Say what you just finished"
          disabled={!hasItems || !isOnline}
          isOnline={isOnline}
          onClick={onVoice}
        />

        {/* Photo */}
        <PanelButton
          icon={<Camera size={20} />}
          label="Photo Check-off"
          description="Snap a photo of completed work"
          disabled={!hasItems || !isOnline}
          isOnline={isOnline}
          onClick={onPhoto}
        />

        {/* Ask AI */}
        <PanelButton
          icon={<MessageCircle size={20} />}
          label="Ask AI"
          description="Ask anything about this job"
          disabled={!isOnline}
          isOnline={isOnline}
          onClick={onAsk}
        />

        {/* Footer */}
        <div className="mt-auto pt-5 border-t border-white/10">
          <p className="text-xs text-slate-600 text-center flex items-center justify-center gap-1.5">
            <Sparkles size={10} className="text-violet-700" />
            AI-powered check-off
          </p>
        </div>
      </div>
    )
  }

  // ── mode === 'bar' (mobile / tablet bottom bar) ─────────────────────────
  return (
    <div
      className="relative bg-navy-mid border-t border-white/10 px-4 py-3"
      style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
    >
      {/* Thin violet gradient accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />

      <div className="flex items-center gap-2">
        {/* Voice */}
        <button
          onClick={onVoice}
          className={`flex-1 flex flex-col items-center gap-1.5 py-2 rounded-xl
                      transition-all active:scale-95
                      ${hasItems
                        ? 'text-slate-300 hover:text-violet-400 hover:bg-white/5'
                        : 'text-slate-600 cursor-not-allowed'
                      }`}
          aria-label="Voice check-off"
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center
                           ${hasItems ? 'bg-violet-900/50 border border-violet-700/50' : 'bg-white/5'}`}>
            {!isOnline && (
              <WifiOff size={10} className="absolute text-amber-400 mt-[-18px] ml-[18px]" />
            )}
            <Mic size={22} className={hasItems ? 'text-violet-400' : 'text-slate-600'} />
          </div>
          <span className="text-xs font-medium">Voice</span>
        </button>

        {/* Photo */}
        <button
          onClick={onPhoto}
          className={`flex-1 flex flex-col items-center gap-1.5 py-2 rounded-xl
                      transition-all active:scale-95
                      ${hasItems
                        ? 'text-slate-300 hover:text-violet-400 hover:bg-white/5'
                        : 'text-slate-600 cursor-not-allowed'
                      }`}
          aria-label="Photo check-off"
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center
                           ${hasItems ? 'bg-violet-900/50 border border-violet-700/50' : 'bg-white/5'}`}>
            {!isOnline && (
              <WifiOff size={10} className="absolute text-amber-400 mt-[-18px] ml-[18px]" />
            )}
            <Camera size={22} className={hasItems ? 'text-violet-400' : 'text-slate-600'} />
          </div>
          <span className="text-xs font-medium">Photo</span>
        </button>

        {/* Ask AI */}
        <button
          onClick={onAsk}
          className="flex-1 flex flex-col items-center gap-1.5 py-2 rounded-xl
                     text-slate-300 hover:text-violet-400 hover:bg-white/5
                     transition-all active:scale-95"
          aria-label="Ask AI"
        >
          <div className="w-12 h-12 bg-violet-900/50 border border-violet-700/50 rounded-full flex items-center justify-center relative">
            {!isOnline && (
              <WifiOff size={10} className="absolute text-amber-400 -top-0.5 -right-0.5" />
            )}
            <MessageCircle size={22} className="text-violet-400" />
          </div>
          <span className="text-xs font-medium">Ask AI</span>
        </button>
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-1.5">
        <Sparkles size={10} className="text-violet-500" />
        <p className="text-center text-xs text-violet-600 font-medium">
          AI-powered check-off
        </p>
      </div>
    </div>
  )
}

function PanelButton({ icon, label, description, disabled, isOnline, onClick }) {
  const active = !disabled
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-4 w-full px-4 py-4 rounded-xl mb-3 transition-all text-left
        ${active
          ? 'bg-violet-900/40 border border-violet-700/40 hover:bg-violet-900/70 hover:border-violet-600/60 active:scale-[0.98]'
          : 'bg-white/5 border border-white/10 cursor-not-allowed'
        }`}
    >
      <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0
        ${active ? 'bg-violet-800/60' : 'bg-white/5'}`}>
        {!isOnline
          ? <WifiOff size={18} className="text-amber-400" />
          : <span className={active ? 'text-violet-300' : 'text-slate-600'}>{icon}</span>
        }
      </div>
      <div className="min-w-0">
        <p className={`text-sm font-semibold leading-tight ${active ? 'text-slate-100' : 'text-slate-600'}`}>
          {label}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
    </button>
  )
}
