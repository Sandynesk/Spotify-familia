'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'
import { useDeviceTier } from '../primitives/useDeviceTier'
import { PhoneScreen } from '../screens/PhoneScreen'
import { PhoneFallback } from '../photo/PhoneFallback'
import { useStory } from './StoryStage'

// three.js só é baixado quando o aparelho aguenta 3D.
const PhoneCanvas = dynamic(() => import('../three/PhoneCanvas').then((m) => m.PhoneCanvas), {
  ssr: false,
  loading: () => null,
})

/**
 * Decide entre 3D e imagem de reserva e entrega a tela HTML do beat atual a quem renderiza.
 * A imagem de reserva fica visível (SSR, primeiro frame, aparelho fraco) até o canvas avisar `onReady`;
 * então some com fade — sem "buraco" enquanto o three.js carrega.
 */
export function PhoneStage() {
  const tier = useDeviceTier()
  const { progress, beat } = useStory()
  const [canvasReady, setCanvasReady] = useState(false)
  const screen = <PhoneScreen beat={beat} />
  const use3D = tier === 'high' || tier === 'low'

  return (
    <div className="absolute inset-0" aria-hidden>
      {use3D && (
        <div className="absolute inset-0">
          <PhoneCanvas
            progress={progress}
            beat={beat}
            quality={tier}
            screen={screen}
            onReady={() => setCanvasReady(true)}
          />
        </div>
      )}
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-700',
          use3D && canvasReady ? 'opacity-0' : 'opacity-100',
        )}
      >
        <PhoneFallback screen={screen} />
      </div>
    </div>
  )
}
