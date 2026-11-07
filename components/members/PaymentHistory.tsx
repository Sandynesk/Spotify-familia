'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, Check, CheckCircle2, Edit2, MessageSquareText, RotateCcw, X } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { IconButton } from '@/components/ui/IconButton'
import { Textarea } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { atualizarValorPagamento, desfazerPagamento, marcarPago } from '@/lib/actions/pagamentos'
import { marcarPagoEm, salvarObservacao } from '@/lib/actions/lote'
import { formatShortMonthYear, formatDateTime, getCurrentMonthISO } from '@/lib/utils/date'
import { formatCurrency } from '@/lib/utils/currency'
import type { Pagamento } from '@/types/database'

interface PaymentHistoryProps {
  pagamentos: Pagamento[]
}

function localDateInput() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function PaymentItem({ pagamento, isCurrentMonth }: { pagamento: Pagamento; isCurrentMonth: boolean }) {
  const router = useRouter()
  const { show, success, error } = useToast()
  const [pending, startTransition] = useTransition()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(String(pagamento.valor))
  const [isEditingObservation, setIsEditingObservation] = useState(false)
  const [observation, setObservation] = useState(pagamento.observacao ?? '')
  const [isChoosingDate, setIsChoosingDate] = useState(false)
  const [paidDate, setPaidDate] = useState(localDateInput)

  const monthLabel = formatShortMonthYear(pagamento.mes_referencia)

  function handleUndo() {
    startTransition(async () => {
      const result = await desfazerPagamento(pagamento.id, pagamento.mes_referencia)
      if ('error' in result && result.error) {
        error('Não foi possível desfazer o pagamento.')
        return
      }
      show({ message: `Pagamento de ${monthLabel} desfeito.`, type: 'warning' })
      router.refresh()
    })
  }

  function markPaid(action: () => Promise<{ success?: boolean } | { error: string }>) {
    startTransition(async () => {
      const result = await action()
      if ('error' in result && result.error) {
        error(result.error)
        return
      }
      show({
        message: `Pagamento de ${monthLabel} confirmado.`,
        action: { label: 'Desfazer', onClick: handleUndo },
      })
      setIsChoosingDate(false)
      router.refresh()
    })
  }

  function handleSaveValue() {
    const cleaned = editValue.trim().replace(/\s/g, '')
    const normalized = cleaned.includes(',')
      ? cleaned.replace(/\./g, '').replace(',', '.')
      : cleaned
    const value = Number(normalized)
    if (!Number.isFinite(value) || value < 0) {
      error('Informe um valor válido.')
      return
    }

    startTransition(async () => {
      const result = await atualizarValorPagamento(pagamento.id, value)
      if ('error' in result && result.error) {
        error(result.error)
        return
      }
      setEditValue(String(value))
      setIsEditing(false)
      success('Valor atualizado.')
      router.refresh()
    })
  }

  function handleSaveObservation() {
    startTransition(async () => {
      const result = await salvarObservacao(pagamento.id, observation)
      if ('error' in result && result.error) {
        error(result.error)
        return
      }
      setObservation(observation.trim())
      setIsEditingObservation(false)
      success('Observação salva.')
      router.refresh()
    })
  }

  return (
    <li className={`border-b border-app-line last:border-b-0 ${isCurrentMonth ? 'bg-app-elevated/40' : ''}`}>
      <div className="grid grid-cols-[40px_minmax(0,1fr)] gap-3 p-4 sm:p-5">
        <span className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-app-sm ${isCurrentMonth ? 'bg-app-accent/12 text-app-accent' : 'bg-app-elevated text-app-subtle'}`} aria-hidden>
          <CalendarDays className="h-5 w-5" />
        </span>

        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <p className="text-sm font-semibold capitalize text-app-text">{monthLabel}</p>
            {isCurrentMonth && <span className="rounded-full bg-app-accent/12 px-2 py-1 text-[11px] font-medium text-app-accent">Mês atual</span>}
            <Badge status={pagamento.status} />
          </div>

          <p className="mt-1 min-h-5 text-xs text-app-subtle">
            {pagamento.data_pagamento ? `Pago em ${formatDateTime(pagamento.data_pagamento)}` : 'Cobrança em aberto'}
          </p>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            {isEditing ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  inputMode="decimal"
                  value={editValue}
                  onChange={(event) => setEditValue(event.target.value)}
                  className="min-h-11 w-24 rounded-app-sm border border-app-accent bg-app-elevated px-3 text-sm tabular text-app-text outline-none"
                  disabled={pending}
                  autoFocus
                  aria-label={`Novo valor de ${monthLabel}`}
                />
                <IconButton aria-label="Salvar novo valor" icon={<Check />} variant="ghost" onClick={handleSaveValue} disabled={pending} />
                <IconButton aria-label="Cancelar edição do valor" icon={<X />} variant="ghost" onClick={() => { setIsEditing(false); setEditValue(String(pagamento.valor)) }} disabled={pending} />
              </div>
            ) : (
              <div className="flex min-h-11 items-center gap-1">
                <span className="text-sm font-semibold tabular text-app-text">{formatCurrency(Number(pagamento.valor))}</span>
                <IconButton aria-label={`Editar valor de ${monthLabel}`} icon={<Edit2 />} variant="ghost" onClick={() => setIsEditing(true)} disabled={pending} />
              </div>
            )}

            <div className="flex items-center gap-1">
              {pagamento.status === 'pago' ? (
                <IconButton
                  aria-label={`Desfazer pagamento de ${monthLabel}`}
                  title="Desfazer pagamento"
                  icon={<RotateCcw />}
                  variant="ghost"
                  onClick={handleUndo}
                  disabled={pending}
                />
              ) : (
                <>
                  <IconButton
                    aria-label={`Escolher outra data para pagamento de ${monthLabel}`}
                    title="Marcar pago em outra data"
                    icon={<CalendarDays />}
                    variant="ghost"
                    onClick={() => { setPaidDate(localDateInput()); setIsChoosingDate((open) => !open) }}
                    disabled={pending}
                  />
                  <IconButton
                    aria-label={`Marcar ${monthLabel} como pago hoje`}
                    title="Marcar pago hoje"
                    icon={<CheckCircle2 />}
                    onClick={() => markPaid(() => marcarPago(pagamento.id))}
                    disabled={pending}
                  />
                </>
              )}
            </div>
          </div>

          {isChoosingDate && pagamento.status !== 'pago' && (
            <div className="mt-3 flex flex-wrap items-end gap-2 rounded-app-sm border border-app-line bg-app-elevated/60 p-3">
              <label className="min-w-40 flex-1 text-xs font-medium text-app-muted">
                Data em que recebeu
                <input
                  type="date"
                  value={paidDate}
                  onChange={(event) => setPaidDate(event.target.value)}
                  className="mt-1 min-h-11 w-full rounded-app-sm border border-app-line bg-app-elevated px-3 text-sm text-app-text"
                  disabled={pending}
                />
              </label>
              <Button
                type="button"
                loading={pending}
                onClick={() => markPaid(() => marcarPagoEm(pagamento.id, paidDate))}
              >
                Confirmar data
              </Button>
              <Button type="button" variant="ghost" disabled={pending} onClick={() => setIsChoosingDate(false)}>
                Cancelar
              </Button>
            </div>
          )}

          {isEditingObservation ? (
            <div className="mt-3 space-y-2">
              <Textarea
                label={`Observação de ${monthLabel}`}
                value={observation}
                onChange={(event) => setObservation(event.target.value)}
                maxLength={2000}
                hint={`${observation.length}/2000`}
                rows={2}
                disabled={pending}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" disabled={pending} onClick={() => { setIsEditingObservation(false); setObservation(pagamento.observacao ?? '') }}>Cancelar</Button>
                <Button type="button" loading={pending} onClick={handleSaveObservation}>Salvar observação</Button>
              </div>
            </div>
          ) : (
            <div className="mt-2 flex items-start justify-between gap-2">
              {observation ? (
                <p className="min-w-0 flex-1 break-words text-xs text-app-muted">{observation}</p>
              ) : (
                <span className="text-xs text-app-subtle">Sem observação</span>
              )}
              <button
                type="button"
                onClick={() => setIsEditingObservation(true)}
                disabled={pending}
                className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-2 text-xs font-medium text-app-muted transition-colors hover:bg-app-elevated hover:text-app-text disabled:opacity-50"
                aria-label={observation ? `Editar observação de ${monthLabel}` : `Adicionar observação a ${monthLabel}`}
              >
                <MessageSquareText aria-hidden className="h-4 w-4" />
                <span>{observation ? 'Editar' : 'Observação'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

export function PaymentHistory({ pagamentos }: PaymentHistoryProps) {
  if (pagamentos.length === 0) {
    return (
      <Card className="py-10 text-center">
        <p className="text-sm text-app-muted">Nenhum pagamento registrado ainda.</p>
      </Card>
    )
  }

  const mesAtual = getCurrentMonthISO()
  const groupedByYear = pagamentos.reduce<Record<string, Pagamento[]>>((acc, pagamento) => {
    const year = pagamento.mes_referencia.slice(0, 4)
    if (!acc[year]) acc[year] = []
    acc[year].push(pagamento)
    return acc
  }, {})
  const years = Object.keys(groupedByYear).sort((a, b) => Number(b) - Number(a))

  return (
    <div className="space-y-4">
      {years.map((year) => (
        <Card key={year} padding="none" className="overflow-hidden">
          {years.length > 1 && (
            <div className="flex items-center justify-between border-b border-app-line bg-app-elevated/40 px-4 py-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-app-subtle">{year}</span>
              <span className="text-xs tabular text-app-subtle">{groupedByYear[year].length} meses</span>
            </div>
          )}
          <ol aria-label={`Histórico de ${year}`}>
            {groupedByYear[year].map((pagamento) => (
              <PaymentItem
                key={pagamento.id}
                pagamento={pagamento}
                isCurrentMonth={pagamento.mes_referencia === mesAtual}
              />
            ))}
          </ol>
        </Card>
      ))}
    </div>
  )
}
