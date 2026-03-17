/**
 * Animated waveform bars shown while recording voice.
 * Uses CSS animations with staggered delays for a realistic look.
 */
export function WaveformAnimation({ isActive = true }) {
  const bars = [0.4, 0.7, 1, 0.8, 0.5, 0.9, 0.6, 1, 0.7, 0.4, 0.8, 0.6]

  return (
    <div
      className="flex items-center justify-center gap-1 h-12"
      aria-hidden="true"
      role="img"
    >
      {bars.map((scale, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-full transition-all ${
            isActive ? 'bg-violet-500 animate-waveform' : 'bg-slate-300'
          }`}
          style={{
            height: isActive ? `${Math.round(scale * 32)}px` : '4px',
            animationDelay: `${i * 60}ms`,
            animationDuration: `${600 + (i % 4) * 80}ms`,
          }}
        />
      ))}
    </div>
  )
}
