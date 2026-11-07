'use client'

import { createContext, useContext, useRef, useState } from 'react'
import { useMotionValueEvent, useScroll, type MotionValue } from 'framer-motion'
import { beatAt, type Beat } from './beats'
import { PhoneStage } from './PhoneStage'

interface StoryState {
  /** progresso 0–1 do trecho inteiro da narrativa 3D */
  progress: MotionValue<number>
  /** beat atual — só muda de valor quando cruza uma fronteira (não re-renderiza a cada frame) */
  beat: Beat
}

const StoryContext = createContext<StoryState | null>(null)

export function useStory(): StoryState {
  const ctx = useContext(StoryContext)
  if (!ctx) throw new Error('useStory precisa estar dentro de <StoryStage>')
  return ctx
}

/**
 * Trecho de scroll das seções 1–3.
 * Camada de trás: o celular (3D ou imagem de reserva), preso na tela com `sticky`.
 * Camada da frente: os blocos de texto (`children`), um por beat, cada um com `min-h-[100svh]`.
 */
export function StoryStage({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [beat, setBeat] = useState<Beat>('hero')

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const next = beatAt(p)
    setBeat((prev) => (prev === next ? prev : next))
  })

  return (
    <StoryContext.Provider value={{ progress: scrollYProgress, beat }}>
      <div ref={ref} className="relative">
        <div className="pointer-events-none sticky top-0 -mb-[100svh] h-[100svh] overflow-hidden">
          <PhoneStage />
        </div>
        <div className="relative">{children}</div>
      </div>
    </StoryContext.Provider>
  )
}
