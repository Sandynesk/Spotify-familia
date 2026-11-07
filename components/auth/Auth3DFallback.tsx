'use client'

import { BrandMark } from '@/components/landing/BrandMark'

export function Auth3DFallback() {
  return (
    <div
      aria-hidden="true"
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
    >
      {/* Ambient radial glow */}
      <div className="absolute h-[280px] w-[280px] rounded-full bg-app-accent/20 blur-[90px]" />
      <div className="absolute h-[220px] w-[220px] rounded-full bg-app-info/15 blur-[75px]" />

      {/* Rotating orbital rings */}
      <div className="relative flex h-48 w-48 items-center justify-center rounded-full border border-app-accent/20 bg-app-surface/40 backdrop-blur-md">
        <div className="absolute inset-2 animate-[spin_24s_linear_infinite] rounded-full border border-dashed border-app-line-strong" />
        <div className="relative z-10 transition-transform duration-700 hover:scale-105">
          <BrandMark size={56} />
        </div>
      </div>
    </div>
  )
}
