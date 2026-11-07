'use client'

import { useSyncExternalStore } from 'react'
import { useReducedMotion } from 'framer-motion'

/**
 * high   → 3D com qualidade cheia
 * low    → 3D com DPR/efeitos reduzidos
 * static → sem 3D (imagem de reserva): reduced-motion, sem WebGL, economia de dados ou aparelho fraco
 *
 * No SSR e na hidratação vale `null` (desconhecido); quem consome mostra a imagem de reserva.
 */
export type DeviceTier = 'high' | 'low' | 'static'

let cached: DeviceTier | undefined

function detect(): DeviceTier {
  if (cached) return cached
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
  let webgl = false
  try {
    const canvas = document.createElement('canvas')
    webgl = !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    webgl = false
  }
  const cores = nav.hardwareConcurrency ?? 4
  const memory = nav.deviceMemory ?? 4
  if (!webgl || nav.connection?.saveData || cores <= 2 || memory <= 2) cached = 'static'
  else {
    const coarse = window.matchMedia('(pointer: coarse)').matches
    cached = coarse || cores <= 4 || memory <= 4 ? 'low' : 'high'
  }
  return cached
}

// A capacidade do aparelho não muda durante a visita: não há o que assinar.
const subscribe = () => () => {}

export function useDeviceTier(): DeviceTier | null {
  const reduced = useReducedMotion()
  const tier = useSyncExternalStore(subscribe, detect, () => null)
  if (tier === null) return null
  return reduced ? 'static' : tier
}
