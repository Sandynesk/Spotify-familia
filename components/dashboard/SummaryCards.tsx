'use client'

import { Users, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils/currency'
import type { DashboardSummary } from '@/types/database'

interface SummaryCardsProps {
  summary: DashboardSummary
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    {
      label: 'Membros ativos',
      value: String(summary.totalMembros),
      icon: Users,
      iconColor: '#1DB954',
      iconBg: 'rgba(29,185,84,0.1)',
      sub: 'no plano',
    },
    {
      label: 'A receber',
      value: formatCurrency(summary.totalAReceber),
      icon: TrendingUp,
      iconColor: '#509BF5',
      iconBg: 'rgba(80,155,245,0.1)',
      sub: 'este mês',
    },
    {
      label: 'Já pago',
      value: formatCurrency(summary.totalPago),
      icon: CheckCircle,
      iconColor: '#1DB954',
      iconBg: 'rgba(29,185,84,0.1)',
      sub: 'confirmado',
    },
    {
      label: 'Em atraso',
      value: formatCurrency(summary.totalAtrasado),
      icon: AlertCircle,
      iconColor: summary.totalAtrasado > 0 ? '#E22134' : '#535353',
      iconBg: summary.totalAtrasado > 0 ? 'rgba(226,33,52,0.1)' : 'rgba(83,83,83,0.1)',
      sub: summary.totalAtrasado > 0 ? 'cobrar!' : 'tudo ok',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map(({ label, value, icon: Icon, iconColor, iconBg, sub }) => (
        <Card key={label} className="relative overflow-hidden">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
            style={{ backgroundColor: iconBg }}
          >
            <Icon className="w-5 h-5" style={{ color: iconColor }} />
          </div>
          <p className="text-[#B3B3B3] text-xs font-medium mb-1">{label}</p>
          <p className="text-white font-bold text-lg leading-tight">{value}</p>
          <p className="text-[#535353] text-xs mt-1">{sub}</p>
        </Card>
      ))}
    </div>
  )
}
