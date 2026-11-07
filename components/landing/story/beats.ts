import type { PanelMoment } from '../data'

// A narrativa 3D (seções 1–3 do storyboard) é um único trecho de scroll.
// Cada beat é um bloco de texto de altura EXATA 100svh, no fluxo normal, na ordem desta lista.
// Com N blocos, o trecho rola (N − 1) telas: o progresso p ∈ [0, 1] vem de
// useScroll({ offset: ['start start', 'end end'] }), e o bloco i encosta no topo da tela em p = i/(N−1).
// O beat i fica ativo de meia tela antes até meia tela depois desse ponto.

export type Beat = 'hero' | 'slots-1' | 'slots-2' | 'slots-3' | 'paid-1' | 'paid-2' | 'paid-3'

export const BEAT_ORDER: readonly Beat[] = [
  'hero',
  'slots-1',
  'slots-2',
  'slots-3',
  'paid-1',
  'paid-2',
  'paid-3',
]

export interface BeatRange {
  id: Beat
  /** início do beat no progresso p */
  start: number
  /** fim do beat no progresso p */
  end: number
}

const STEPS = BEAT_ORDER.length - 1
const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1)

/** Ponto do progresso em que o bloco do beat encosta no topo da tela (o "centro" do beat). */
export function beatCenter(beat: Beat): number {
  return BEAT_ORDER.indexOf(beat) / STEPS
}

export const BEATS: readonly BeatRange[] = BEAT_ORDER.map((id, i) => ({
  id,
  start: clamp01((i - 0.5) / STEPS),
  end: clamp01((i + 0.5) / STEPS),
}))

export function beatAt(p: number): Beat {
  return BEAT_ORDER[Math.round(clamp01(p) * STEPS)]
}

/** Progresso local (0–1) dentro de um beat, para animações finas. */
export function localProgress(p: number, beat: Beat): number {
  const range = BEATS.find((b) => b.id === beat)!
  return clamp01((p - range.start) / (range.end - range.start))
}

/** Estado do painel mostrado na tela do celular em cada beat (BRIEF §4). */
export function momentOf(beat: Beat): PanelMoment {
  if (beat === 'paid-2') return 'carla-pagou'
  if (beat === 'paid-3') return 'completo'
  return 'inicial'
}

/** Que "tela" do app o celular mostra em cada beat. */
export type ScreenView = 'painel' | 'vagas' | 'valores' | 'lista'

export function viewOf(beat: Beat): ScreenView {
  switch (beat) {
    case 'slots-1':
      return 'vagas'
    case 'slots-2':
      return 'valores'
    case 'slots-3':
      return 'lista'
    default:
      return 'painel'
  }
}
