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
import type { Pagamento } from '@/types/database'

interface OverviewChartProps {
  pagamentos: Pagamento[]
  membros: { id: string; valor_mensal: number }[]
  ano: number
}

const MESES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
]

interface ChartData {
  mes: string
  recebido: number
  pendente: number
  atrasado: number
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null

  return (
    <div className="bg-[#282828] border border-white/10 rounded-lg p-3 shadow-xl">
      <p className="text-white font-medium mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[#B3B3B3]">{entry.name}:</span>
          <span className="text-white font-medium">
            R$ {entry.value.toFixed(2)}
          </span>
        </div>
      ))}
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
    <div className="space-y-4">
      {/* Resumo financeiro */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#1DB954]/10 border border-[#1DB954]/20 rounded-xl p-4">
          <p className="text-xs text-[#1DB954] font-medium uppercase tracking-wider mb-1">
            Recebido
          </p>
          <p className="text-xl font-bold text-white">
            R$ {totalRecebido.toFixed(2)}
          </p>
        </div>
        <div className="bg-[#FFA500]/10 border border-[#FFA500]/20 rounded-xl p-4">
          <p className="text-xs text-[#FFA500] font-medium uppercase tracking-wider mb-1">
            Pendente
          </p>
          <p className="text-xl font-bold text-white">
            R$ {totalPendente.toFixed(2)}
          </p>
        </div>
        <div className="bg-[#FF4444]/10 border border-[#FF4444]/20 rounded-xl p-4">
          <p className="text-xs text-[#FF4444] font-medium uppercase tracking-wider mb-1">
            Atrasado
          </p>
          <p className="text-xl font-bold text-white">
            R$ {totalAtrasado.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4">
        <h3 className="text-sm font-medium text-[#B3B3B3] mb-4">
          Faturamento Mensal - {ano}
        </h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} barGap={2} barCategoryGap="15%">
            <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
            <XAxis
              dataKey="mes"
              tick={{ fill: '#B3B3B3', fontSize: 12 }}
              axisLine={{ stroke: '#282828' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#B3B3B3', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `R$ ${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px', color: '#B3B3B3' }}
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
              fill="#FFA500"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="atrasado"
              name="Atrasado"
              fill="#FF4444"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
