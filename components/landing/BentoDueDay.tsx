import { BentoCard } from './BentoCard'

export function BentoDueDay() {
  return (
    <BentoCard
      title="Vencimento por pessoa."
      description="Cada membro com seu próprio dia."
      className="col-span-1"
    >
      <div className="flex flex-col items-center justify-center mt-5" aria-hidden="true">
        {/* Chip de calendário estilo Apple */}
        <div className="w-full max-w-[170px] rounded-2xl bg-[#141416] border border-white/[0.08] shadow-lg flex flex-col items-center text-center py-4 px-5 relative overflow-hidden">
          <span className="text-[10px] font-semibold tracking-widest uppercase text-(--landing-accent)">
            TODO DIA
          </span>
          <span className="text-5xl md:text-6xl font-bold tabular-nums text-white tracking-[-0.04em] my-1 leading-none">
            10
          </span>
          <span className="text-xs text-[#86868B] font-medium">
            vencimento
          </span>
        </div>
        <p className="text-[11px] text-[#86868B] text-center mt-3 tracking-wide">
          Datas individuais de 1 a 28
        </p>
      </div>
    </BentoCard>
  )
}
