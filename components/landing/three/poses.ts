import * as THREE from 'three'
import type { Beat } from '../story/beats'
import { BEAT_ORDER } from '../story/beats'

export interface PhonePose {
  x: number
  y: number
  z: number
  rotX: number
  rotY: number
  rotZ: number
}

const TWO_PI = Math.PI * 2

/**
 * Poses de cada beat da narrativa 3D (espelha a tabela de docs/landing/contratos/three.md).
 * O giro completo entre 'hero' e 'slots-1' mostra a traseira com as três câmeras e volta de frente.
 */
export const BEAT_POSES: Readonly<Record<Beat, PhonePose>> = {
  hero: { x: 0.95, y: 0, z: 0, rotX: 0.06, rotY: -0.42, rotZ: 0.02 },
  'slots-1': { x: 0.95, y: 0, z: 0, rotX: 0.02, rotY: TWO_PI - 0.12, rotZ: 0 },
  'slots-2': { x: 0.95, y: 0, z: 0, rotX: 0.02, rotY: TWO_PI + 0.18, rotZ: -0.02 },
  'slots-3': { x: 0.95, y: 0, z: 0, rotX: 0, rotY: TWO_PI, rotZ: 0 },
  'paid-1': { x: 0.7, y: -0.05, z: 1.1, rotX: 0.1, rotY: TWO_PI + 0.28, rotZ: 0 },
  'paid-2': { x: 0.7, y: -0.05, z: 1.3, rotX: 0.08, rotY: TWO_PI + 0.12, rotZ: 0 },
  'paid-3': { x: 0.95, y: 0, z: 0.4, rotX: 0.04, rotY: TWO_PI - 0.3, rotZ: 0.02 },
}

const STEPS = BEAT_ORDER.length - 1

/**
 * Interpola a pose-alvo para um dado progresso p ∈ [0, 1] e muta `target` diretamente,
 * garantindo zero alocação por frame.
 */
export function computeTargetPose(
  p: number,
  isMobile: boolean,
  viewportWidth: number,
  viewportHeight: number,
  target: PhonePose,
): void {
  const clamped = Math.max(0, Math.min(1, p))
  const stepFloat = clamped * STEPS
  const index = Math.min(Math.floor(stepFloat), STEPS - 1)
  const frac = stepFloat - index
  // Interpolação suave hermite (smoothstep)
  const t = frac * frac * (3 - 2 * frac)

  const beatA = BEAT_ORDER[index]
  const beatB = BEAT_ORDER[index + 1]
  const poseA = BEAT_POSES[beatA]
  const poseB = BEAT_POSES[beatB]

  const rawX = THREE.MathUtils.lerp(poseA.x, poseB.x, t)
  const rawY = THREE.MathUtils.lerp(poseA.y, poseB.y, t)
  const rawZ = THREE.MathUtils.lerp(poseA.z, poseB.z, t)
  const rawRotX = THREE.MathUtils.lerp(poseA.rotX, poseB.rotX, t)
  const rawRotY = THREE.MathUtils.lerp(poseA.rotY, poseB.rotY, t)
  const rawRotZ = THREE.MathUtils.lerp(poseA.rotZ, poseB.rotZ, t)

  if (isMobile) {
    // Retrato/mobile: centralizado em X, posicionado no terço superior para dar espaço ao texto
    target.x = 0
    target.y = viewportHeight * 0.16 + rawY * 0.4
    target.z = rawZ * 0.5
    target.rotX = rawRotX
    target.rotY = rawRotY
    target.rotZ = rawRotZ
  } else {
    target.x = rawX
    target.y = rawY
    target.z = rawZ
    target.rotX = rawRotX
    target.rotY = rawRotY
    target.rotZ = rawRotZ
  }
}
