import { BentoCard } from './BentoCard'
import { BentoAvatar } from './BentoAvatar'
import { formatBRL } from './data'

export function BentoCustomAmount() {
  return (
    <BentoCard
      title="Valor de cada um, do seu jeito."
      description="O Vô Zé paga R$ 5,00? Sem problema."
      className="col-span-1"
    >
      <div className="flex flex-col gap-2.5 mt-5" aria-hidden="true">
        {/* Linha destacada: Vô Zé */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-(--landing-accent)/10 border border-(--landing-accent)/25 shadow-[0_0_20px_rgba(29,185,84,0.08)]">
          <div className="flex items-center gap-3">
            <BentoAvatar nome="Vô Zé" cor="#8D67AB" size="sm" />
            <div>
              <p className="text-sm font-semibold text-white leading-tight">Vô Zé</p>
              <p className="text-[11px] text-[#A1A1A6]">Valor personalizado</p>
            </div>
          </div>
          <span className="text-sm font-bold text-(--landing-accent) tabular-nums">
            {formatBRL(5)}
          </span>
        </div>

        {/* Linha apagada: Ana */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] opacity-35">
          <div className="flex items-center gap-3">
            <BentoAvatar nome="Ana" cor="#1DB954" size="sm" />
            <div>
              <p className="text-sm font-medium text-white/70 leading-tight">Ana</p>
              <p className="text-[11px] text-[#86868B]">Valor padrão</p>
            </div>
          </div>
          <span className="text-sm font-semibold text-[#86868B] tabular-nums">
            {formatBRL(7)}
          </span>
        </div>
      </div>
    </BentoCard>
  )
}
