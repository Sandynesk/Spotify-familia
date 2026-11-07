'use client'

import { useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useStory } from './StoryStage'
import type { Beat } from './beats'

interface StoryHeading {
  line1: string
  line2: string
}

interface StoryTextProps {
  beat: Beat
  step: '01' | '02' | '03'
  title: string
  support: string
  heading?: StoryHeading
  className?: string
}

/**
 * Conteúdo de texto de uma etapa da narrativa (Seis vagas e Quem pagou).
 * Gerencia o degradê de legibilidade mobile e a transição de opacidade por beat ativo.
 */
export function StoryText({
  beat,
  step,
  title,
  support,
  heading,
  className,
}: StoryTextProps) {
  const { beat: activeBeat } = useStory()
  const reducedMotion = useReducedMotion()
  const isActive = Boolean(reducedMotion) || activeBeat === beat

  return (
    <>
      {/* Degradê de legibilidade para mobile contra o celular ao fundo */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[65svh] bg-gradient-to-t from-black via-black/80 to-transparent md:hidden"
        aria-hidden="true"
      />

      {/* Bloco de texto com transição de opacidade (400ms) orientada pelo beat ativo */}
      <div
        className={cn(
          'relative z-10 flex flex-col transition-opacity duration-[400ms] ease-out',
          heading ? 'gap-6 md:gap-8' : 'gap-3 md:gap-4',
          isActive ? 'opacity-100' : 'opacity-30 motion-reduce:opacity-100',
          className,
        )}
      >
        {heading && (
          <h2 className="text-[clamp(32px,4vw,56px)] font-bold tracking-[-0.035em] leading-[1.04] text-balance">
            <span className="block text-white">{heading.line1}</span>
            <span className="block text-(--landing-accent)">{heading.line2}</span>
          </h2>
        )}

        <div className="flex flex-col gap-2">
          <span className="text-xs md:text-sm font-semibold tracking-widest text-(--landing-accent) uppercase tabular-nums">
            {step}
          </span>
          <p className="text-[clamp(28px,3vw,40px)] font-semibold tracking-[-0.03em] leading-[1.1] text-white text-balance">
            {title}
          </p>
          <p className="text-[clamp(16px,1.4vw,20px)] font-normal leading-relaxed text-[#A1A1A6] text-balance">
            {support}
          </p>
        </div>
      </div>
    </>
  )
}
