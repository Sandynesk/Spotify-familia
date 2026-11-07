'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/lib/utils/currency'
import type { Pagamento } from '@/types/database'

interface OverviewChartProps {
  pagamentos: Pagamento[]
  membros: { id: string; valor_mensal: number }[]
  ano: number
}

const MESES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
]

interface ChartData {
  mes: string
  recebido: number
  pendente: number
  atrasado: number
}

interface TooltipEntry {
  name?: string
  value?: number
  color?: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="bg-app-surface border border-app-line rounded-[var(--radius-app-sm)] p-3 shadow-2xl font-app">
      <p className="text-app-text font-semibold text-xs mb-2">{label}</p>
      <div className="space-y-1.5 min-w-[140px]">
        {payload.map(entry => (
          <div key={entry.name} className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-app-muted">{entry.name}:</span>
            </div>
            <span className="text-app-text font-semibold tabular-nums">
              {formatCurrency(Number(entry.value ?? 0))}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function OverviewChart({ pagamentos, ano }: OverviewChartProps) {
  const chartData = useMemo(() => {
    const monthlyData: Record<number, ChartData> = {}

    for (let i = 0; i < 12; i++) {
      monthlyData[i] = {
        mes: MESES[i],
        recebido: 0,
        pendente: 0,
        atrasado: 0,
      }
    }

    pagamentos.forEach(p => {
      const date = new Date(p.mes_referencia + 'T12:00:00')
      const monthIndex = date.getMonth()
      const valor = Number(p.valor)

      if (p.status === 'pago') {
        monthlyData[monthIndex].recebido += valor
      } else if (p.status === 'atrasado') {
        monthlyData[monthIndex].atrasado += valor
      } else {
        monthlyData[monthIndex].pendente += valor
      }
    })

    return Object.values(monthlyData)
  }, [pagamentos])

  const totalRecebido = chartData.reduce((acc, d) => acc + d.recebido, 0)
  const totalPendente = chartData.reduce((acc, d) => acc + d.pendente, 0)
  const totalAtrasado = chartData.reduce((acc, d) => acc + d.atrasado, 0)

  return (
    <div className="space-y-3">
      {/* Faixa compacta com os 3 totais do ano */}
      <div className="rounded-[var(--radius-app)] border border-app-line bg-app-surface px-4 py-3 sm:px-6">
        <div className="grid grid-cols-3 divide-x divide-app-line text-center">
          <div className="px-2">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-app-accent" />
              <span className="text-xs font-medium text-app-muted">Recebido</span>
            </div>
            <p className="text-base sm:text-lg font-bold text-app-accent tabular-nums">
              {formatCurrency(totalRecebido)}
            </p>
          </div>

          <div className="px-2">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-app-warn" />
              <span className="text-xs font-medium text-app-muted">Pendente</span>
            </div>
            <p className="text-base sm:text-lg font-bold text-app-warn tabular-nums">
              {formatCurrency(totalPendente)}
            </p>
          </div>

          <div className="px-2">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-app-danger" />
              <span className="text-xs font-medium text-app-muted">Atrasado</span>
            </div>
            <p className="text-base sm:text-lg font-bold text-app-danger tabular-nums">
              {formatCurrency(totalAtrasado)}
            </p>
          </div>
        </div>
      </div>

      {/* Gráfico de barras */}
      <div className="rounded-[var(--radius-app)] border border-app-line bg-app-surface p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-app-text">
            Faturamento Mensal — {ano}
          </h3>
          <span className="text-xs text-app-subtle">
            Valores consolidados por mês
          </span>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} barGap={2} barCategoryGap="16%">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255, 255, 255, 0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="mes"
              tick={{ fill: '#8e8e93', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#8e8e93', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `R$ ${value}`}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
              formatter={(value) => (
                <span className="text-xs text-app-muted">{value}</span>
              )}
            />
            <Bar
              dataKey="recebido"
              name="Recebido"
              fill="#1DB954"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="pendente"
              name="Pendente"
              fill="#ff9f0a"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="atrasado"
              name="Atrasado"
              fill="#ff453a"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
