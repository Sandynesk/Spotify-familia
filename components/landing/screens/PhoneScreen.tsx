'use client'

// STUB da fundação — o agente "screens" substitui o conteúdo mantendo a assinatura exportada.
import type { Beat } from '../story/beats'
import { momentOf, viewOf } from '../story/beats'
import { SCREEN_H, SCREEN_RADIUS, SCREEN_W } from './size'

export interface PhoneScreenProps {
  beat: Beat
}

export function PhoneScreen({ beat }: PhoneScreenProps) {
  return (
    <div
      style={{ width: SCREEN_W, height: SCREEN_H, borderRadius: SCREEN_RADIUS }}
      className="flex flex-col items-center justify-center gap-2 overflow-hidden bg-[#121212] text-white"
    >
      <span className="text-sm opacity-60">stub</span>
      <span className="text-2xl font-bold">{viewOf(beat)}</span>
      <span className="text-sm opacity-60">{momentOf(beat)}</span>
    </div>
  )
}
