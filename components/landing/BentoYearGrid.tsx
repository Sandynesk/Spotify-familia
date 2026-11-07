'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { BentoCard } from './BentoCard'
import { MEMBERS, formatBRL } from './data'

const MONTH_INITIALS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'] as const
const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
] as const

type SquareStatus = 'pago' | 'atrasado' | 'futuro'

function getStatus(memberId: string, monthIdx: number): SquareStatus {
  // Mês 11 (dezembro/2026): futuro
  if (monthIdx === 11) return 'futuro'

  // Exatamente 3 atrasos espalhados:
  // 1. Carla em março (mês 2)
  if (memberId === 'carla' && monthIdx === 2) return 'atrasado'
  // 2. Diego em junho (mês 5)
  if (memberId === 'diego' && monthIdx === 5) return 'atrasado'
  // 3. Diego em novembro (mês 10, mês de referência do BRIEF §3)
  if (memberId === 'diego' && monthIdx === 10) return 'atrasado'

  return 'pago'
}

// Percentual de arrecadação por mês (0 a 100)
const MONTHLY_COLLECTION = [
  100, // Jan
  100, // Fev
  83,  // Mar (Carla atrasou)
  100, // Abr
  100, // Mai
  83,  // Jun (Diego atrasou)
  100, // Jul
  100, // Ago
  100, // Set
  100, // Out
  65,  // Nov (65% arrecadado no estado inicial do BRIEF §3)
  0,   // Dez (futuro)
]

export function BentoYearGrid() {
  const reducedMotion = useReducedMotion()

  return (
    <BentoCard
      title="O ano inteiro numa grade."
      description="Visão geral de membros × meses, com gráficos."
      className="col-span-1 md:col-span-2 lg:col-span-2 lg:row-span-2"
    >
      <div className="flex flex-col gap-6 mt-4 select-none" aria-hidden="true">
        {/* Container da Grade 6x12 com scroll horizontal protegido */}
        <div className="w-full overflow-x-auto overflow-y-hidden pb-1 -mx-2 px-2 scrollbar-none">
          <div className="min-w-[280px]">
            {/* Cabeçalho dos meses */}
            <div className="grid grid-cols-[3.25rem_repeat(12,minmax(0,1fr))] gap-1 md:gap-1.5 mb-1.5 items-center">
              <span className="text-[10px] uppercase font-semibold text-[#86868B] pr-1">Membro</span>
              {MONTH_INITIALS.map((initial, i) => (
                <span
                  key={`month-${i}`}
                  className={`text-[10px] md:text-xs font-semibold text-center ${
                    i === 10 ? 'text-(--landing-accent)' : i === 11 ? 'text-[#86868B]' : 'text-[#A1A1A6]'
                  }`}
                  title={MONTH_NAMES[i]}
                >
                  {initial}
                </span>
              ))}
            </div>

            {/* Linhas dos 6 membros */}
            <div className="flex flex-col gap-1 md:gap-1.5">
              {MEMBERS.map((member, rowIdx) => (
                <div
                  key={member.id}
                  className="grid grid-cols-[3.25rem_repeat(12,minmax(0,1fr))] gap-1 md:gap-1.5 items-center"
                >
                  <span className="text-xs font-medium text-[#A1A1A6] truncate pr-1 text-right">
                    {member.nome}
                  </span>

                  {MONTH_NAMES.map((_, colIdx) => {
                    const status = getStatus(member.id, colIdx)
                    const diagonalIndex = rowIdx + colIdx

                    let statusClass = 'bg-(--landing-accent)'
                    if (status === 'atrasado') {
                      statusClass = 'bg-[#E22134]'
                    } else if (status === 'futuro') {
                      statusClass = 'bg-white/[0.07] border border-white/[0.04]'
                    }

                    if (reducedMotion) {
                      return (
                        <div
                          key={`${member.id}-${colIdx}`}
                          className={`aspect-square w-full rounded-[4px] md:rounded-[5px] ${statusClass}`}
                        />
                      )
                    }

                    return (
                      <motion.div
                        key={`${member.id}-${colIdx}`}
                        initial={{ opacity: 0, scale: 0.3 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: '0px 0px -10% 0px' }}
                        transition={{
                          duration: 0.32,
                          delay: diagonalIndex * 0.024,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className={`aspect-square w-full rounded-[4px] md:rounded-[5px] ${statusClass}`}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mini gráfico de barras de arrecadação por mês */}
        <div className="pt-4 border-t border-white/[0.06] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-[#86868B]">
            <span className="font-medium text-[#A1A1A6]">Arrecadação mensal</span>
            <span className="tabular-nums">Meta: {formatBRL(40)}/mês</span>
          </div>

          <div className="w-full overflow-x-auto overflow-y-hidden pb-1 -mx-2 px-2 scrollbar-none">
            <div className="min-w-[280px]">
              <div className="grid grid-cols-[3.25rem_repeat(12,minmax(0,1fr))] gap-1 md:gap-1.5 items-end h-10 md:h-12">
                <span className="text-[10px] text-[#86868B] text-right pr-1 pb-0.5">Total</span>
                {MONTHLY_COLLECTION.map((percent, i) => {
                  const isFuture = i === 11
                  const isCurrent = i === 10
                  const isOverdueMonth = percent < 100 && !isFuture && !isCurrent

                  const barBg = isFuture
                    ? 'bg-white/[0.05]'
                    : isOverdueMonth
                    ? 'bg-gradient-to-t from-(--landing-accent) to-[#E22134]/90'
                    : 'bg-(--landing-accent)'

                  const heightPercent = Math.max(percent, isFuture ? 6 : 10)

                  if (reducedMotion) {
                    return (
                      <div
                        key={`bar-${i}`}
                        className="h-full flex items-end justify-center"
                        title={`${MONTH_NAMES[i]}: ${percent}% arrecadado`}
                      >
                        <div
                          className={`w-full max-w-[14px] rounded-t-[3px] ${barBg}`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                    )
                  }

                  return (
                    <div
                      key={`bar-${i}`}
                      className="h-full flex items-end justify-center"
                      title={`${MONTH_NAMES[i]}: ${percent}% arrecadado`}
                    >
                      <motion.div
                        initial={{ opacity: 0, scaleY: 0 }}
                        whileInView={{ opacity: 1, scaleY: 1 }}
                        viewport={{ once: true }}
                        style={{ transformOrigin: 'bottom', height: `${heightPercent}%` }}
                        transition={{
                          duration: 0.5,
                          delay: 0.35 + i * 0.025,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className={`w-full max-w-[14px] rounded-t-[3px] ${barBg}`}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BentoCard>
  )
}
