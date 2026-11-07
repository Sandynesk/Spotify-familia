'use client'

import { useEffect, useRef } from 'react'
import { animate, useInView, useReducedMotion } from 'framer-motion'
import { Section } from './primitives/Section'
import { Reveal } from './primitives/Reveal'
import { formatBRL, summaryOf } from './data'

interface AnimatedStatProps {
  from: number
  to: number
  duration?: number
}

function AnimatedDigit({ from, to, duration = 1.4 }: AnimatedStatProps) {
  const spanRef = useRef<HTMLSpanElement>(null)
  const isInView = useInView(spanRef, { once: true, margin: '0px 0px -10% 0px' })
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (!isInView || !spanRef.current) return

    if (reducedMotion) {
      spanRef.current.textContent = String(to)
      return
    }

    spanRef.current.textContent = String(from)
    const controls = animate(from, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(value) {
        if (spanRef.current) {
          spanRef.current.textContent = String(Math.round(value))
        }
      },
    })

    return () => controls.stop()
  }, [isInView, from, to, duration, reducedMotion])

  return <span ref={spanRef}>{to}</span>
}

/**
 * Seção 6: Números.
 * Três números enormes estilo Apple keynote, sem cards, com contagem ao entrar na tela.
 * - 6 vagas sob controle (0 → 6)
 * - 1 toque para registrar um pagamento (0 → 1, com o "1" em verde)
 * - 0 planilhas (12 → 0)
 * Linha final calculada a partir de data.ts: "R$ 40,00 por mês, dividido do jeito certo."
 */
export function Numbers() {
  const valorMensal = formatBRL(summaryOf('inicial').aReceber)

  return (
    <Section width="wide" className="py-28 md:py-40">
      {/* Grade com os três números lado a lado no desktop, empilhados no mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-14 md:gap-8 lg:gap-12 text-center items-start">
        {/* Número 1: 6 vagas sob controle */}
        <Reveal delay={0.1} className="flex flex-col items-center">
          <div className="text-[clamp(64px,11vw,168px)] font-bold tracking-[-0.05em] leading-none tabular-nums text-white">
            <AnimatedDigit from={0} to={6} />
          </div>
          <p className="text-base md:text-xl font-normal text-[#A1A1A6] mt-4 md:mt-6 leading-snug max-w-[240px] text-balance">
            vagas sob controle
          </p>
        </Reveal>

        {/* Número 2: 1 toque para registrar um pagamento */}
        <Reveal delay={0.2} className="flex flex-col items-center">
          <div className="flex items-baseline justify-center">
            <span className="text-[clamp(64px,11vw,168px)] font-bold tracking-[-0.05em] leading-none tabular-nums text-(--landing-accent)">
              <AnimatedDigit from={0} to={1} />
            </span>
            <span className="text-[clamp(28px,4.5vw,72px)] font-bold tracking-[-0.04em] leading-none text-white ml-2 md:ml-3">
              toque
            </span>
          </div>
          <p className="text-base md:text-xl font-normal text-[#A1A1A6] mt-4 md:mt-6 leading-snug max-w-[240px] text-balance">
            para registrar um pagamento
          </p>
        </Reveal>

        {/* Número 3: 0 planilhas (12 → 0) */}
        <Reveal delay={0.3} className="flex flex-col items-center">
          <div className="text-[clamp(64px,11vw,168px)] font-bold tracking-[-0.05em] leading-none tabular-nums text-white">
            <AnimatedDigit from={12} to={0} />
          </div>
          <p className="text-base md:text-xl font-normal text-[#A1A1A6] mt-4 md:mt-6 leading-snug max-w-[240px] text-balance">
            planilhas
          </p>
        </Reveal>
      </div>

      {/* Linha final calculada dinamicamente com respiro */}
      <div className="mt-24 md:mt-36 text-center">
        <Reveal delay={0.4}>
          <p className="text-xl md:text-2xl lg:text-3xl font-medium tracking-tight text-[#A1A1A6] text-balance">
            <span className="text-white font-semibold">{valorMensal}</span> por mês, dividido do jeito certo.
          </p>
        </Reveal>
      </div>
    </Section>
  )
}
