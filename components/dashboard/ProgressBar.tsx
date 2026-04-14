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

  return (
    <div className="bg-[#181818] rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-white font-semibold capitalize">{mesStr}</h2>
          <p className="text-[#535353] text-xs mt-0.5">Mês atual</p>
        </div>
        <div className="text-right">
          <p className="text-white font-bold text-lg">{progresso}%</p>
          <p className="text-[#535353] text-xs">{formatCurrency(pago)} de {formatCurrency(total)}</p>
        </div>
      </div>

      {/* Track */}
      <div className="h-2 bg-[#282828] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#1DB954] rounded-full progress-bar-fill transition-all duration-700"
          style={{ '--progress-width': `${progresso}%`, width: `${progresso}%` } as React.CSSProperties}
        />
      </div>

      {progresso === 100 && (
        <p className="text-[#1DB954] text-xs font-medium mt-2 text-center">
          🎉 Arrecadação completa!
        </p>
      )}
    </div>
  )
}
