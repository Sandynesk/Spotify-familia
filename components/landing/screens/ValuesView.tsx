'use client'

import { CheckCircle2, Sparkles } from 'lucide-react'
import { MEMBERS, formatBRL } from '../data'
import { ScreenAvatar } from './ScreenAvatar'

/**
 * View 'valores' (beat 'slots-2'):
 * A lista de membros com "R$ 7,00 · dia 10".
 * A linha do Vô Zé · R$ 5,00 fica destacada (fundo #1DB954/10%, borda verde e leve scale).
 */
export function ValuesView() {
  return (
    <div className="w-full h-full flex flex-col justify-between py-2 select-none">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954]" />
          <span className="text-[10px] font-semibold text-[#1DB954] tracking-wider uppercase">
            Personalização
          </span>
        </div>
        <h1 className="text-white font-bold text-xl leading-tight tracking-tight">
          Valores e vencimentos
        </h1>
        <p className="text-[#86868B] text-xs mt-0.5">
          Defina quanto cada um paga e o dia do vencimento.
        </p>
      </div>

      {/* Lista com destaque no Vô Zé */}
      <div className="space-y-2 my-auto">
        {MEMBERS.map((member) => {
          const isVoZe = member.id === 'vo-ze'
          const valueText = `${formatBRL(member.valor)} · dia ${member.vencimento}`

          return (
            <div
              key={member.id}
              className={`flex items-center justify-between p-2.5 rounded-xl transition-transform ${
                isVoZe
                  ? 'bg-[#1DB954]/10 border border-[#1DB954] scale-[1.02] shadow-[0_0_16px_rgba(29,185,84,0.18)] z-10'
                  : 'bg-[#181818] border border-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <ScreenAvatar nome={member.nome} cor={member.cor} size="md" />
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <p className="text-white font-semibold text-xs truncate">
                      {member.nome}
                    </p>
                    {isVoZe && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#1DB954] text-black">
                        <Sparkles className="w-2.5 h-2.5" />
                        Destaque
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-[11px] font-medium mt-0.5 ${
                      isVoZe ? 'text-[#1DB954]' : 'text-[#A1A1A6]'
                    }`}
                  >
                    {valueText}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span
                  className={`text-xs font-bold tabular-nums ${
                    isVoZe ? 'text-[#1DB954]' : 'text-white'
                  }`}
                >
                  {formatBRL(member.valor)}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    isVoZe
                      ? 'bg-[#1DB954] text-black font-bold'
                      : 'bg-[#282828] text-[#86868B]'
                  }`}
                >
                  {isVoZe ? 'Especial' : 'Padrão'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Nota de rodapé */}
      <div className="bg-[#181818] border border-white/5 rounded-xl p-3 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-[#1DB954] flex-shrink-0" />
        <p className="text-xs text-[#A1A1A6] leading-tight">
          O Vô Zé paga R$ 5,00? Sem problema. Valores individuais para cada um.
        </p>
      </div>
    </div>
  )
}
