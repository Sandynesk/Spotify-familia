import { CalendarDays, Clock3, Flame, Wallet } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils/currency'

interface MemberStatsProps {
  mediaDias: number | null
  sequenciaAtual: number
  totalPago: number
  mesesNoPlano: number
}

export function MemberStats({ mediaDias, sequenciaAtual, totalPago, mesesNoPlano }: MemberStatsProps) {
  const mediaTexto = mediaDias === null
    ? 'Sem histórico'
    : mediaDias === 0
      ? 'No vencimento'
      : `${Math.abs(mediaDias).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} d ${mediaDias < 0 ? 'antes' : 'depois'}`

  const stats = [
    { label: 'Média de dias', value: mediaTexto, icon: Clock3 },
    { label: 'Sequência atual', value: `${sequenciaAtual} ${sequenciaAtual === 1 ? 'mês' : 'meses'}`, icon: Flame },
    { label: 'Total pago na vida', value: formatCurrency(totalPago), icon: Wallet },
    { label: 'Tempo no plano', value: `${mesesNoPlano} ${mesesNoPlano === 1 ? 'mês' : 'meses'}`, icon: CalendarDays },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon }) => (
        <Card key={label} padding="sm" className="min-w-0">
          <div className="flex items-center gap-2 text-app-subtle">
            <Icon aria-hidden className="h-4 w-4 shrink-0" />
            <span className="truncate text-xs">{label}</span>
          </div>
          <p className="mt-2 truncate text-base font-semibold tabular text-app-text" title={value}>{value}</p>
        </Card>
      ))}
    </div>
  )
}
