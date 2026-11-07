'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  Users,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ChevronRight,
} from 'lucide-react'
import type { PanelMoment } from '../data'
import { MEMBERS, MES_REFERENCIA, formatBRL, statusOf, summaryOf } from '../data'
import { ScreenAvatar } from './ScreenAvatar'
import { ScreenBadge } from './ScreenBadge'
import { AnimatedCurrency, AnimatedPercent } from './AnimatedNumbers'

interface DashboardViewProps {
  moment: PanelMoment
  isStatic?: boolean
}

/**
 * Visual completo do painel do mês, idêntico ao app real:
 * - Header ("Olá" + mês)
 * - SummaryCards 2×2 (Membros ativos, A receber, Já pago, Em atraso)
 * - ProgressBar (mês, %, "R$ x de R$ y" e animação scaleX)
 * - Lista de membros com avatar, valor, badge e botão ✓ com toque animado
 */
export function DashboardView({ moment, isStatic = false }: DashboardViewProps) {
  const shouldReduce = useReducedMotion()
  const summary = summaryOf(moment)

  const lastMomentRef = useRef<PanelMoment>(moment)
  const [activeRipple, setActiveRipple] = useState<string | null>(null)

  useEffect(() => {
    if (isStatic || shouldReduce) {
      lastMomentRef.current = moment
      return
    }

    const prev = lastMomentRef.current
    lastMomentRef.current = moment

    if (prev === 'inicial' && moment === 'carla-pagou') {
      setActiveRipple('carla')
      const timer = setTimeout(() => setActiveRipple(null), 550)
      return () => clearTimeout(timer)
    }

    if (prev === 'carla-pagou' && moment === 'completo') {
      setActiveRipple('diego')
      const timer = setTimeout(() => setActiveRipple(null), 550)
      return () => clearTimeout(timer)
    }
  }, [moment, isStatic, shouldReduce])

  const summaryCards = [
    {
      label: 'Membros ativos',
      valueComponent: <span className="tabular-nums">{summary.membrosAtivos}</span>,
      sub: 'no plano',
      icon: Users,
      iconColor: '#1DB954',
      iconBg: 'rgba(29,185,84,0.1)',
    },
    {
      label: 'A receber',
      valueComponent: <span className="tabular-nums">{formatBRL(summary.aReceber)}</span>,
      sub: 'este mês',
      icon: TrendingUp,
      iconColor: '#509BF5',
      iconBg: 'rgba(80,155,245,0.1)',
    },
    {
      label: 'Já pago',
      valueComponent: (
        <AnimatedCurrency
          value={summary.jaPago}
          isStatic={isStatic}
        />
      ),
      sub: 'confirmado',
      icon: CheckCircle,
      iconColor: '#1DB954',
      iconBg: 'rgba(29,185,84,0.1)',
    },
    {
      label: 'Em atraso',
      valueComponent: (
        <AnimatedCurrency
          value={summary.emAtraso}
          isStatic={isStatic}
        />
      ),
      sub: summary.emAtraso > 0 ? 'cobrar!' : 'tudo ok',
      icon: AlertCircle,
      iconColor: summary.emAtraso > 0 ? '#E22134' : '#535353',
      iconBg: summary.emAtraso > 0 ? 'rgba(226,33,52,0.1)' : 'rgba(83,83,83,0.1)',
    },
  ]

  return (
    <div className="w-full h-full flex flex-col justify-between py-1 select-none">
      {/* 1. Header ("Olá" + mês) */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-white font-bold text-lg leading-tight tracking-tight">
            Olá
          </h1>
          <p className="text-[#86868B] text-[11px] font-medium capitalize mt-0.5 leading-none">
            {MES_REFERENCIA}
          </p>
        </div>
        <ScreenAvatar nome="Você" cor="#1DB954" size="sm" />
      </div>

      {/* 2. SummaryCards 2×2 */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="bg-[#181818] border border-white/5 rounded-xl p-2.5 flex flex-col justify-between"
            >
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center mb-1.5"
                style={{ backgroundColor: card.iconBg }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: card.iconColor }} />
              </div>
              <div>
                <p className="text-[#A1A1A6] text-[10px] font-medium leading-none mb-1">
                  {card.label}
                </p>
                <p className="text-white font-bold text-sm leading-tight">
                  {card.valueComponent}
                </p>
                <p
                  className={`text-[9px] leading-none mt-1 font-medium ${
                    card.label === 'Em atraso' && summary.emAtraso > 0
                      ? 'text-[#E22134]'
                      : 'text-[#535353]'
                  }`}
                >
                  {card.sub}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* 3. ProgressBar */}
      <div className="bg-[#181818] border border-white/5 rounded-xl p-2.5 mb-2">
        <div className="flex items-center justify-between mb-1.5">
          <div>
            <h2 className="text-white font-semibold text-xs capitalize leading-tight">
              {MES_REFERENCIA}
            </h2>
            <p className="text-[#535353] text-[9px] mt-0.5 leading-none">Mês atual</p>
          </div>
          <div className="text-right">
            <p className="text-white font-bold text-xs leading-tight">
              <AnimatedPercent value={summary.progresso} isStatic={isStatic} />
            </p>
            <p className="text-[#535353] text-[9px] mt-0.5 leading-none tabular-nums">
              <AnimatedCurrency value={summary.jaPago} isStatic={isStatic} /> de{' '}
              {formatBRL(summary.aReceber)}
            </p>
          </div>
        </div>

        {/* Track com scaleX animado */}
        <div className="h-1.5 bg-[#282828] rounded-full overflow-hidden mt-1.5">
          <motion.div
            className="h-full bg-[#1DB954] rounded-full w-full"
            style={{ transformOrigin: 'left' }}
            initial={false}
            animate={{ scaleX: summary.progresso / 100 }}
            transition={{
              duration: shouldReduce || isStatic ? 0 : 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        </div>

        {summary.progresso === 100 && (
          <motion.p
            initial={shouldReduce || isStatic ? false : { opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-[#1DB954] text-[10px] font-semibold mt-1.5 text-center leading-none"
          >
            🎉 Arrecadação completa!
          </motion.p>
        )}
      </div>

      {/* 4. Lista de Membros */}
      <div className="flex-1 min-h-0 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1.5">
          <h2 className="text-white font-semibold text-xs leading-none">Membros</h2>
          <span className="text-[10px] text-[#1DB954] font-medium leading-none">
            Ver todos
          </span>
        </div>

        <div className="space-y-1.5">
          {MEMBERS.map((member) => {
            const status = statusOf(moment, member.id)
            const showButton = status === 'pendente' || status === 'atrasado'
            const isRippling = activeRipple === member.id

            return (
              <div
                key={member.id}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-[#181818] border border-white/5 rounded-lg"
              >
                <ScreenAvatar nome={member.nome} cor={member.cor} size="sm" />

                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-xs truncate leading-snug">
                    {member.nome}
                  </p>
                  <p className="text-[#535353] text-[9px] truncate leading-none mt-0.5">
                    dia {member.vencimento}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                  <span className="text-white text-xs font-semibold tabular-nums leading-snug">
                    {formatBRL(member.valor)}
                  </span>
                  <motion.div
                    key={`${member.id}-${status}`}
                    initial={shouldReduce || isStatic ? false : { opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: shouldReduce || isStatic ? 0 : 0.2 }}
                  >
                    <ScreenBadge status={status} />
                  </motion.div>
                </div>

                {/* Área do botão ✓ com ripple animado */}
                <div className="relative w-6 h-6 flex items-center justify-center flex-shrink-0 ml-0.5">
                  <AnimatePresence>
                    {isRippling && (
                      <motion.span
                        key={`ripple-${member.id}`}
                        initial={{ scale: 0.7, opacity: 0.9 }}
                        animate={{ scale: 2.2, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="absolute inset-0 rounded-full bg-[#1DB954] pointer-events-none z-10"
                      />
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {showButton && (
                      <motion.div
                        key={`btn-${member.id}`}
                        initial={shouldReduce || isStatic ? false : { scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={shouldReduce || isStatic ? false : { scale: 0.4, opacity: 0 }}
                        transition={{ duration: shouldReduce || isStatic ? 0 : 0.2 }}
                        className="w-6 h-6 rounded-full bg-[#1DB954]/10 flex items-center justify-center"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-[#1DB954]" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <ChevronRight className="w-3.5 h-3.5 text-[#535353] flex-shrink-0" />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
