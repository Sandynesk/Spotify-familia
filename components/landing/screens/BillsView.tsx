'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Sparkles, CalendarCheck } from 'lucide-react'
import { MEMBERS, formatBRL, statusOf } from '../data'
import { ScreenAvatar } from './ScreenAvatar'
import { ScreenBadge } from './ScreenBadge'

/**
 * View 'lista' (beat 'slots-3'):
 * "Cobranças de novembro": as 6 cobranças entram em sequência (stagger),
 * com status do momento inicial. Mostre um selo discreto: "Criadas automaticamente".
 */
export function BillsView() {
  const shouldReduce = useReducedMotion()

  return (
    <div className="w-full h-full flex flex-col justify-between py-2 select-none">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <h1 className="text-white font-bold text-xl leading-tight tracking-tight">
            Cobranças de novembro
          </h1>
          {/* Selo discreto */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#1DB954]/10 text-[#1DB954] border border-[#1DB954]/20 flex-shrink-0">
            <Sparkles className="w-3 h-3 text-[#1DB954]" />
            Criadas automaticamente
          </span>
        </div>
        <p className="text-[#86868B] text-xs">
          Pronto. Todo mês, as cobranças aparecem sozinhas.
        </p>
      </div>

      {/* Lista com stagger */}
      <div className="space-y-2 my-auto">
        {MEMBERS.map((member, i) => {
          const status = statusOf('inicial', member.id)

          return (
            <motion.div
              key={member.id}
              initial={shouldReduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: shouldReduce ? 0 : i * 0.08,
                duration: 0.35,
                ease: 'easeOut',
              }}
              className="flex items-center justify-between p-2.5 bg-[#181818] border border-white/5 rounded-xl"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <ScreenAvatar nome={member.nome} cor={member.cor} size="md" />
                <div className="truncate">
                  <p className="text-white font-semibold text-xs truncate">
                    {member.nome}
                  </p>
                  <p className="text-[#535353] text-[10px] mt-0.5">
                    Vencimento 10 de nov.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-white text-xs font-bold tabular-nums leading-none">
                  {formatBRL(member.valor)}
                </span>
                <ScreenBadge status={status} />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Card inferior */}
      <div className="bg-[#181818] border border-white/5 rounded-xl p-3 flex items-center gap-2">
        <CalendarCheck className="w-4 h-4 text-[#1DB954] flex-shrink-0" />
        <p className="text-xs text-[#A1A1A6] leading-tight">
          Nenhum cálculo na mão: os valores e status já vêm calculados.
        </p>
      </div>
    </div>
  )
}
