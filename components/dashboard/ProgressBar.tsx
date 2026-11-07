'use client'

import { formatCurrency } from '@/lib/utils/currency'
import { formatMonthYear } from '@/lib/utils/date'

interface ProgressBarProps {
  mes: string        // ISO date '2025-06-01'
  pago: number
  total: number
  progresso: number  // 0–100
}

export function ProgressBar({ mes, pago, total, progresso }: ProgressBarProps) {
  const mesStr = formatMonthYear(mes)
  const clampedProgresso = Math.max(0, Math.min(100, Math.round(progresso)))

  return (
    <div className="rounded-[var(--radius-app)] border border-app-line bg-app-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="font-semibold capitalize text-app-text">{mesStr}</h2>
          <p className="mt-0.5 text-xs text-app-muted">Mês atual</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold tabular-nums text-app-text">{clampedProgresso}%</p>
          <p className="text-xs tabular-nums text-app-muted">
            {formatCurrency(pago)} de {formatCurrency(total)}
          </p>
        </div>
      </div>

      {/* Track */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-app-elevated">
        <div
          className="h-full rounded-full bg-app-accent transition-all duration-700 ease-[var(--ease-app)]"
          style={{ width: `${clampedProgresso}%` }}
        />
      </div>

      {clampedProgresso === 100 && (
        <p className="mt-2 text-center text-xs font-medium text-app-accent">
          🎉 Arrecadação completa!
        </p>
      )}
    </div>
  )
}
