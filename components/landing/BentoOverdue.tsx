import { BentoCard } from './BentoCard'
import { BentoAvatar } from './BentoAvatar'

export function BentoOverdue() {
  return (
    <BentoCard
      title="Atrasos em destaque."
      description="Vermelho quando passa do dia. Verde quando acerta."
      className="col-span-1"
    >
      <div className="flex flex-col gap-2.5 mt-5" aria-hidden="true">
        {/* Diego - Atrasado */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <div className="flex items-center gap-2.5">
            <BentoAvatar nome="Diego" cor="#AF2896" size="sm" />
            <span className="text-sm font-medium text-white">Diego</span>
          </div>
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: 'rgba(226,33,52,0.15)', color: '#E22134' }}
            role="status"
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: '#E22134' }}
            />
            Atrasado
          </span>
        </div>

        {/* Ana - Pago */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <div className="flex items-center gap-2.5">
            <BentoAvatar nome="Ana" cor="#1DB954" size="sm" />
            <span className="text-sm font-medium text-white">Ana</span>
          </div>
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: 'rgba(29,185,84,0.15)', color: 'var(--landing-accent)' }}
            role="status"
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: 'var(--landing-accent)' }}
            />
            Pago
          </span>
        </div>
      </div>
    </BentoCard>
  )
}
