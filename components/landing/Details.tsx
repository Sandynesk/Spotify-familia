import { Section } from './primitives/Section'
import { Reveal } from './primitives/Reveal'
import { BentoYearGrid } from './BentoYearGrid'
import { BentoPhotoCard } from './BentoPhotoCard'
import { BentoCustomAmount } from './BentoCustomAmount'
import { BentoDueDay } from './BentoDueDay'
import { BentoOverdue } from './BentoOverdue'
import { BentoMonthlyHistory } from './BentoMonthlyHistory'
import { BentoMemberCard } from './BentoMemberCard'

/**
 * Seção 5: Detalhes (#detalhes).
 * Grade bento no estilo apple.com com 7 cards:
 * - O ano inteiro numa grade (2x2)
 * - Foto pocket com tela real encaixada (1x2)
 * - Valor de cada um, do seu jeito (1x1)
 * - Vencimento por pessoa (1x1)
 * - Atrasos em destaque (1x1)
 * - Histórico mês a mês (1x1)
 * - Por membro (2x1)
 */
export function Details() {
  return (
    <Section id="detalhes" width="wide">
      <div className="mb-12 md:mb-16">
        <Reveal>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-[-0.035em] leading-[1.02] text-balance text-white">
            Pensado nos detalhes.
          </h2>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-fr">
        {/* Card 1: 2x2 desktop */}
        <Reveal delay={0.05} className="col-span-1 md:col-span-2 lg:col-span-2 lg:row-span-2 h-full flex flex-col">
          <BentoYearGrid />
        </Reveal>

        {/* Card 2: 1x2 foto pocket */}
        <Reveal delay={0.1} className="col-span-1 md:col-span-1 lg:col-span-1 lg:row-span-2 h-full flex flex-col">
          <BentoPhotoCard />
        </Reveal>

        {/* Card 3: 1x1 valor individual */}
        <Reveal delay={0.15} className="col-span-1 md:col-span-1 lg:col-span-1 lg:row-span-1 h-full flex flex-col">
          <BentoCustomAmount />
        </Reveal>

        {/* Card 4: 1x1 vencimento individual */}
        <Reveal delay={0.2} className="col-span-1 md:col-span-1 lg:col-span-1 lg:row-span-1 h-full flex flex-col">
          <BentoDueDay />
        </Reveal>

        {/* Card 5: 1x1 atrasos em destaque */}
        <Reveal delay={0.25} className="col-span-1 md:col-span-1 lg:col-span-1 lg:row-span-1 h-full flex flex-col">
          <BentoOverdue />
        </Reveal>

        {/* Card 6: 1x1 histórico mês a mês */}
        <Reveal delay={0.3} className="col-span-1 md:col-span-1 lg:col-span-1 lg:row-span-1 h-full flex flex-col">
          <BentoMonthlyHistory />
        </Reveal>

        {/* Card 7: 2x1 histórico por membro */}
        <Reveal delay={0.35} className="col-span-1 md:col-span-2 lg:col-span-2 lg:row-span-1 h-full flex flex-col">
          <BentoMemberCard />
        </Reveal>
      </div>
    </Section>
  )
}
