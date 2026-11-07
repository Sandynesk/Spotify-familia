'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { CheckCircle2, ShieldCheck } from 'lucide-react'
import { MEMBERS } from '../data'
import { ScreenAvatar } from './ScreenAvatar'

/**
 * View 'vagas' (beat 'slots-1'):
 * "Seu plano · 6 de 6 vagas": grade 3×2 de vagas.
 * Ao entrar nesta view, os avatares entram um a um (stagger de 120 ms, scale 0.6→1 + opacity),
 * cada um com o nome embaixo.
 */
export function SlotsView() {
  const shouldReduce = useReducedMotion()

  return (
    <div className="w-full h-full flex flex-col justify-between py-2 select-none">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954]" />
          <span className="text-[10px] font-semibold text-[#1DB954] tracking-wider uppercase">
            Seu plano
          </span>
        </div>
        <h1 className="text-white font-bold text-xl leading-tight tracking-tight">
          6 de 6 vagas
        </h1>
        <p className="text-[#86868B] text-xs mt-0.5">
          Cadastre cada pessoa uma vez.
        </p>
      </div>

      {/* Grade 3×2 de vagas com stagger de 120ms */}
      <div className="grid grid-cols-3 gap-2.5 my-auto">
        {MEMBERS.map((member, i) => (
          <motion.div
            key={member.id}
            initial={shouldReduce ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: shouldReduce ? 0 : i * 0.12,
              duration: 0.4,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="bg-[#181818] border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center text-center gap-2"
          >
            <ScreenAvatar
              nome={member.nome}
              cor={member.cor}
              size="lg"
              className="w-12 h-12 text-sm shadow-md"
            />
            <div className="w-full">
              <p className="text-white font-semibold text-xs truncate">
                {member.nome}
              </p>
              <p className="text-[#535353] text-[10px] mt-0.5 font-medium">
                Vaga {i + 1}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Card inferior informativo */}
      <div className="bg-[#181818] border border-white/5 rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#1DB954]" />
          <div>
            <p className="text-white text-xs font-medium leading-tight">
              Plano Família
            </p>
            <p className="text-[#535353] text-[10px] leading-none mt-0.5">
              6 membros cadastrados
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#1DB954]/15 text-[#1DB954]">
          <CheckCircle2 className="w-3 h-3" />
          Completo
        </span>
      </div>
    </div>
  )
}
