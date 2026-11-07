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
 * Configurada para máxima leitura e brilho especular do titânio contra o fundo preto.
 */
export const StudioLights = memo(function StudioLights({ quality }: StudioLightsProps) {
  const resolution = quality === 'high' ? 256 : 128

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[1.5, 4, 4.5]} intensity={1.2} />

      <Environment resolution={resolution}>
        {/* Key light branco forte de cima-frente — realça o chanfro e o brilho do titânio */}
        <Lightformer
          form="rect"
          intensity={4.5}
          position={[0, 4.5, 2.5]}
          scale={[10, 6, 1]}
          rotation={[Math.PI / 3, 0, 0]}
        />

        {/* Faixa vertical esquerda mais forte e larga para desenhar a moldura de titânio */}
        <Lightformer
          form="rect"
          intensity={6.0}
          position={[-4.5, 0, 1.5]}
          scale={[1.8, 10, 1]}
          rotation={[0, Math.PI / 2, 0]}
        />

        {/* Faixa vertical direita mais forte e larga para desenhar a moldura de titânio */}
        <Lightformer
          form="rect"
          intensity={6.0}
          position={[4.5, 0, 1.5]}
          scale={[1.8, 10, 1]}
          rotation={[0, -Math.PI / 2, 0]}
        />

        {/* Rim light característico na cor BRAND.accent atrás e à esquerda */}
        <Lightformer
          form="rect"
          color={BRAND.accent}
          intensity={6.5}
          position={[-3.8, 0.8, -3.8]}
          scale={[3.0, 9, 1]}
          rotation={[0, Math.PI / 3, 0]}
        />

        {/* Luz de preenchimento frontal para reflexo especular na moldura e lentes */}
        <Lightformer
          form="rect"
          intensity={1.2}
          position={[0, 0, 5]}
          scale={[6, 6, 1]}
        />

        {/* Luz traseira suave para realçar o vidro fosco e o módulo de câmeras durante o giro */}
        <Lightformer
          form="rect"
          intensity={2.2}
          position={[2, 2, -4]}
          scale={[6, 6, 1]}
          rotation={[0, Math.PI, 0]}
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
