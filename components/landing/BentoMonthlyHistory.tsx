import { Check } from 'lucide-react'
import { BentoCard } from './BentoCard'
import { formatBRL } from './data'

export function BentoMonthlyHistory() {
  const months = [
    { mes: 'Setembro', status: 'Total confirmado', valor: formatBRL(40) },
    { mes: 'Outubro', status: 'Total confirmado', valor: formatBRL(40) },
    { mes: 'Novembro', status: 'Em andamento', valor: formatBRL(26) },
  ]

  return (
    <BentoCard
      title="Histórico mês a mês."
      description="Tudo registrado, nada se perde."
      className="col-span-1"
    >
      <div className="flex flex-col gap-2 mt-5" aria-hidden="true">
        {months.map(({ mes, status, valor }) => (
          <div
            key={mes}
            className="flex items-center justify-between p-2.5 px-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-(--landing-accent)/15 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-(--landing-accent)" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-medium text-white leading-tight">{mes}</p>
                <p className="text-[10px] text-[#86868B]">{status}</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-[#A1A1A6] tabular-nums">
              {valor}
            </span>
          </div>
        ))}
      </div>
    </BentoCard>
  )
}
