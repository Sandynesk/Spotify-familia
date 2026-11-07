import { Check, AlertCircle, Clock, CheckCheck, Loader2 } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { formatCurrency } from '@/lib/utils/currency'
import type { Membro, PagamentoStatus } from '@/types/database'

export interface OverviewMonthItem {
  mesRef: string
  mesSigla: string
  mesNome: string
  status?: PagamentoStatus
  valor: number
  pagamentoId?: string
  isCurrentMonth: boolean
}

interface OverviewMemberCardProps {
  membro: Membro
  ano: number
  meses: OverviewMonthItem[]
  pendingIds: Set<string>
  onMarcarPago: (pagamentoId: string, membroNome: string, mesNome: string) => void
  onOpenDesfazer: (params: {
    membroNome: string
    mesNome: string
    mesSigla: string
    ano: number
    pagamentoId: string
    mesRef: string
  }) => void
  onOpenQuitar: (params: {
    membro: Membro
    meses: OverviewMonthItem[]
    total: number
  }) => void
  mesAtualISO: string
}

export function OverviewMemberCard({
  membro,
  ano,
  meses,
  pendingIds,
  onMarcarPago,
  onOpenDesfazer,
  onOpenQuitar,
  mesAtualISO,
}: OverviewMemberCardProps) {
  // Total devido no ano (todas cobranças com status pendente ou atrasado neste ano)
  const mesesNaoPagosAno = meses.filter(m => m.pagamentoId && m.status && m.status !== 'pago')
  const totalDeveAno = mesesNaoPagosAno.reduce((acc, m) => acc + m.valor, 0)
  const temAtrasoAno = mesesNaoPagosAno.some(m => m.status === 'atrasado')

  // Meses em aberto até o mês atual (para o botão "Quitar N meses")
  const mesesEmAbertoAteAgora = meses.filter(
    m => m.pagamentoId && m.status && m.status !== 'pago' && m.mesRef <= mesAtualISO
  )
  const countEmAberto = mesesEmAbertoAteAgora.length
  const totalEmAberto = mesesEmAbertoAteAgora.reduce((acc, m) => acc + m.valor, 0)

  return (
    <div className="rounded-[var(--radius-app)] border border-app-line bg-app-surface p-4 transition-colors">
      {/* Cabeçalho do Card */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar nome={membro.nome} cor={membro.cor_avatar} size="md" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-app-text truncate">
              {membro.nome}
            </p>
            <p className="text-xs text-app-muted">
              {formatCurrency(Number(membro.valor_mensal))}/mês
            </p>
          </div>
        </div>

        {totalDeveAno > 0 ? (
          <div className="text-right flex-shrink-0">
            <p className="text-[11px] text-app-muted">Deve no ano</p>
            <p
              className={`text-sm font-bold tabular-nums ${
                temAtrasoAno ? 'text-app-danger' : 'text-app-warn'
              }`}
            >
              {formatCurrency(totalDeveAno)}
            </p>
          </div>
        ) : (
          <div className="text-right flex-shrink-0">
            <span className="inline-flex items-center gap-1 rounded-full bg-app-accent/15 px-2.5 py-0.5 text-xs font-semibold text-app-accent">
              <Check className="h-3 w-3 stroke-[2.5]" />
              Em dia
            </span>
          </div>
        )}
      </div>

      {/* Grade 6×2 de meses (Jan–Jun / Jul–Dez) */}
      <div className="grid grid-cols-6 gap-1.5 mt-4">
        {meses.map(mes => {
          const isPending = mes.pagamentoId ? pendingIds.has(mes.pagamentoId) : false
          const isSemCobranca = !mes.status || !mes.pagamentoId

          if (isSemCobranca) {
            return (
              <div
                key={mes.mesRef}
                role="button"
                aria-disabled="true"
                aria-label={`${membro.nome}, ${mes.mesNome} de ${ano}, sem cobrança`}
                className={`flex flex-col items-center justify-center min-h-[44px] h-12 rounded-[var(--radius-app-sm)] bg-app-elevated/30 text-app-subtle/40 border border-transparent cursor-not-allowed select-none ${
                  mes.isCurrentMonth
                    ? 'ring-2 ring-white/90 ring-offset-1 ring-offset-app-surface'
                    : ''
                }`}
              >
                <span className="text-[11px] font-semibold tracking-wider">
                  {mes.mesSigla}
                </span>
                <span className="text-[10px] leading-none mt-0.5">—</span>
              </div>
            )
          }

          if (mes.status === 'pago') {
            return (
              <button
                key={mes.mesRef}
                type="button"
                disabled={isPending}
                onClick={() =>
                  onOpenDesfazer({
                    membroNome: membro.nome,
                    mesNome: mes.mesNome,
                    mesSigla: mes.mesSigla,
                    ano,
                    pagamentoId: mes.pagamentoId!,
                    mesRef: mes.mesRef,
                  })
                }
                aria-label={`${membro.nome}, ${mes.mesNome} de ${ano}, pago. Toque para desfazer`}
                className={`flex flex-col items-center justify-center min-h-[44px] h-12 rounded-[var(--radius-app-sm)] bg-app-accent/15 text-app-accent border border-app-accent/30 hover:bg-app-accent/25 active:scale-95 transition-all select-none ${
                  mes.isCurrentMonth
                    ? 'ring-2 ring-white/90 ring-offset-1 ring-offset-app-surface'
                    : ''
                }`}
              >
                <span className="text-[11px] font-semibold tracking-wider">
                  {mes.mesSigla}
                </span>
                {isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin mt-0.5" />
                ) : (
                  <Check className="h-3.5 w-3.5 stroke-[2.5] mt-0.5" />
                )}
              </button>
            )
          }

          if (mes.status === 'atrasado') {
            return (
              <button
                key={mes.mesRef}
                type="button"
                disabled={isPending}
                onClick={() =>
                  onMarcarPago(mes.pagamentoId!, membro.nome, mes.mesNome)
                }
                aria-label={`${membro.nome}, ${mes.mesNome} de ${ano}, atrasado. Toque para marcar como pago`}
                className={`flex flex-col items-center justify-center min-h-[44px] h-12 rounded-[var(--radius-app-sm)] bg-app-danger/15 text-app-danger border border-app-danger/30 hover:bg-app-danger/25 active:scale-95 transition-all select-none ${
                  mes.isCurrentMonth
                    ? 'ring-2 ring-white/90 ring-offset-1 ring-offset-app-surface'
                    : ''
                }`}
              >
                <span className="text-[11px] font-semibold tracking-wider">
                  {mes.mesSigla}
                </span>
                {isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin mt-0.5" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 stroke-[2.5] mt-0.5" />
                )}
              </button>
            )
          }

          // pendente
          return (
            <button
              key={mes.mesRef}
              type="button"
              disabled={isPending}
              onClick={() =>
                onMarcarPago(mes.pagamentoId!, membro.nome, mes.mesNome)
              }
              aria-label={`${membro.nome}, ${mes.mesNome} de ${ano}, pendente. Toque para marcar como pago`}
              className={`flex flex-col items-center justify-center min-h-[44px] h-12 rounded-[var(--radius-app-sm)] bg-app-warn/15 text-app-warn border border-app-warn/30 hover:bg-app-warn/25 active:scale-95 transition-all select-none ${
                mes.isCurrentMonth
                  ? 'ring-2 ring-white/90 ring-offset-1 ring-offset-app-surface'
                  : ''
              }`}
            >
              <span className="text-[11px] font-semibold tracking-wider">
                {mes.mesSigla}
              </span>
              {isPending ? (
                <Loader2 className="h-3 w-3 animate-spin mt-0.5" />
              ) : (
                <Clock className="h-3 w-3 mt-0.5" />
              )}
            </button>
          )
        })}
      </div>

      {/* Botão Quitar N Meses */}
      {countEmAberto > 0 && (
        <div className="mt-4 pt-3 border-t border-app-line flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-app-muted truncate">
              {countEmAberto} {countEmAberto === 1 ? 'mês pendente' : 'meses pendentes'} até agora
            </p>
            <p className="text-xs font-semibold text-app-text tabular-nums">
              Total: {formatCurrency(totalEmAberto)}
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              onOpenQuitar({
                membro,
                meses: mesesEmAbertoAteAgora,
                total: totalEmAberto,
              })
            }
            className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-full bg-app-accent hover:bg-app-accent-hover text-black font-semibold text-xs transition-transform active:scale-95 flex-shrink-0"
          >
            <CheckCheck className="h-4 w-4" />
            Quitar {countEmAberto} {countEmAberto === 1 ? 'mês' : 'meses'}
          </button>
        </div>
      )}
    </div>
  )
}
