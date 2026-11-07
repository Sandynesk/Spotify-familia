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
      iconColor: 'text-app-accent',
      iconBg: 'bg-app-accent/15',
      sub: 'no plano',
    },
    {
      label: 'A receber',
      value: formatCurrency(summary.totalAReceber),
      icon: TrendingUp,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-400/15',
      sub: 'este mês',
    },
    {
      label: 'Já pago',
      value: formatCurrency(summary.totalPago),
      icon: CheckCircle,
      iconColor: 'text-app-accent',
      iconBg: 'bg-app-accent/15',
      sub: 'confirmado',
    },
    {
      label: 'Em atraso',
      value: formatCurrency(summary.totalAtrasado),
      icon: AlertCircle,
      iconColor: summary.totalAtrasado > 0 ? 'text-app-danger' : 'text-app-subtle',
      iconBg: summary.totalAtrasado > 0 ? 'bg-app-danger/15' : 'bg-app-elevated',
      sub: summary.totalAtrasado > 0 ? 'cobrar!' : 'tudo ok',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, iconColor, iconBg, sub }) => (
        <Card key={label} className="relative overflow-hidden">
          <div
            className={`mb-3 flex h-9 w-9 items-center justify-center rounded-[var(--radius-app-sm)] ${iconBg}`}
          >
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <p className="mb-1 text-xs font-medium text-app-muted">{label}</p>
          <p className="text-lg font-bold leading-tight tabular-nums text-app-text">{value}</p>
          <p className="mt-1 text-xs text-app-subtle">{sub}</p>
        </Card>
      ))}
    </div>
  )
}
