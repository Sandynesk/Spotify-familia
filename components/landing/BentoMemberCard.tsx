import { Check } from 'lucide-react'
import { BentoCard } from './BentoCard'
import { BentoAvatar } from './BentoAvatar'
import { formatBRL } from './data'

export function BentoMemberCard() {
  const historyPoints = [
    { month: 'Jun', paid: true },
    { month: 'Jul', paid: true },
    { month: 'Ago', paid: true },
    { month: 'Set', paid: true },
    { month: 'Out', paid: true },
    { month: 'Nov', paid: true },
  ]

  return (
    <BentoCard
      title="Por membro."
      description="Abra qualquer pessoa e veja o histórico dela."
      className="col-span-1 md:col-span-2 lg:col-span-2"
    >
      <div
        className="mt-5 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-5"
        aria-hidden="true"
      >
        {/* Info do Membro */}
        <div className="flex items-center gap-3.5">
          <BentoAvatar nome="Bruno" cor="#509BF5" size="md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-white">Bruno</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.06] text-[#A1A1A6] font-medium">
                Vencimento dia 10
              </span>
            </div>
            <p className="text-xs text-[#86868B] mt-0.5">
              {formatBRL(7)} por mês · Membro ativo
            </p>
          </div>
        </div>

        {/* Mini histórico de 6 pontos */}
        <div className="flex items-center gap-2.5 sm:gap-3 self-center sm:self-auto">
          {historyPoints.map(({ month, paid }) => (
            <div key={month} className="flex flex-col items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform ${
                  paid
                    ? 'bg-(--landing-accent)/15 text-(--landing-accent) border border-(--landing-accent)/30'
                    : 'bg-white/[0.04] text-[#86868B] border border-white/[0.08]'
                }`}
                title={`${month}: Pago`}
              >
                <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-medium text-[#86868B] uppercase">
                {month}
              </span>
            </div>
          ))}
        </div>
      </div>
    </BentoCard>
  )
}
