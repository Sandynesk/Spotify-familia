'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useReducedMotion, type MotionValue } from 'framer-motion'
import type { Beat } from '../story/beats'
import { computeTargetPose, type PhonePose } from './poses'
import { StudioLights } from './StudioLights'
import { PhoneModel } from './PhoneModel'

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

interface PhoneRigProps {
  progress: MotionValue<number>
  screen: React.ReactNode
  onReady: () => void
  reducedMotion: boolean
}

const TWO_PI = Math.PI * 2

/** Easing easeOutExpo para a animação de entrada ao montar */
function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

/**
 * Controlador de física, pose, entrada e animação idle do aparelho.
 * Executa inteiramente dentro de `useFrame` com zero alocação de objetos por frame.
 */
function PhoneRig({ progress, screen, onReady, reducedMotion }: PhoneRigProps) {
  const rootRef = useRef<THREE.Group>(null)
  const readyCalled = useRef(false)
  const introElapsed = useRef(0)
  const prevProgress = useRef(progress.get())
  const lastScrollTime = useRef(0)
  const idleWeight = useRef(0)

  // Poses pré-alocadas (zero alocação por frame)
  const currentPose = useRef<PhonePose>({
    x: 0.95,
    y: -1.6,
    z: 0,
    rotX: 0.06,
    rotY: -1.1,
    rotZ: 0.02,
  })

  const targetPose = useRef<PhonePose>({
    x: 0.95,
    y: 0,
    z: 0,
    rotX: 0.06,
    rotY: -0.42,
    rotZ: 0.02,
  })

  const { viewport } = useThree()

  useFrame((state, delta) => {
    // 1. Notifica onReady no primeiro frame renderizado
    if (!readyCalled.current) {
      readyCalled.current = true
      onReady()
    }

    if (!rootRef.current) return

    const p = progress.get()
    const isMobile = viewport.width < viewport.height

    // 2. Cálculo responsivo de escala
    // No desktop (fov ~28, z ~5.2), o aparelho ocupa cerca de 78% da altura da tela (1.496 unid * scale ≈ 0.78 * viewport.height)
    const desktopScale = (0.78 * viewport.height) / 1.496
    const baseMobileScale = desktopScale * 0.82
    const maxMobileW = (viewport.width * 0.82) / 0.715
    const maxMobileH = (viewport.height * 0.44) / 1.496
    const activeScale = isMobile
      ? Math.min(baseMobileScale, maxMobileW, maxMobileH)
      : desktopScale

    // 3. Com prefers-reduced-motion: pose estática sem rotações dramáticas nem idle
    if (reducedMotion) {
      computeTargetPose(p, isMobile, viewport.width, viewport.height, targetPose.current)
      rootRef.current.position.set(
        targetPose.current.x,
        targetPose.current.y,
        targetPose.current.z,
      )
      rootRef.current.rotation.set(
        targetPose.current.rotX,
        targetPose.current.rotY,
        targetPose.current.rotZ,
      )
      rootRef.current.scale.setScalar(activeScale)
      return
    }

    // 4. Calcula pose-alvo baseada no scroll progress
    computeTargetPose(p, isMobile, viewport.width, viewport.height, targetPose.current)

    // 5. Entrada (por tempo, ao montar): sobe de y = -1.6 girando de rotY = -1.1 até a pose do hero em ~1.8s
    if (introElapsed.current < 1.8) {
      introElapsed.current += delta
      const t = Math.min(1, introElapsed.current / 1.8)
      const factor = easeOutExpo(t)
      const yStart = -1.6
      const rotYStart = -1.1
      targetPose.current.y = THREE.MathUtils.lerp(yStart, targetPose.current.y, factor)
      targetPose.current.rotY = THREE.MathUtils.lerp(rotYStart, targetPose.current.rotY, factor)
    }

    // 6. Flutuação idle sutil (±0,015 em y, período ~5 s) quando o scroll está parado
    const dp = Math.abs(p - prevProgress.current)
    prevProgress.current = p

    if (dp > 0.0002) {
      lastScrollTime.current = state.clock.elapsedTime
      idleWeight.current = THREE.MathUtils.damp(idleWeight.current, 0, 12, delta)
    } else if (state.clock.elapsedTime - lastScrollTime.current > 0.15) {
      idleWeight.current = THREE.MathUtils.damp(idleWeight.current, 1, 3, delta)
    }

    const idleY = Math.sin(state.clock.elapsedTime * (TWO_PI / 5)) * 0.015 * idleWeight.current
    const idleRotX = Math.cos(state.clock.elapsedTime * (TWO_PI / 5)) * 0.004 * idleWeight.current

    // 7. Interpolação suave com THREE.MathUtils.damp (lambda ≈ 5)
    currentPose.current.x = THREE.MathUtils.damp(
      currentPose.current.x,
      targetPose.current.x,
      5,
      delta,
    )
    currentPose.current.y = THREE.MathUtils.damp(
      currentPose.current.y,
      targetPose.current.y,
      5,
      delta,
    )
    currentPose.current.z = THREE.MathUtils.damp(
      currentPose.current.z,
      targetPose.current.z,
      5,
      delta,
    )
    currentPose.current.rotX = THREE.MathUtils.damp(
      currentPose.current.rotX,
      targetPose.current.rotX,
      5,
      delta,
    )
    currentPose.current.rotY = THREE.MathUtils.damp(
      currentPose.current.rotY,
      targetPose.current.rotY,
      5,
      delta,
    )
    currentPose.current.rotZ = THREE.MathUtils.damp(
      currentPose.current.rotZ,
      targetPose.current.rotZ,
      5,
      delta,
    )

    // 8. Aplica a transformação final ao grupo principal
    rootRef.current.position.set(
      currentPose.current.x,
      currentPose.current.y + idleY,
      currentPose.current.z,
    )
    rootRef.current.rotation.set(
      currentPose.current.rotX + idleRotX,
      currentPose.current.rotY,
      currentPose.current.rotZ,
    )
    rootRef.current.scale.setScalar(activeScale)
  })

  return (
    <group ref={rootRef}>
      <PhoneModel screen={screen} />
    </group>
  )
}

/**
 * Camada 3D do celular flagship em titânio grafite.
 * Ocupa 100svh × 100vw, aria-hidden e sem eventos de ponteiro.
 */
export function PhoneCanvas(props: PhoneCanvasProps): React.JSX.Element {
  const { progress, quality, screen, onReady } = props
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(true)
  const reducedMotion = useReducedMotion()

  // Pausa o render (frameloop="never") quando o canvas sai da viewport
  useEffect(() => {
    const el = containerRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.01 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full pointer-events-none"
      aria-hidden="true"
      style={{ pointerEvents: 'none' }}
    >
      <Canvas
        dpr={quality === 'high' ? [1, 2] : [1, 1.5]}
        camera={{ position: [0, 0, 5.2], fov: 28 }}
        frameloop={isVisible ? 'always' : 'never'}
        gl={{
          alpha: true,
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        style={{ pointerEvents: 'none' }}
      >
        <StudioLights quality={quality} />
        <PhoneRig
          progress={progress}
          screen={screen}
          onReady={onReady}
          reducedMotion={!!reducedMotion}
        />
      </Canvas>
    </div>
  )
}
