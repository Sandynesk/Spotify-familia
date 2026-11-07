'use client'

import { BrandMark } from '@/components/landing/BrandMark'

interface SpotifyVinylProps {
  size?: number
  className?: string
  spinning?: boolean
}

export function SpotifyVinyl({ size = 320, className = '', spinning = true }: SpotifyVinylProps) {
  return (
    <div
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={`relative select-none ${className}`}
    >
      {/* Ambient background glow behind vinyl */}
      <div
        className="absolute inset-0 rounded-full bg-app-accent/20 blur-[50px] transition-transform duration-700 hover:scale-110"
      />

      {/* Rotating Vinyl Record */}
      <div
        className={`relative h-full w-full rounded-full shadow-[0_20px_60px_rgba(0,0,0,0.85)] ring-1 ring-white/10 ${
          spinning ? 'animate-[spin_24s_linear_infinite]' : ''
        }`}
        style={{
          background: 'radial-gradient(circle, #18191e 0%, #0e0f13 45%, #08090b 100%)',
        }}
      >
        {/* Specular light sheen (vinyl anisotropic reflection) */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full opacity-60"
          style={{
            background:
              'conic-gradient(from 45deg, rgba(255,255,255,0.12) 0deg, transparent 40deg, transparent 140deg, rgba(255,255,255,0.12) 180deg, transparent 220deg, transparent 320deg, rgba(255,255,255,0.12) 360deg)',
          }}
        />

        {/* Realistic sound groove micro-rings (SVG) */}
        <svg
          viewBox="0 0 320 320"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-70"
          fill="none"
        >
          {/* Outer edge groove */}
          <circle cx="160" cy="160" r="156" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
          <circle cx="160" cy="160" r="150" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />

          {/* Sound bands */}
          <circle cx="160" cy="160" r="142" stroke="rgba(255,255,255,0.07)" strokeWidth="0.75" />
          <circle cx="160" cy="160" r="134" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          <circle cx="160" cy="160" r="126" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          <circle cx="160" cy="160" r="118" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          <circle cx="160" cy="160" r="110" stroke="rgba(255,255,255,0.07)" strokeWidth="0.75" />
          <circle cx="160" cy="160" r="102" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          <circle cx="160" cy="160" r="94" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          <circle cx="160" cy="160" r="86" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />

          {/* Runout groove area */}
          <circle cx="160" cy="160" r="76" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 4" />
          <circle cx="160" cy="160" r="68" stroke="rgba(255,255,255,0.1)" strokeWidth="0.75" />
        </svg>

        {/* Center Vinyl Label (Sticker) */}
        <div
          className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-app-accent/30 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]"
          style={{
            width: `${Math.round(size * 0.38)}px`,
            height: `${Math.round(size * 0.38)}px`,
            background: 'radial-gradient(circle, #0e2a22 0%, #081712 70%, #040c09 100%)',
          }}
        >
          {/* Micro text on label */}
          <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-app-accent/90">
            Plano Família
          </span>

          {/* Center Brand Mark */}
          <div className="my-1 transition-transform duration-500 hover:scale-110">
            <BrandMark size={Math.round(size * 0.13)} />
          </div>

          <span className="text-[6.5px] font-semibold uppercase tracking-[0.14em] text-white/70">
            33 ⅓ RPM • Estéreo
          </span>

          {/* Spindle hole */}
          <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-[#060709] shadow-[inset_0_1px_3px_rgba(0,0,0,0.9)]" />
        </div>
      </div>
    </div>
  )
}
