import { formatCurrency } from '@/lib/utils/currency'
import type { Pagamento } from '@/types/database'

interface MemberStatsProps {
  pagamentos: Pagamento[]
}

export function MemberStats({ pagamentos }: MemberStatsProps) {
  if (pagamentos.length === 0) return null

  const pagos = pagamentos.filter(p => p.status === 'pago').length
  const emAberto = pagamentos.filter(p => p.status === 'pendente' || p.status === 'atrasado').length
  const totalPago = pagamentos
    .filter(p => p.status === 'pago')
    .reduce((acc, p) => acc + Number(p.valor), 0)

  return (
    <div className="grid grid-cols-3 divide-x divide-app-line rounded-[var(--radius-app)] border border-app-line bg-app-surface p-3 text-center sm:p-4">
      <div className="px-2">
        <span className="block text-xs font-medium text-app-muted">Pagos</span>
        <span className="mt-0.5 block text-lg font-semibold tabular-nums text-app-accent sm:text-xl">
          {pagos}
        </span>
      </div>
      <div className="px-2">
        <span className="block text-xs font-medium text-app-muted">Em aberto</span>
        <span className={`mt-0.5 block text-lg font-semibold tabular-nums sm:text-xl ${emAberto > 0 ? 'text-app-warn' : 'text-app-text'}`}>
          {emAberto}
        </span>
      </div>
      <div className="px-2">
        <span className="block text-xs font-medium text-app-muted">Total pago</span>
        <span className="mt-0.5 block text-lg font-semibold tabular-nums text-app-text sm:text-xl truncate">
          {formatCurrency(totalPago)}
        </span>
      </div>
    </div>
  )
}
