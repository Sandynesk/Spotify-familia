'use client'

import { useMemo } from 'react'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, SectionHeader } from '@/components/ui'
import { formatCurrency } from '@/lib/utils/currency'
import type { ItemSerieMensal } from '@/lib/domain/insights'

interface OverviewChartProps {
  data: ItemSerieMensal[]
  ano: number
  valorPlano: number
}

interface ChartPoint extends ItemSerieMensal {
  mes: string
  plano: number
}

interface TooltipEntry {
  name?: string
  value?: number | string
  color?: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string
}

const moedaCompacta = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 0,
})

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <div className="min-w-40 rounded-app-sm border border-app-line-strong bg-app-raised p-3 shadow-app-float">
      <p className="mb-2 text-xs font-semibold text-app-text">{label}</p>
      <div className="space-y-1.5">
        {payload.map(entry => (
          <div key={entry.name} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-app-muted">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} aria-hidden="true" />
              {entry.name}
            </span>
            <span className="font-semibold tabular text-app-text">{formatCurrency(Number(entry.value ?? 0))}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function OverviewChart({ data, ano, valorPlano }: OverviewChartProps) {
  const chartData = useMemo<ChartPoint[]>(() => data.map(item => ({
    ...item,
    mes: new Date(`${item.mesReferencia.slice(0, 7)}-15T12:00:00`).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
    plano: valorPlano,
  })), [data, valorPlano])

  return (
    <Card padding="md" className="h-full w-full min-w-0 max-w-full overflow-hidden">
      <SectionHeader title={`Movimento mensal · ${ano}`} description="Previsto, recebido e custo do plano" />
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-app-muted" aria-label="Legenda do gráfico">
        <Legend color="bg-app-elevated" label="Previsto" />
        <Legend color="bg-app-accent" label="Arrecadado" />
        <Legend color="bg-app-warn" label="Valor do plano" line />
      </div>

      <div className="mt-4 h-[260px] w-full min-w-0 overflow-hidden" role="img" aria-label={`Gráfico mensal de previsto, arrecadado e valor do plano em ${ano}`}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 8, right: 4, bottom: 0, left: 0 }} barGap={3} barCategoryGap="24%">
            <CartesianGrid stroke="var(--color-app-line)" strokeDasharray="3 4" vertical={false} />
            <XAxis
              dataKey="mes"
              axisLine={{ stroke: 'var(--color-app-line)' }}
              tickLine={false}
              tick={{ fill: 'var(--color-app-subtle)', fontSize: 11 }}
              interval={0}
              minTickGap={0}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={54}
              tick={{ fill: 'var(--color-app-subtle)', fontSize: 10 }}
              tickFormatter={value => moedaCompacta.format(Number(value))}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'var(--color-app-line)' }}
            />
            <Bar dataKey="previsto" name="Previsto" fill="var(--color-app-elevated)" radius={[4, 4, 0, 0]} maxBarSize={24} />
            <Bar dataKey="arrecadado" name="Arrecadado" fill="var(--color-app-accent)" radius={[4, 4, 0, 0]} maxBarSize={24} />
            <Line
              dataKey="plano"
              name="Valor do plano"
              type="monotone"
              stroke="var(--color-app-warn)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: 'var(--color-app-warn)', stroke: 'var(--color-app-surface)' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

function Legend({ color, label, line = false }: { color: string; label: string; line?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${color} ${line ? 'relative h-0.5 w-3 rounded-none after:absolute after:-right-0.5 after:-top-1 after:h-2 after:w-2 after:rounded-full after:bg-app-warn' : ''}`} />
      {label}
    </span>
  )
}
