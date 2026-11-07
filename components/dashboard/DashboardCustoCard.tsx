import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import type { ResumoCusto } from '@/types/database'

interface DashboardCustoCardProps {
  custo: ResumoCusto
}

export function DashboardCustoCard({ custo }: DashboardCustoCardProps) {
  if (custo.valorPlano === null) {
    return (
      <Link
        href="/configuracoes"
        className="group flex min-h-[44px] items-center justify-between gap-3 rounded-[var(--radius-app)] border border-app-line bg-app-surface p-4 transition-colors hover:bg-app-elevated"
      >
        <p className="text-sm text-app-muted transition-colors group-hover:text-app-text">
          Informe quanto custa o plano para ver se a conta fecha
        </p>
        <ChevronRight className="h-4 w-4 flex-shrink-0 text-app-subtle transition-colors group-hover:text-app-text" />
      </Link>
    )
  }

  const diferenca =
    custo.diferenca !== null
      ? custo.diferenca
      : custo.previstoMes - custo.valorPlano

  return (
    <div className="rounded-[var(--radius-app)] border border-app-line bg-app-surface p-4">
      <p className="text-sm font-medium leading-relaxed text-app-text">
        Plano{' '}
        <span className="tabular-nums font-semibold">
          {formatCurrency(custo.valorPlano)}
        </span>{' '}
        · Cobrado{' '}
        <span className="tabular-nums font-semibold">
          {formatCurrency(custo.previstoMes)}
        </span>{' '}
        ·{' '}
        <span
          className={`tabular-nums font-semibold ${
            diferenca >= 0 ? 'text-app-accent' : 'text-app-warn'
          }`}
        >
          {diferenca >= 0
            ? `Sobra ${formatCurrency(diferenca)}`
            : `Você cobre ${formatCurrency(Math.abs(diferenca))}`}
        </span>
      </p>
    </div>
  )
}
