'use client'

import { useState, useTransition } from 'react'
import {
  CalendarClock,
  Check,
  CircleCheck,
  Clock3,
  Minus,
  TriangleAlert,
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button, Card, SectionHeader, Sheet } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { diasDeAtraso } from '@/lib/domain/pontualidade'
import { desfazerPagamento, marcarPago } from '@/lib/actions/pagamentos'
import { getCurrentMonthISO, getEffectiveStatus } from '@/lib/utils/date'
import { formatCurrency } from '@/lib/utils/currency'
import type { Membro, Pagamento, PagamentoStatus } from '@/types/database'

interface OverviewGridProps {
  membros: Membro[]
  pagamentos: Pagamento[]
  ano: number
}

type CellStatus = 'paid-on-time' | 'paid-late' | 'open' | 'future' | 'outside-plan'

interface SelectedCell {
  membroId: string
  mesRef: string
}

interface CellDetails {
  membro: Membro
  mesRef: string
  monthName: string
  shortMonth: string
  status: CellStatus
  pagamento: Pagamento | undefined
  valor: number
}

const MONTHS = [
  { short: 'Jan', full: 'janeiro' },
  { short: 'Fev', full: 'fevereiro' },
  { short: 'Mar', full: 'março' },
  { short: 'Abr', full: 'abril' },
  { short: 'Mai', full: 'maio' },
  { short: 'Jun', full: 'junho' },
  { short: 'Jul', full: 'julho' },
  { short: 'Ago', full: 'agosto' },
  { short: 'Set', full: 'setembro' },
  { short: 'Out', full: 'outubro' },
  { short: 'Nov', full: 'novembro' },
  { short: 'Dez', full: 'dezembro' },
]

const STATUS_LABEL: Record<CellStatus, string> = {
  'paid-on-time': 'Pago no prazo',
  'paid-late': 'Pago atrasado',
  open: 'Em aberto',
  future: 'Futuro',
  'outside-plan': 'Fora do plano',
}

const STATUS_STYLE: Record<CellStatus, string> = {
  'paid-on-time': 'border-app-accent/35 bg-app-accent/12 text-app-accent hover:bg-app-accent/20',
  'paid-late': 'border-app-danger/35 bg-app-danger/10 text-app-danger hover:bg-app-danger/18',
  open: 'border-app-warn/35 bg-app-warn/10 text-app-warn hover:bg-app-warn/18',
  future: 'border-app-line bg-app-elevated/45 text-app-muted hover:bg-app-elevated',
  'outside-plan': 'border-app-line bg-app-bg/50 text-app-subtle hover:bg-app-elevated/60',
}

function cellStatus(membro: Membro, pagamento: Pagamento | undefined, mesRef: string): CellStatus {
  if (membro.data_entrada.slice(0, 7) > mesRef.slice(0, 7)) return 'outside-plan'
  if (mesRef > getCurrentMonthISO()) return 'future'
  if (!pagamento || pagamento.status !== 'pago') return 'open'
  return (diasDeAtraso(pagamento, membro) ?? 0) > 0 ? 'paid-late' : 'paid-on-time'
}

function statusIcon(status: CellStatus, className: string) {
  switch (status) {
    case 'paid-on-time': return <CircleCheck aria-hidden className={className} />
    case 'paid-late': return <TriangleAlert aria-hidden className={className} />
    case 'open': return <Clock3 aria-hidden className={className} />
    case 'future': return <CalendarClock aria-hidden className={className} />
    case 'outside-plan': return <Minus aria-hidden className={className} />
  }
}

export function OverviewGrid({ membros, pagamentos: initialPagamentos, ano }: OverviewGridProps) {
  const [pagamentos, setPagamentos] = useState(initialPagamentos)
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const toast = useToast()
  const paymentMap = new Map(pagamentos.map(pagamento => [`${pagamento.membro_id}-${pagamento.mes_referencia.slice(0, 7)}`, pagamento]))

  const selected = selectedCell
    ? (() => {
        const membro = membros.find(item => item.id === selectedCell.membroId)
        if (!membro) return null
        const monthIndex = Number(selectedCell.mesRef.slice(5, 7)) - 1
        const pagamento = paymentMap.get(`${membro.id}-${selectedCell.mesRef.slice(0, 7)}`)
        const status = cellStatus(membro, pagamento, selectedCell.mesRef)
        return {
          membro,
          mesRef: selectedCell.mesRef,
          monthName: MONTHS[monthIndex].full,
          shortMonth: MONTHS[monthIndex].short,
          status,
          pagamento,
          valor: pagamento ? Number(pagamento.valor) : status === 'open' ? Number(membro.valor_mensal) : 0,
        } satisfies CellDetails
      })()
    : null

  function changeStatus(
    pagamentoId: string,
    mesRef: string,
    membroNome: string,
    nextStatus: PagamentoStatus,
    showUndo = true,
  ) {
    setPendingId(pagamentoId)

    startTransition(async () => {
      try {
        const result = nextStatus === 'pago'
          ? await marcarPago(pagamentoId)
          : await desfazerPagamento(pagamentoId, mesRef)

        if ('error' in result && result.error) {
          toast.error(result.error)
          return
        }

        const dataPagamento = nextStatus === 'pago' ? new Date().toISOString() : null
        const status = nextStatus === 'pago' ? 'pago' : getEffectiveStatus(mesRef, 'pendente')
        setPagamentos(current => current.map(pagamento => pagamento.id === pagamentoId
          ? { ...pagamento, status, data_pagamento: dataPagamento }
          : pagamento,
        ))
        toast.show({
          message: nextStatus === 'pago' ? `Pagamento de ${membroNome} marcado como pago.` : `Pagamento de ${membroNome} desfeito.`,
          action: showUndo ? {
            label: nextStatus === 'pago' ? 'Desfazer' : 'Marcar pago',
            onClick: () => changeStatus(
              pagamentoId,
              mesRef,
              membroNome,
              nextStatus === 'pago' ? getEffectiveStatus(mesRef, 'pendente') : 'pago',
              false,
            ),
          } : undefined,
        })
      } catch (reason) {
        toast.error(reason instanceof Error ? reason.message : 'Não foi possível atualizar o pagamento.')
      } finally {
        setPendingId(null)
      }
    })
  }

  return (
    <Card padding="md" className="min-w-0">
      <SectionHeader title="Calendário do ano" description="Toque em um mês para ver detalhes e ajustar o pagamento." />

      <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2" aria-label="Legenda dos estados do calendário">
        <Legend status="paid-on-time" />
        <Legend status="paid-late" />
        <Legend status="open" />
        <Legend status="future" />
        <Legend status="outside-plan" />
      </div>

      <div className="mt-4 max-w-full overflow-x-auto rounded-app-sm border border-app-line overscroll-x-contain">
        <table className="w-full min-w-[820px] border-separate border-spacing-0 text-left">
          <caption className="sr-only">Pagamentos de {ano} por membro e mês</caption>
          <thead>
            <tr>
              <th scope="col" className="sticky left-0 z-20 min-w-36 border-b border-app-line bg-app-surface px-3 py-3 text-xs font-medium text-app-muted">
                Membro
              </th>
              {MONTHS.map((month, index) => (
                <th key={month.short} scope="col" className="min-w-[56px] border-b border-app-line px-1 py-3 text-center text-[11px] font-medium text-app-subtle">
                  <span aria-label={month.full}>{month.short}</span>
                  <span className="sr-only"> de {ano}</span>
                  {ano === new Date().getFullYear() && index === new Date().getMonth() && <span className="sr-only">, mês atual</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {membros.map(membro => (
              <tr key={membro.id}>
                <th scope="row" className="sticky left-0 z-10 min-w-36 border-b border-app-line bg-app-surface px-3 py-2 text-left">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Avatar nome={membro.nome} cor={membro.cor_avatar} size="sm" />
                    <span className="max-w-[5.5rem] truncate text-xs font-medium text-app-text">{membro.nome}</span>
                  </div>
                </th>
                {MONTHS.map((month, index) => {
                  const mesRef = `${ano}-${String(index + 1).padStart(2, '0')}-01`
                  const pagamento = paymentMap.get(`${membro.id}-${mesRef.slice(0, 7)}`)
                  const status = cellStatus(membro, pagamento, mesRef)
                  const amount = pagamento ? Number(pagamento.valor) : status === 'open' ? Number(membro.valor_mensal) : 0

                  return (
                    <td key={mesRef} className="border-b border-app-line px-1 py-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedCell({ membroId: membro.id, mesRef })}
                        aria-label={`${membro.nome}, ${month.full} de ${ano}: ${STATUS_LABEL[status]}${amount ? `, ${formatCurrency(amount)}` : ''}. Ver detalhes`}
                        aria-haspopup="dialog"
                        className={`mx-auto flex h-11 w-11 items-center justify-center rounded-app-sm border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent disabled:opacity-50 ${STATUS_STYLE[status]}`}
                      >
                        {pendingId === pagamento?.id ? <span role="status" aria-label="Salvando" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" /> : statusIcon(status, 'h-4 w-4')}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Sheet
        open={selected !== null}
        onClose={() => setSelectedCell(null)}
        title={selected ? `${selected.membro.nome} · ${selected.monthName}` : 'Detalhes do pagamento'}
        description={selected ? `${selected.shortMonth} de ${ano}` : undefined}
      >
        {selected && <CellSheet details={selected} pending={pendingId === selected.pagamento?.id} onChange={changeStatus} />}
      </Sheet>
    </Card>
  )
}

function CellSheet({
  details,
  pending,
  onChange,
}: {
  details: CellDetails
  pending: boolean
  onChange: (id: string, month: string, name: string, status: PagamentoStatus) => void
}) {
  const paid = details.status === 'paid-on-time' || details.status === 'paid-late'
  const canUpdate = details.pagamento && (details.status === 'open' || paid)
  const status = STATUS_LABEL[details.status]
  const paidAt = details.pagamento?.data_pagamento
    ? new Date(details.pagamento.data_pagamento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : null

  return (
    <div className="space-y-5">
      <div className="rounded-app-sm border border-app-line bg-app-elevated/55 p-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-app-muted">Estado</span>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-app-text">
            <span className={`h-2 w-2 rounded-full ${details.status === 'paid-on-time' ? 'bg-app-accent' : details.status === 'paid-late' ? 'bg-app-danger' : details.status === 'open' ? 'bg-app-warn' : 'bg-app-subtle'}`} />
            {status}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-4">
          <span className="text-sm text-app-muted">Valor</span>
          <span className="text-sm font-semibold tabular text-app-text">{details.valor ? formatCurrency(details.valor) : '—'}</span>
        </div>
        {paidAt && (
          <div className="mt-3 flex items-center justify-between gap-4">
            <span className="text-sm text-app-muted">Recebido em</span>
            <span className="text-sm text-app-text">{paidAt}</span>
          </div>
        )}
        {details.status === 'outside-plan' && (
          <p className="mt-3 text-xs text-app-muted">Este mês é anterior à entrada de {details.membro.nome} no plano.</p>
        )}
        {details.status === 'future' && <p className="mt-3 text-xs text-app-muted">A cobrança deste mês ainda não venceu.</p>}
        {!details.pagamento && details.status === 'open' && (
          <p className="mt-3 text-xs text-app-muted">O registro de cobrança ainda não está disponível para edição.</p>
        )}
      </div>

      {canUpdate && details.pagamento && (
        <Button
          className="w-full"
          variant={paid ? 'secondary' : 'primary'}
          loading={pending}
          icon={paid ? <Clock3 /> : <Check />}
          onClick={() => onChange(
            details.pagamento!.id,
            details.mesRef,
            details.membro.nome,
            paid ? getEffectiveStatus(details.mesRef, 'pendente') : 'pago',
          )}
        >
          {paid ? 'Desfazer pagamento' : 'Marcar como pago'}
        </Button>
      )}
    </div>
  )
}

function Legend({ status }: { status: CellStatus }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-app-muted">
      {statusIcon(status, `h-3.5 w-3.5 ${status === 'paid-on-time' ? 'text-app-accent' : status === 'paid-late' ? 'text-app-danger' : status === 'open' ? 'text-app-warn' : 'text-app-subtle'}`)}
      {STATUS_LABEL[status]}
    </span>
  )
}
