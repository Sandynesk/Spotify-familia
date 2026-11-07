'use client'

import { useState, useTransition, useOptimistic, useMemo } from 'react'
import { Check, AlertCircle, Clock, CheckCheck, Loader2 } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Sheet } from '@/components/ui/Sheet'
import { useToast } from '@/components/ui/Toast'
import { formatCurrency } from '@/lib/utils/currency'
import { getCurrentMonthISO, getEffectiveStatus } from '@/lib/utils/date'
import { marcarPago, desfazerPagamento, quitarPendencias } from '@/lib/actions/pagamentos'
import { OverviewMemberCard, type OverviewMonthItem } from './OverviewMemberCard'
import type { Membro, Pagamento, PagamentoStatus } from '@/types/database'

interface OverviewGridProps {
  membros: Membro[]
  pagamentos: Pagamento[]
  ano: number
}

const MESES_SIGLAS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
]

const MESES_NOMES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

interface UndoTarget {
  membroNome: string
  mesNome: string
  mesSigla: string
  ano: number
  pagamentoId: string
  mesRef: string
}

interface QuitarTarget {
  membro: Membro
  meses: OverviewMonthItem[]
  total: number
}

interface OptimisticUpdate {
  ids: string[]
  status: PagamentoStatus
}

export function OverviewGrid({ membros, pagamentos, ano }: OverviewGridProps) {
  const { success, error } = useToast()
  const [, startTransition] = useTransition()
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())

  const [undoTarget, setUndoTarget] = useState<UndoTarget | null>(null)
  const [isUndoPending, setIsUndoPending] = useState(false)

  const [quitarTarget, setQuitarTarget] = useState<QuitarTarget | null>(null)
  const [isQuitarPending, setIsQuitarPending] = useState(false)

  // Feedback otimista nativo via useOptimistic (Next 16 / React 19)
  const [optimisticPagamentos, setOptimisticPagamentos] = useOptimistic(
    pagamentos,
    (current: Pagamento[], update: OptimisticUpdate) => {
      const targetIds = new Set(update.ids)
      return current.map(p =>
        targetIds.has(p.id) ? { ...p, status: update.status } : p
      )
    }
  )

  const mesAtualISO = getCurrentMonthISO()
  const currentYear = new Date().getFullYear()
  const currentMonthIndex = new Date().getMonth()
  const isAnoAtual = ano === currentYear

  const gridData = useMemo(() => {
    const map = new Map<string, Pagamento>()

    optimisticPagamentos.forEach(p => {
      const key = `${p.membro_id}-${p.mes_referencia}`
      map.set(key, p)
    })

    return membros.map(membro => {
      const meses: OverviewMonthItem[] = MESES_SIGLAS.map((sigla, index) => {
        const mesRef = `${ano}-${String(index + 1).padStart(2, '0')}-01`
        const pagamento = map.get(`${membro.id}-${mesRef}`)
        const isCurrentMonth = isAnoAtual && index === currentMonthIndex

        return {
          mesRef,
          mesSigla: sigla,
          mesNome: MESES_NOMES[index],
          status: pagamento?.status,
          valor: Number(pagamento?.valor ?? membro.valor_mensal),
          pagamentoId: pagamento?.id,
          isCurrentMonth,
        }
      })

      const mesesNaoPagosAno = meses.filter(m => m.pagamentoId && m.status && m.status !== 'pago')
      const totalDeveAno = mesesNaoPagosAno.reduce((acc, m) => acc + m.valor, 0)
      const temAtrasoAno = mesesNaoPagosAno.some(m => m.status === 'atrasado')

      const mesesEmAbertoAteAgora = meses.filter(
        m => m.pagamentoId && m.status && m.status !== 'pago' && m.mesRef <= mesAtualISO
      )
      const totalEmAberto = mesesEmAbertoAteAgora.reduce((acc, m) => acc + m.valor, 0)

      return {
        membro,
        meses,
        totalDeveAno,
        temAtrasoAno,
        mesesEmAbertoAteAgora,
        totalEmAberto,
      }
    })
  }, [membros, optimisticPagamentos, ano, isAnoAtual, currentMonthIndex, mesAtualISO])

  // Ação otimista: marcar como pago
  function handleMarcarPago(pagamentoId: string, membroNome: string, mesNome: string) {
    setPendingIds(prev => new Set(prev).add(pagamentoId))

    startTransition(async () => {
      setOptimisticPagamentos({ ids: [pagamentoId], status: 'pago' })

      try {
        const res = await marcarPago(pagamentoId)
        if (res && 'error' in res && res.error) {
          error(res.error || 'Erro ao marcar pagamento')
        } else {
          success(`${membroNome}: ${mesNome} marcado como pago!`)
        }
      } catch (err: unknown) {
        error(err instanceof Error ? err.message : 'Erro ao marcar pagamento')
      } finally {
        setPendingIds(prev => {
          const next = new Set(prev)
          next.delete(pagamentoId)
          return next
        })
      }
    })
  }

  // Ação: desfazer pagamento após confirmação no Sheet
  function handleConfirmDesfazer() {
    if (!undoTarget) return
    const { pagamentoId, mesRef, membroNome, mesNome } = undoTarget
    setIsUndoPending(true)

    startTransition(async () => {
      const newStatus = getEffectiveStatus(mesRef, 'pendente')
      setOptimisticPagamentos({ ids: [pagamentoId], status: newStatus })

      try {
        const res = await desfazerPagamento(pagamentoId, mesRef)
        if (res && 'error' in res && res.error) {
          error(res.error || 'Erro ao desfazer pagamento')
        } else {
          success(`Pagamento de ${membroNome} (${mesNome}) desfeito com sucesso!`)
          setUndoTarget(null)
        }
      } catch (err: unknown) {
        error(err instanceof Error ? err.message : 'Erro ao desfazer pagamento')
      } finally {
        setIsUndoPending(false)
      }
    })
  }

  // Ação: quitar pendências após confirmação no Sheet
  function handleConfirmQuitar() {
    if (!quitarTarget) return
    const { membro, meses } = quitarTarget
    const targetIds = meses.map(m => m.pagamentoId).filter(Boolean) as string[]
    setIsQuitarPending(true)

    startTransition(async () => {
      setOptimisticPagamentos({ ids: targetIds, status: 'pago' })

      try {
        const res = await quitarPendencias(membro.id)
        if ('error' in res && res.error) {
          error(res.error || 'Erro ao quitar pendências')
        } else if ('success' in res && res.success) {
          success(
            `${res.quitadas} ${
              res.quitadas === 1 ? 'mês quitado' : 'meses quitados'
            } para ${membro.nome}!`
          )
          setQuitarTarget(null)
        }
      } catch (err: unknown) {
        error(err instanceof Error ? err.message : 'Erro ao quitar pendências')
      } finally {
        setIsQuitarPending(false)
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Legenda com os tokens e estados */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-app-muted bg-app-surface border border-app-line rounded-[var(--radius-app)] px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-[var(--radius-app-sm)] bg-app-accent/20 text-app-accent border border-app-accent/40 font-semibold text-[10px]">
            ✓
          </span>
          <span>Pago</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-[var(--radius-app-sm)] bg-app-warn/20 text-app-warn border border-app-warn/40 font-semibold text-[10px]">
            •
          </span>
          <span>Pendente</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-[var(--radius-app-sm)] bg-app-danger/20 text-app-danger border border-app-danger/40 font-semibold text-[10px]">
            !
          </span>
          <span>Atrasado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-[var(--radius-app-sm)] bg-app-elevated/40 text-app-subtle/50 font-semibold text-[10px]">
            —
          </span>
          <span>Sem cobrança</span>
        </div>
        {isAnoAtual && (
          <div className="flex items-center gap-1.5 ml-auto text-app-subtle">
            <span className="flex h-5 w-5 items-center justify-center rounded-[var(--radius-app-sm)] ring-2 ring-white text-[10px] text-app-text font-bold">
              {currentMonthIndex + 1}
            </span>
            <span>Mês atual</span>
          </div>
        )}
      </div>

      {/* Visão Mobile: Um Card por Membro */}
      <div className="lg:hidden space-y-3">
        {gridData.map(({ membro, meses }) => (
          <OverviewMemberCard
            key={membro.id}
            membro={membro}
            ano={ano}
            meses={meses}
            pendingIds={pendingIds}
            onMarcarPago={handleMarcarPago}
            onOpenDesfazer={setUndoTarget}
            onOpenQuitar={setQuitarTarget}
            mesAtualISO={mesAtualISO}
          />
        ))}
      </div>

      {/* Visão Desktop: Tabela de 12 meses */}
      <div className="hidden lg:block overflow-x-auto rounded-[var(--radius-app)] border border-app-line bg-app-surface">
        <table className="w-full min-w-[850px]">
          <thead>
            <tr className="border-b border-app-line">
              <th className="sticky left-0 z-10 bg-app-surface text-left px-5 py-3.5 text-xs font-semibold text-app-muted uppercase tracking-wider w-[240px]">
                Membro
              </th>
              {MESES_SIGLAS.map((mes, idx) => {
                const isCurrent = isAnoAtual && idx === currentMonthIndex
                return (
                  <th
                    key={mes}
                    className="px-2 py-3.5 text-center text-xs font-semibold text-app-muted uppercase tracking-wider min-w-[56px]"
                  >
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded ${
                        isCurrent ? 'bg-app-elevated text-app-text font-bold ring-1 ring-white/70' : ''
                      }`}
                    >
                      {mes}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {gridData.map(({ membro, meses, totalDeveAno, temAtrasoAno, mesesEmAbertoAteAgora, totalEmAberto }) => (
              <tr
                key={membro.id}
                className="border-b border-app-line last:border-0 hover:bg-app-elevated/40 transition-colors"
              >
                {/* Coluna fixa do membro */}
                <td className="sticky left-0 z-10 bg-app-surface px-5 py-3.5 whitespace-nowrap border-r border-app-line/50">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar nome={membro.nome} cor={membro.cor_avatar} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-app-text truncate">
                          {membro.nome}
                        </p>
                        <p className="text-xs text-app-muted">
                          {formatCurrency(Number(membro.valor_mensal))}/mês
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      {totalDeveAno > 0 ? (
                        <p
                          className={`text-xs font-bold tabular-nums ${
                            temAtrasoAno ? 'text-app-danger' : 'text-app-warn'
                          }`}
                        >
                          Deve {formatCurrency(totalDeveAno)}
                        </p>
                      ) : (
                        <span className="text-xs font-semibold text-app-accent flex items-center justify-end gap-1">
                          <Check className="w-3 h-3 stroke-[2.5]" /> Em dia
                        </span>
                      )}

                      {mesesEmAbertoAteAgora.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setQuitarTarget({
                              membro,
                              meses: mesesEmAbertoAteAgora,
                              total: totalEmAberto,
                            })
                          }
                          className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-app-accent hover:bg-app-accent-hover text-black font-semibold text-[10px] transition-transform active:scale-95"
                          title={`Quitar ${mesesEmAbertoAteAgora.length} pendências (${formatCurrency(totalEmAberto)})`}
                        >
                          <CheckCheck className="w-3 h-3" /> Quitar {mesesEmAbertoAteAgora.length}
                        </button>
                      )}
                    </div>
                  </div>
                </td>

                {/* Colunas dos 12 meses */}
                {meses.map(mes => {
                  const isPending = mes.pagamentoId ? pendingIds.has(mes.pagamentoId) : false
                  const isSemCobranca = !mes.status || !mes.pagamentoId

                  return (
                    <td key={mes.mesRef} className="px-2 py-3 text-center">
                      {isSemCobranca ? (
                        <div
                          role="button"
                          aria-disabled="true"
                          aria-label={`${membro.nome}, ${mes.mesNome} de ${ano}, sem cobrança`}
                          className={`w-9 h-9 mx-auto rounded-[var(--radius-app-sm)] bg-app-elevated/30 text-app-subtle/30 flex items-center justify-center text-xs cursor-not-allowed select-none ${
                            mes.isCurrentMonth
                              ? 'ring-2 ring-white/90 ring-offset-1 ring-offset-app-surface'
                              : ''
                          }`}
                          title={`${membro.nome} — ${mes.mesNome} de ${ano}: Sem cobrança`}
                        >
                          —
                        </div>
                      ) : mes.status === 'pago' ? (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() =>
                            setUndoTarget({
                              membroNome: membro.nome,
                              mesNome: mes.mesNome,
                              mesSigla: mes.mesSigla,
                              ano,
                              pagamentoId: mes.pagamentoId!,
                              mesRef: mes.mesRef,
                            })
                          }
                          aria-label={`${membro.nome}, ${mes.mesNome} de ${ano}, pago. Toque para desfazer`}
                          title={`${membro.nome} — ${mes.mesNome} de ${ano}: Pago (${formatCurrency(
                            mes.valor
                          )}). Toque para desfazer.`}
                          className={`w-9 h-9 mx-auto rounded-[var(--radius-app-sm)] bg-app-accent/15 text-app-accent border border-app-accent/30 hover:bg-app-accent/25 active:scale-95 transition-all flex items-center justify-center cursor-pointer ${
                            mes.isCurrentMonth
                              ? 'ring-2 ring-white/90 ring-offset-1 ring-offset-app-surface'
                              : ''
                          }`}
                        >
                          {isPending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4 stroke-[2.5]" />
                          )}
                        </button>
                      ) : mes.status === 'atrasado' ? (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() =>
                            handleMarcarPago(mes.pagamentoId!, membro.nome, mes.mesNome)
                          }
                          aria-label={`${membro.nome}, ${mes.mesNome} de ${ano}, atrasado. Toque para marcar como pago`}
                          title={`${membro.nome} — ${mes.mesNome} de ${ano}: Atrasado (${formatCurrency(
                            mes.valor
                          )}). Toque para marcar como pago.`}
                          className={`w-9 h-9 mx-auto rounded-[var(--radius-app-sm)] bg-app-danger/15 text-app-danger border border-app-danger/30 hover:bg-app-danger/25 active:scale-95 transition-all flex items-center justify-center cursor-pointer ${
                            mes.isCurrentMonth
                              ? 'ring-2 ring-white/90 ring-offset-1 ring-offset-app-surface'
                              : ''
                          }`}
                        >
                          {isPending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <AlertCircle className="w-4 h-4 stroke-[2.5]" />
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() =>
                            handleMarcarPago(mes.pagamentoId!, membro.nome, mes.mesNome)
                          }
                          aria-label={`${membro.nome}, ${mes.mesNome} de ${ano}, pendente. Toque para marcar como pago`}
                          title={`${membro.nome} — ${mes.mesNome} de ${ano}: Pendente (${formatCurrency(
                            mes.valor
                          )}). Toque para marcar como pago.`}
                          className={`w-9 h-9 mx-auto rounded-[var(--radius-app-sm)] bg-app-warn/15 text-app-warn border border-app-warn/30 hover:bg-app-warn/25 active:scale-95 transition-all flex items-center justify-center cursor-pointer ${
                            mes.isCurrentMonth
                              ? 'ring-2 ring-white/90 ring-offset-1 ring-offset-app-surface'
                              : ''
                          }`}
                        >
                          {isPending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Clock className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sheet: Desfazer pagamento */}
      <Sheet
        open={!!undoTarget}
        onClose={() => !isUndoPending && setUndoTarget(null)}
        title={
          undoTarget
            ? `Desfazer pagamento de ${undoTarget.membroNome} — ${undoTarget.mesSigla}/${undoTarget.ano}?`
            : 'Desfazer pagamento?'
        }
        description="O status deste mês voltará para pendente ou atrasado."
      >
        <div className="space-y-4 pt-2">
          <div className="rounded-[var(--radius-app-sm)] border border-app-line bg-app-elevated p-3 text-sm text-app-muted">
            Você está prestes a desfazer a confirmação de pagamento de{' '}
            <strong className="text-app-text">{undoTarget?.membroNome}</strong> referente ao mês de{' '}
            <strong className="text-app-text">
              {undoTarget?.mesNome} de {undoTarget?.ano}
            </strong>
            .
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
            <button
              type="button"
              disabled={isUndoPending}
              onClick={() => setUndoTarget(null)}
              className="flex-1 py-3 px-4 rounded-full border border-app-line bg-app-elevated hover:bg-app-elevated/80 text-app-text font-medium text-sm transition-colors disabled:opacity-50 min-h-[44px]"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={isUndoPending}
              onClick={handleConfirmDesfazer}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-app-danger hover:bg-app-danger/90 text-white font-semibold text-sm transition-colors disabled:opacity-50 min-h-[44px]"
            >
              {isUndoPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Desfazendo...
                </>
              ) : (
                'Desfazer pagamento'
              )}
            </button>
          </div>
        </div>
      </Sheet>

      {/* Sheet: Quitar pendências */}
      <Sheet
        open={!!quitarTarget}
        onClose={() => !isQuitarPending && setQuitarTarget(null)}
        title={
          quitarTarget
            ? `Quitar pendências de ${quitarTarget.membro.nome}`
            : 'Quitar pendências'
        }
        description="Quitação de todas as cobranças em aberto até o mês atual."
      >
        <div className="space-y-4 pt-2">
          <div className="rounded-[var(--radius-app-sm)] border border-app-line bg-app-elevated p-4">
            <p className="text-xs text-app-muted mb-1">Valor total a quitar</p>
            <p className="text-2xl font-bold text-app-accent tabular-nums">
              {formatCurrency(quitarTarget?.total ?? 0)}
            </p>
            <p className="text-xs text-app-subtle mt-2">
              {quitarTarget?.meses.length}{' '}
              {quitarTarget?.meses.length === 1 ? 'mês incluído' : 'meses incluídos'}:
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2 max-h-36 overflow-y-auto">
              {quitarTarget?.meses.map(m => (
                <span
                  key={m.mesRef}
                  className="inline-flex items-center gap-1 rounded-md bg-app-surface px-2.5 py-1 text-xs font-medium text-app-text border border-app-line"
                >
                  {m.mesSigla}/{ano} • {formatCurrency(m.valor)}
                </span>
              ))}
            </div>
          </div>

          <p className="text-xs text-app-muted">
            Todas as cobranças selecionadas serão confirmadas e marcadas como pagas.
          </p>

          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
            <button
              type="button"
              disabled={isQuitarPending}
              onClick={() => setQuitarTarget(null)}
              className="flex-1 py-3 px-4 rounded-full border border-app-line bg-app-elevated hover:bg-app-elevated/80 text-app-text font-medium text-sm transition-colors disabled:opacity-50 min-h-[44px]"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={isQuitarPending}
              onClick={handleConfirmQuitar}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-app-accent hover:bg-app-accent-hover text-black font-semibold text-sm transition-colors disabled:opacity-50 min-h-[44px]"
            >
              {isQuitarPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Quitando...
                </>
              ) : (
                'Confirmar quitação'
              )}
            </button>
          </div>
        </div>
      </Sheet>
    </div>
  )
}
