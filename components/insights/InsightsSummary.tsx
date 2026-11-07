'use client'

import {
  BadgePercent,
  CalendarCheck2,
  CircleDollarSign,
  Clock3,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { Card, NumberTicker } from '@/components/ui'
import { formatCurrency } from '@/lib/utils/currency'

interface InsightsSummaryProps {
  ano: number
  saldo: number
  arrecadado: number
  valorPlano: number
  taxaRecebimento: number
  tempoMedio: number | null
  mesesFechados: number
  emAbertoAgora: number
}

export function InsightsSummary({
  ano,
  saldo,
  arrecadado,
  valorPlano,
  taxaRecebimento,
  tempoMedio,
  mesesFechados,
  emAbertoAgora,
}: InsightsSummaryProps) {
  const semValorConfigurado = valorPlano <= 0
  const saldoPositivo = saldo > 0
  const saldoNegativo = saldo < 0
  const SaldoIcon = saldoNegativo ? TrendingDown : saldoPositivo ? TrendingUp : CircleDollarSign

  return (
    <div className="grid gap-4 xl:grid-cols-12 min-w-0 max-w-full">
      <Card variant="hero" padding="lg" className="relative min-h-52 overflow-hidden xl:col-span-7 min-w-0">
        <div className="relative z-10 flex h-full flex-col justify-between gap-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-app-muted">Saldo do plano em {ano}</p>
              <p className="mt-2 text-sm text-app-muted">
                {semValorConfigurado ? 'Configure o valor mensal do plano para calcular seu saldo.' : saldoNegativo ? 'Você está cobrindo esta diferença do próprio bolso.' : saldoPositivo ? 'As contribuições já cobrem o custo do plano.' : 'O plano está equilibrado até aqui.'}
              </p>
            </div>
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-app-sm border border-app-line bg-app-surface/60 ${semValorConfigurado ? 'text-app-warn' : saldoNegativo ? 'text-app-danger' : 'text-app-accent'}`}>
              <SaldoIcon aria-hidden className="h-5 w-5" />
            </span>
          </div>

          <div>
            <p className={`text-5xl font-semibold tracking-[-0.03em] sm:text-6xl ${semValorConfigurado ? 'text-app-muted' : saldoNegativo ? 'text-app-danger' : 'text-app-accent'}`}>
              <NumberTicker value={semValorConfigurado ? 0 : saldo} format={formatCurrency} decimals={2} />
            </p>
            <p className="mt-2 text-sm text-app-muted">
              {semValorConfigurado
                ? 'Cadastre o custo em Configurações para ver quanto sobra ou falta.'
                : `Você economizou ${formatCurrency(arrecadado)} em relação a pagar sozinho neste ano.`}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 xl:col-span-5 min-w-0">
        <KpiCard
          label="Taxa de recebimento"
          detail="dos valores previstos"
          value={<NumberTicker value={taxaRecebimento} suffix="%" />}
          icon={<BadgePercent aria-hidden />}
          accent="text-app-accent"
        />
        <KpiCard
          label="Tempo médio"
          detail="em relação ao vencimento"
          value={tempoMedio === null ? '—' : <NumberTicker value={tempoMedio} decimals={1} suffix=" dias" />}
          icon={<Clock3 aria-hidden />}
        />
        <KpiCard
          label="Meses fechados"
          detail="sem pendências, de 12"
          value={<><NumberTicker value={mesesFechados} />/12</>}
          icon={<CalendarCheck2 aria-hidden />}
          accent="text-app-accent"
        />
        <KpiCard
          label="Em aberto agora"
          detail="no mês atual"
          value={<NumberTicker value={emAbertoAgora} format={formatCurrency} decimals={2} />}
          icon={<Wallet aria-hidden />}
          accent={emAbertoAgora > 0 ? 'text-app-warn' : 'text-app-accent'}
          compact
        />
      </div>
    </div>
  )
}

function KpiCard({
  label,
  detail,
  value,
  icon,
  accent = 'text-app-text',
  compact = false,
}: {
  label: string
  detail: string
  value: React.ReactNode
  icon: React.ReactNode
  accent?: string
  compact?: boolean
}) {
  return (
    <Card padding="sm" className="flex min-h-28 min-w-0 flex-col justify-between sm:min-h-32">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-app-muted">{label}</p>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-app-xs bg-app-elevated text-app-muted [&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </span>
      </div>
      <div>
        <p className={`tabular truncate font-semibold tracking-[-0.03em] ${compact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'} ${accent}`}>
          {value}
        </p>
        <p className="mt-1 truncate text-[11px] text-app-subtle">{detail}</p>
      </div>
    </Card>
  )
}
