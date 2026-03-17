import { useEffect, useState } from 'react'

const COLORS = ['#2563EB', '#16A34A', '#FBBF24', '#7C3AED', '#EC4899', '#F97316']
const PARTICLE_COUNT = 50

function randomBetween(a, b) {
  return Math.random() * (b - a) + a
}

export function Confetti({ active = false, duration = 3000 }) {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (!active) {
      setParticles([])
      return
    }

    const created = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: randomBetween(0, 100),
      delay: randomBetween(0, 0.5),
      duration: randomBetween(1.5, 3),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: randomBetween(6, 12),
      rotation: randomBetween(0, 360),
      drift: randomBetween(-30, 30),
    }))

    setParticles(created)

    const timer = setTimeout(() => setParticles([]), duration)
    return () => clearTimeout(timer)
  }, [active, duration])

  if (particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: '-10px',
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
            borderRadius: '2px',
            transform: `rotate(${p.rotation}deg)`,
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
            '--drift': `${p.drift}px`,
          }}
        />
      ))}
    </div>
  )
}
