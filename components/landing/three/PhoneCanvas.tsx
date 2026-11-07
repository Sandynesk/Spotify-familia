'use client'

// STUB da fundação — o agente "three" substitui a implementação mantendo PhoneCanvasProps e o export.
import { Canvas } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import type { MotionValue } from 'framer-motion'
import type { Beat } from '../story/beats'

export interface PhoneCanvasProps {
  /** progresso 0–1 do trecho da narrativa (ver story/beats.ts) */
  progress: MotionValue<number>
  /** beat atual */
  beat: Beat
  /** 'low' = DPR ≤ 1.5, sem sombras de contato/efeitos caros */
  quality: 'high' | 'low'
  /** tela HTML (SCREEN_W × SCREEN_H) a exibir no display do aparelho */
  screen: React.ReactNode
  /** chamar uma vez, quando o primeiro frame com o aparelho estiver pronto */
  onReady: () => void
}

export function PhoneCanvas({ quality, onReady }: PhoneCanvasProps) {
  return (
    <Canvas
      dpr={quality === 'high' ? [1, 2] : [1, 1.5]}
      camera={{ position: [0, 0, 6], fov: 30 }}
      onCreated={() => onReady()}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={2} />
      <RoundedBox args={[0.78, 1.6, 0.08]} radius={0.04} position={[1, 0, 0]}>
        <meshStandardMaterial color="#3a3a3f" metalness={0.8} roughness={0.3} />
      </RoundedBox>
    </Canvas>
  )
}
