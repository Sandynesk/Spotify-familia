'use client'

import { useId } from 'react'

interface SoundwaveEqualizerProps {
  barCount?: number
  className?: string
}

export function SoundwaveEqualizer({ barCount = 28, className = '' }: SoundwaveEqualizerProps) {
  const id = useId()

  // Generate deterministic heights and animation delays for a natural musical spectrum
  const bars = Array.from({ length: barCount }, (_, i) => {
    // Parabolic envelope: taller in center, shorter at edges
    const centerNorm = Math.sin((i / (barCount - 1)) * Math.PI)
    const baseHeight = 16 + centerNorm * 38
    const animDuration = 1.1 + ((i * 7) % 9) * 0.12
    const animDelay = ((i * 13) % 17) * 0.08
    return {
      id: `${id}-bar-${i}`,
      baseHeight,
      animDuration,
      animDelay,
    }
  })

  return (
    <div
      aria-hidden="true"
      className={`flex items-end justify-center gap-[3px] sm:gap-1 select-none pointer-events-none ${className}`}
    >
      {bars.map((bar) => (
        <span
          key={bar.id}
          className="w-[2.5px] sm:w-[3.5px] rounded-full bg-gradient-to-t from-app-accent to-emerald-300 opacity-80"
          style={{
            height: `${bar.baseHeight}px`,
            animation: `soundwavePulse ${bar.animDuration}s ease-in-out infinite alternate`,
            animationDelay: `${bar.animDelay}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes soundwavePulse {
          0% {
            transform: scaleY(0.35);
            opacity: 0.45;
          }
          50% {
            transform: scaleY(1);
            opacity: 0.95;
          }
          100% {
            transform: scaleY(0.55);
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  )
}
