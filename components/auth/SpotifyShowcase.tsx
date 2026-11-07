'use client'

import { SpotifyVinyl } from './SpotifyVinyl'
import { SoundwaveEqualizer } from './SoundwaveEqualizer'
import { FamilyHarmonizerBadge } from './FamilyHarmonizerBadge'

export function SpotifyShowcase() {
  return (
    <div className="flex w-full flex-col items-center justify-center">
      {/* Vinyl & Soundwave Stage */}
      <div className="relative flex flex-col items-center justify-center">
        {/* The Realistic Rotating Vinyl */}
        <div className="relative transition-transform duration-700 hover:scale-[1.03]">
          <SpotifyVinyl size={280} />
        </div>

        {/* Dynamic Soundwave Equalizer bar spectrum below the vinyl */}
        <div className="mt-6 w-full max-w-[260px]">
          <SoundwaveEqualizer barCount={32} />
        </div>
      </div>

      {/* Copy & Narrative */}
      <div className="mt-8 text-center max-w-[440px]">
        <h2 className="text-3xl font-bold tracking-tight text-app-text sm:text-[34px] leading-tight">
          Música em família.{' '}
          <span className="bg-gradient-to-r from-app-accent to-emerald-400 bg-clip-text text-transparent">
            Zero atrito.
          </span>
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-app-muted">
          Divida a mensalidade de 6 pessoas sem constrangimento. Cobranças automáticas no Pix e histórico transparente.
        </p>
      </div>

      {/* Tangible Value Proof Badge */}
      <div className="mt-6 w-full max-w-[380px]">
        <FamilyHarmonizerBadge />
      </div>
    </div>
  )
}

export function SpotifyShowcaseCompact() {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      {/* Compact rotating vinyl with glow */}
      <div className="relative mb-2 flex items-center justify-center">
        <SpotifyVinyl size={100} />
      </div>

      {/* Mini soundwave */}
      <div className="mb-2 w-36">
        <SoundwaveEqualizer barCount={18} />
      </div>

      <h1 className="text-xl font-bold tracking-tight text-app-text">
        Música em família.{' '}
        <span className="text-app-accent">Zero atrito.</span>
      </h1>
      <p className="mt-1 text-xs text-app-muted max-w-[280px]">
        Organize as 6 vagas e feche o mês com tranquilidade.
      </p>
    </div>
  )
}
