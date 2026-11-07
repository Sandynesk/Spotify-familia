import { formatCurrency } from '@/lib/utils/currency'

interface DashboardMonthHeaderProps {
  mes: string // 'YYYY-MM-01'
  pago: number
  total: number
  progresso: number // 0-100
}

export function DashboardMonthHeader({
  mes,
  pago,
  total,
  progresso,
}: DashboardMonthHeaderProps) {
  const d = new Date(mes + 'T12:00:00')
  const nomeMes = d.toLocaleDateString('pt-BR', { month: 'long' })
  const mesFormatado = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)
  const clampedProgresso = Math.max(0, Math.min(100, Math.round(progresso)))

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-app-text">
          {mesFormatado}
        </h1>
        <p className="mt-1 text-sm text-app-muted">
          <span className="tabular-nums font-medium text-app-text">
            {formatCurrency(pago)}
          </span>{' '}
          de{' '}
          <span className="tabular-nums font-medium text-app-text">
            {formatCurrency(total)}
          </span>{' '}
          recebidos
        </p>
      </div>

      {/* Barra de progresso fina em verde */}
      <div
        className="h-1.5 w-full bg-app-elevated rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={clampedProgresso}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progresso de arrecadação de ${mesFormatado}: ${clampedProgresso}%`}
      >
        <div
          className="h-full bg-app-accent rounded-full transition-all duration-700 ease-[var(--ease-app)]"
          style={{ width: `${clampedProgresso}%` }}
        />
      </div>
    </div>
  )
}
