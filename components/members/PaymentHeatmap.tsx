import { Card } from '@/components/ui/Card'
import { diasDeAtraso } from '@/lib/domain/pontualidade'
import { getCurrentMonthISO, listMonths } from '@/lib/utils/date'
import type { Membro, Pagamento } from '@/types/database'

type HeatStatus = 'prazo' | 'atraso' | 'aberto' | 'futuro'

const heatStatusConfig: Record<HeatStatus, { label: string; color: string }> = {
  prazo: { label: 'Pago no prazo', color: 'bg-app-accent' },
  atraso: { label: 'Pago com atraso', color: 'bg-app-warn' },
  aberto: { label: 'Em aberto', color: 'bg-app-danger' },
  futuro: { label: 'Futuro', color: 'bg-app-elevated' },
}

function monthLabel(month: string) {
  return new Date(`${month}T12:00:00`).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
}

export function PaymentHeatmap({ membro, pagamentos }: { membro: Membro; pagamentos: Pagamento[] }) {
  const mesAtual = getCurrentMonthISO()
  const agora = new Date()
  const inicio = new Date(agora.getFullYear(), agora.getMonth() - 11, 1)
  const primeiroMes = `${inicio.getFullYear()}-${String(inicio.getMonth() + 1).padStart(2, '0')}-01`
  const meses = listMonths(primeiroMes, mesAtual)
  const porMes = new Map(pagamentos.map((pagamento) => [pagamento.mes_referencia.slice(0, 7), pagamento]))
  const inicioNoPlano = membro.data_entrada.slice(0, 7)
  const dias = meses.map((mes) => {
    const pagamento = porMes.get(mes.slice(0, 7))
    let status: HeatStatus
    let detalhe: string

    if (mes > mesAtual || (!pagamento && mes.slice(0, 7) < inicioNoPlano)) {
      status = 'futuro'
      detalhe = mes > mesAtual ? 'A cobrança ainda não chegou.' : 'Ainda não estava no plano.'
    } else if (pagamento?.status === 'pago') {
      status = (diasDeAtraso(pagamento, membro) ?? 0) <= 0 ? 'prazo' : 'atraso'
      detalhe = status === 'prazo' ? 'Pago no prazo.' : 'Pago com atraso.'
    } else if (mes === mesAtual && agora.getDate() < membro.dia_vencimento) {
      status = 'futuro'
      detalhe = 'Vencimento ainda não chegou.'
    } else {
      status = 'aberto'
      detalhe = 'Pagamento em aberto.'
    }

    return { mes, status, detalhe }
  })

  return (
    <Card padding="md" aria-label="Mapa de calor dos pagamentos">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-app-text">Ritmo de pagamentos</h2>
          <p className="mt-1 text-sm text-app-muted">Últimos 12 meses, mês a mês.</p>
        </div>
        <span className="text-xs text-app-subtle">Mais antigo → atual</span>
      </div>

      <ol className="mt-5 grid grid-cols-6 gap-3 sm:grid-cols-12 sm:gap-2" aria-label="Pagamentos dos últimos 12 meses">
        {dias.map(({ mes, status, detalhe }) => {
          const config = heatStatusConfig[status]
          return (
            <li key={mes} className="flex flex-col items-center gap-1.5">
              <span
                role="img"
                aria-label={`${monthLabel(mes)}: ${config.label}. ${detalhe}`}
                title={`${monthLabel(mes)}: ${config.label}`}
                className={`h-8 w-full max-w-10 rounded-[9px] border border-app-line ${config.color}`}
              />
              <span className="text-[10px] capitalize text-app-subtle">{monthLabel(mes)}</span>
            </li>
          )
        })}
      </ol>

      <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2" aria-label="Legenda do mapa de calor">
        {(Object.entries(heatStatusConfig) as [HeatStatus, typeof heatStatusConfig[HeatStatus]][]).map(([status, config]) => (
          <li key={status} className="inline-flex items-center gap-2 text-xs text-app-muted">
            <span aria-hidden className={`h-2.5 w-2.5 rounded-sm ${config.color}`} />
            {config.label}
          </li>
        ))}
      </ul>
    </Card>
  )
}
