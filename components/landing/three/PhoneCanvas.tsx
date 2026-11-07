'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useReducedMotion, type MotionValue } from 'framer-motion'
import { quadToMatrix3d } from '../primitives/homography'
import { SCREEN_H, SCREEN_RADIUS, SCREEN_W } from '../screens/size'
import type { Beat } from '../story/beats'
import {
  DISPLAY_H,
  DISPLAY_W,
  DISPLAY_Z,
  PHONE_H,
  PHONE_W,
  PhoneModel,
} from './PhoneModel'
import { computeTargetPose, type PhonePose } from './poses'
import { StudioLights } from './StudioLights'

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
  onReady: () => void
  reducedMotion: boolean
  screenLayerRef: React.RefObject<HTMLDivElement | null>
}

const TWO_PI = Math.PI * 2

/** Easing easeOutExpo para a animação de entrada ao montar */
function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

/**
 * Controlador de pose, câmera, escala segura (≤ 92% do canvas) e projeção homográfica
 * do retângulo do display 3D para a camada DOM absoluta de tela HTML.
 * Zero alocação de objetos por frame dentro de `useFrame`.
 */
function PhoneRig({ progress, onReady, reducedMotion, screenLayerRef }: PhoneRigProps) {
  const rootRef = useRef<THREE.Group>(null)
  const modelRef = useRef<THREE.Group>(null)
  const readyCalled = useRef(false)
  const introElapsed = useRef(0)
  const elapsedTime = useRef(0)
  const prevProgress = useRef(progress.get())
  const lastScrollTime = useRef(0)
  const idleWeight = useRef(0)

  // Rastreamento para evitar escrita repetida no DOM style
  const lastTransform = useRef('')
  const lastVisibility = useRef<'visible' | 'hidden'>('hidden')

  // Poses pré-alocadas
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

  // 4 cantos no plano frontal do display em coordenadas locais do modelo
  // Ordem: TL, TR, BR, BL (exigida por quadToMatrix3d)
  const halfDW = DISPLAY_W / 2
  const halfDH = DISPLAY_H / 2

  const localCorners = useMemo(
    () => [
      new THREE.Vector3(-halfDW, halfDH, DISPLAY_Z),
      new THREE.Vector3(halfDW, halfDH, DISPLAY_Z),
      new THREE.Vector3(halfDW, -halfDH, DISPLAY_Z),
      new THREE.Vector3(-halfDW, -halfDH, DISPLAY_Z),
    ] as const,
    [halfDW, halfDH],
  )

  // Vetores reutilizados para mundo e projeção (zero alocação por frame)
  const worldCorners = useMemo(
    () => [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()] as const,
    [],
  )

  // Array de cantos em px para homografia
  // (ref, não useMemo: é um buffer mutado a cada frame)
  const quadCornersRef = useRef<[[number, number], [number, number], [number, number], [number, number]]>([
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
  ])

  // Vetores para teste do vetor normal da tela contra a direção da câmera
  const LOCAL_NORMAL = useMemo(() => new THREE.Vector3(0, 0, 1), [])
  const worldNormal = useMemo(() => new THREE.Vector3(), [])
  const camDir = useMemo(() => new THREE.Vector3(), [])
  const tempQuat = useMemo(() => new THREE.Quaternion(), [])

  const { viewport } = useThree()

  useFrame(({ camera, size }, delta) => {
    // 1. Notifica onReady no primeiro frame renderizado
    if (!readyCalled.current) {
      readyCalled.current = true
      onReady()
    }

    if (!rootRef.current || !modelRef.current) return

    elapsedTime.current += delta

    const p = progress.get()
    const isMobile = viewport.width < viewport.height

    // 2. Cálculo responsivo de escala
    const desktopBaseScale = (0.75 * viewport.height) / PHONE_H
    const baseMobileScale = desktopBaseScale * 0.82
    const maxMobileW = (viewport.width * 0.82) / PHONE_W
    const maxMobileH = (viewport.height * 0.44) / PHONE_H
    const targetScale = isMobile
      ? Math.min(baseMobileScale, maxMobileW, maxMobileH)
      : desktopBaseScale

    // Garante que, em qualquer pose (inclusive nos closes), a altura projetada do aparelho
    // fique rigorosamente ≤ 92% da altura do canvas
    const cameraDistance = Math.max(0.2, 5.2 - currentPose.current.z)
    const visibleHeightAtPhoneZ = 2 * cameraDistance * Math.tan((28 * Math.PI) / 360)
    const maxScaleFor92Percent = (0.915 * visibleHeightAtPhoneZ) / PHONE_H
    const activeScale = Math.min(targetScale, maxScaleFor92Percent)

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
    } else {
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
        lastScrollTime.current = elapsedTime.current
        idleWeight.current = THREE.MathUtils.damp(idleWeight.current, 0, 12, delta)
      } else if (elapsedTime.current - lastScrollTime.current > 0.15) {
        idleWeight.current = THREE.MathUtils.damp(idleWeight.current, 1, 3, delta)
      }

      const idleY = Math.sin(elapsedTime.current * (TWO_PI / 5)) * 0.015 * idleWeight.current
      const idleRotX = Math.cos(elapsedTime.current * (TWO_PI / 5)) * 0.004 * idleWeight.current

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

      // 8. Aplica a transformação ao grupo principal
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
    }

    // 9. Atualiza as matrizes de mundo para cálculo preciso dos cantos neste frame
    rootRef.current.updateMatrixWorld(true)

    if (!screenLayerRef.current || size.width <= 0 || size.height <= 0) return

    // 10. Teste de visibilidade: quando o aparelho estiver de costas (normal · camDir ≥ 0), esconde a camada
    worldNormal.copy(LOCAL_NORMAL).applyQuaternion(modelRef.current.getWorldQuaternion(tempQuat))
    camera.getWorldDirection(camDir)
    const dot = worldNormal.dot(camDir)

    if (dot >= 0) {
      if (lastVisibility.current !== 'hidden') {
        lastVisibility.current = 'hidden'
        screenLayerRef.current.style.visibility = 'hidden'
      }
      return
    }

    // 11. Projeção dos 4 cantos do display (TL, TR, BR, BL) para px do canvas
    for (let i = 0; i < 4; i++) {
      worldCorners[i].copy(localCorners[i])
      modelRef.current.localToWorld(worldCorners[i])
      worldCorners[i].project(camera)

      quadCornersRef.current[i][0] = ((worldCorners[i].x + 1) / 2) * size.width
      quadCornersRef.current[i][1] = ((1 - worldCorners[i].y) / 2) * size.height
    }

    // 12. Homografia exata do retângulo SCREEN_W × SCREEN_H para os cantos projetados
    try {
      const matrixStr = quadToMatrix3d(SCREEN_W, SCREEN_H, quadCornersRef.current)
      if (lastTransform.current !== matrixStr) {
        lastTransform.current = matrixStr
        screenLayerRef.current.style.transform = matrixStr
      }
      if (lastVisibility.current !== 'visible') {
        lastVisibility.current = 'visible'
        screenLayerRef.current.style.visibility = 'visible'
      }
    } catch {
      if (lastVisibility.current !== 'hidden') {
        lastVisibility.current = 'hidden'
        screenLayerRef.current.style.visibility = 'hidden'
      }
    }
  })

  return (
    <group ref={rootRef}>
      <PhoneModel ref={modelRef} />
    </group>
  )
}

/**
 * Camada 3D do celular flagship em titânio grafite.
 * Ocupa 100svh × 100vw, aria-hidden e sem eventos de ponteiro.
 * A tela HTML é projetada com homografia precisa sobre o display do modelo 3D.
 */
export function PhoneCanvas(props: PhoneCanvasProps): React.JSX.Element {
  const { progress, quality, screen, onReady } = props
  const containerRef = useRef<HTMLDivElement>(null)
  const screenLayerRef = useRef<HTMLDivElement>(null)
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
          onReady={onReady}
          reducedMotion={!!reducedMotion}
          screenLayerRef={screenLayerRef}
        />
      </Canvas>

      {/* Camada DOM absoluta irmã do Canvas para o display projetado */}
      <div
        ref={screenLayerRef}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: SCREEN_W,
          height: SCREEN_H,
          transformOrigin: '0 0',
          borderRadius: SCREEN_RADIUS,
          overflow: 'hidden',
          pointerEvents: 'none',
          visibility: 'hidden',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      >
        {/* Conteúdo HTML da tela do app */}
        {screen}

        {/* Ilha frontal: pílula preta 126 × 37 px centralizada a 11px do topo */}
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-full bg-black"
          style={{
            top: 11,
            width: 126,
            height: 37,
          }}
          aria-hidden="true"
        />

        {/* Reflexo sutil de vidro para integração com a iluminação 3D */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0) 100%)',
            mixBlendMode: 'screen',
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
