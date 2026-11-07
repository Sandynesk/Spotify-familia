'use client'

import { useMemo } from 'react'
import { DeviceShot, type DeviceShotScreen } from './DeviceShot'
import { SHOTS } from './shots'

export interface PhoneFallbackProps {
  /** tela HTML do beat atual, a ser encaixada na foto hero-fallback */
  screen: React.ReactNode
}

export function PhoneFallback({ screen }: PhoneFallbackProps) {
  const shot = SHOTS.heroFallback

  const screens = useMemo<DeviceShotScreen[]>(
    () => [
      {
        corners: shot.screens[0],
        content: screen,
      },
    ],
    [shot.screens, screen],
  )

  return (
    <div className="pointer-events-none relative h-full w-full overflow-hidden">
      {/*
        Posicionamento calibrado com o 3D:
        - Mobile: centralizado no topo ocupando ~60svh, para o texto do BeatBlock ficar embaixo.
        - Desktop: centro do aparelho (51.4% da largura da foto) alinhado a ~70% da viewport,
                   altura ~92svh para o aparelho ocupar ~70% da altura da tela.
      */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[58svh] sm:h-[60svh] w-auto aspect-[1024/1210] max-w-[88vw] md:top-1/2 md:left-[70%] md:-translate-x-[51.42%] md:-translate-y-1/2 md:h-[92svh] md:max-w-none">
        <DeviceShot
          src={shot.src}
          alt={shot.alt}
          width={shot.width}
          height={shot.height}
          screens={screens}
          priority
          sizes="(max-width: 768px) 88vw, (max-width: 1200px) 60vw, 840px"
          className="h-full w-full"
        />
      </div>
    </div>
  )
}
