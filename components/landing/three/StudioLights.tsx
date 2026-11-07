'use client'

import { memo } from 'react'
import { Environment, Lightformer, ContactShadows } from '@react-three/drei'
import { BRAND } from '../data'

export interface StudioLightsProps {
  quality: 'high' | 'low'
}

/**
 * Iluminação de estúdio de produto premium (Apple keynote style).
 * 100% procedural com Lightformers, sem nenhum arquivo HDR externo nem preset de CDN.
 */
export const StudioLights = memo(function StudioLights({ quality }: StudioLightsProps) {
  const resolution = quality === 'high' ? 256 : 128

  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[1.5, 3, 4]} intensity={0.6} />

      <Environment resolution={resolution}>
        {/* Softbox grande superior */}
        <Lightformer
          form="rect"
          intensity={2.8}
          position={[0, 5, -0.5]}
          scale={[8, 4, 1]}
          rotation={[Math.PI / 2, 0, 0]}
        />

        {/* Faixa vertical esquerda — desenha o contorno do titânio */}
        <Lightformer
          form="rect"
          intensity={3.5}
          position={[-4.5, 0, 1.2]}
          scale={[0.8, 8, 1]}
          rotation={[0, Math.PI / 2, 0]}
        />

        {/* Faixa vertical direita — desenha o contorno do titânio */}
        <Lightformer
          form="rect"
          intensity={3.5}
          position={[4.5, 0, 1.2]}
          scale={[0.8, 8, 1]}
          rotation={[0, -Math.PI / 2, 0]}
        />

        {/* Faixa na cor BRAND.accent atrás e à esquerda — rim light verde característico */}
        <Lightformer
          form="rect"
          color={BRAND.accent}
          intensity={5.5}
          position={[-3.5, 0.5, -3.5]}
          scale={[2.5, 8, 1]}
          rotation={[0, Math.PI / 3, 0]}
        />

        {/* Preenchimento frontal suave para leitura e brilho especular */}
        <Lightformer
          form="rect"
          intensity={0.7}
          position={[0, 0, 5]}
          scale={[6, 6, 1]}
        />
      </Environment>

      {/* Sombra de contato sutil abaixo do aparelho (apenas em high) */}
      {quality === 'high' && (
        <ContactShadows
          position={[0, -1.25, 0]}
          opacity={0.35}
          scale={5.5}
          blur={2.4}
          far={3}
          resolution={512}
          color="#000000"
        />
      )}
    </>
  )
})
