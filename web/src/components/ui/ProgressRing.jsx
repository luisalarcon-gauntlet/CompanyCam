export function ProgressRing({ percentage = 0, size = 56, strokeWidth = 5, className = '' }) {
  const radius = (size - strokeWidth * 2) / 2
  const circumference = radius * 2 * Math.PI
  const progress = Math.min(100, Math.max(0, percentage))
  const strokeDashoffset = circumference - (progress / 100) * circumference
  const isComplete = progress === 100

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}
         style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isComplete ? '#16A34A' : '#2563EB'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
        />
      </svg>
      <span className="absolute text-xs font-bold text-navy">
        {isComplete ? '✓' : `${progress}%`}
      </span>
    </div>
  )
}
