'use client'

import { useState, useTransition } from 'react'
import { CheckCircle, RotateCcw, Calendar, Edit2, Check, X, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { marcarPago, desfazerPagamento, atualizarValorPagamento } from '@/lib/actions/pagamentos'
import { formatShortMonthYear, formatDateTime, getCurrentMonthISO } from '@/lib/utils/date'
import { formatCurrency } from '@/lib/utils/currency'
import type { Pagamento } from '@/types/database'

interface PaymentHistoryProps {
  pagamentos: Pagamento[]
}

interface PaymentItemProps {
  pagamento: Pagamento
  isCurrentMonth: boolean
}

function PaymentItem({ pagamento, isCurrentMonth }: PaymentItemProps) {
  const { success, error } = useToast()
  const [pending, startTransition] = useTransition()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(String(pagamento.valor))

  function handleMarcarPago() {
    startTransition(async () => {
      const result = await marcarPago(pagamento.id)
      if (result && 'error' in result && result.error) {
        error('Erro ao marcar como pago')
      } else {
        success('Pagamento confirmado!')
      }
    })
  }

  function handleDesfazer() {
    startTransition(async () => {
      const result = await desfazerPagamento(pagamento.id, pagamento.mes_referencia)
      if (result && 'error' in result && result.error) {
        error('Erro ao desfazer pagamento')
      } else {
        success('Pagamento revertido')
      }
    })
  }

  function handleSalvarValor() {
    const valorNum = parseFloat(editValue.replace(',', '.'))
    if (isNaN(valorNum) || valorNum < 0) {
      error('Valor inválido')
      return
    }

    startTransition(async () => {
      const result = await atualizarValorPagamento(pagamento.id, valorNum)
      if (result && 'error' in result && result.error) {
        error('Erro ao atualizar valor')
      } else {
        success('Valor atualizado!')
        setIsEditing(false)
      }
    })
  }

  const mesStr = formatShortMonthYear(pagamento.mes_referencia)

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3.5 transition-colors
        ${isCurrentMonth ? 'bg-app-elevated/70 border-l-2 border-l-app-accent' : 'border-l-2 border-l-transparent'}
        border-b border-app-line last:border-b-0
      `}
    >
      <div className="flex-shrink-0">
        <div
          className={`
            w-10 h-10 rounded-[var(--radius-app-sm)] flex items-center justify-center
            ${isCurrentMonth ? 'bg-app-accent/15 text-app-accent' : 'bg-app-elevated text-app-subtle'}
          `}
          aria-hidden="true"
        >
          <Calendar className="w-5 h-5" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-app-text text-sm font-medium capitalize truncate">
            {mesStr}
          </p>
          {isCurrentMonth && (
            <span className="inline-flex items-center rounded-full bg-app-accent/15 px-2 py-0.5 text-[11px] font-semibold text-app-accent">
              Mês atual
            </span>
          )}
        </div>
        {pagamento.data_pagamento ? (
          <p className="text-app-subtle text-xs mt-0.5 truncate">
            Pago em {formatDateTime(pagamento.data_pagamento)}
          </p>
        ) : (
          <p className="text-app-subtle text-xs mt-0.5">
            Cobrança em aberto
          </p>
        )}
        {pagamento.observacao && (
          <p className="text-app-muted text-xs truncate mt-0.5">{pagamento.observacao}</p>
        )}
      </div>

      {isEditing ? (
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <input
            type="text"
            inputMode="decimal"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            className="w-20 min-h-[44px] px-2.5 text-sm bg-app-elevated border border-app-accent rounded-[var(--radius-app-sm)] text-app-text tabular-nums focus:outline-none"
            disabled={pending}
            autoFocus
            aria-label="Novo valor"
          />
          <button
            onClick={handleSalvarValor}
            disabled={pending}
            className="min-w-[44px] min-h-[44px] rounded-full bg-app-accent/15 hover:bg-app-accent/25 flex items-center justify-center text-app-accent transition-all active:scale-95 disabled:opacity-50"
            aria-label="Salvar novo valor"
          >
            {pending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => {
              setIsEditing(false)
              setEditValue(String(pagamento.valor))
            }}
            disabled={pending}
            className="min-w-[44px] min-h-[44px] rounded-full bg-app-elevated hover:bg-app-line flex items-center justify-center text-app-muted hover:text-app-text transition-all active:scale-95 disabled:opacity-50"
            aria-label="Cancelar edição de valor"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <div className="flex items-center">
            <span className="text-app-text text-sm font-semibold tabular-nums">
              {formatCurrency(Number(pagamento.valor))}
            </span>
            <button
              onClick={() => setIsEditing(true)}
              className="min-w-[44px] min-h-[44px] -ml-1 rounded-full flex items-center justify-center text-app-subtle hover:text-app-text transition-colors"
              aria-label={`Editar valor do mês ${mesStr}`}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <Badge status={pagamento.status} />
        </div>
      )}

      {/* Ações: Marcar pago / Desfazer */}
      {!isEditing && (
        <div className="flex-shrink-0 ml-1">
          {pagamento.status !== 'pago' ? (
            <button
              onClick={handleMarcarPago}
              disabled={pending}
              className="min-w-[44px] min-h-[44px] rounded-full bg-app-accent/15 hover:bg-app-accent/25 text-app-accent flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
              aria-label={`Marcar mês ${mesStr} como pago`}
            >
              {pending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
            </button>
          ) : (
            <button
              onClick={handleDesfazer}
              disabled={pending}
              className="min-w-[44px] min-h-[44px] rounded-full bg-app-elevated hover:bg-app-line text-app-subtle hover:text-app-text flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
              aria-label={`Desfazer pagamento do mês ${mesStr}`}
            >
              {pending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function PaymentHistory({ pagamentos }: PaymentHistoryProps) {
  if (pagamentos.length === 0) {
    return (
      <div className="rounded-[var(--radius-app)] border border-app-line bg-app-surface p-8 text-center">
        <p className="text-app-muted text-sm">Nenhum pagamento registrado ainda</p>
      </div>
    )
  }

  const mesAtual = getCurrentMonthISO()

  // Agrupar pagamentos por ano
  const groupedByYear = pagamentos.reduce<Record<string, Pagamento[]>>((acc, p) => {
    const year = p.mes_referencia.slice(0, 4)
    if (!acc[year]) acc[year] = []
    acc[year].push(p)
    return acc
  }, {})

  const years = Object.keys(groupedByYear).sort((a, b) => Number(b) - Number(a))

  return (
    <div className="space-y-4">
      {years.map(year => (
        <div
          key={year}
          className="rounded-[var(--radius-app)] border border-app-line bg-app-surface overflow-hidden"
        >
          {years.length > 1 && (
            <div className="px-4 py-2 bg-app-elevated/40 border-b border-app-line flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-app-subtle">
                Ano {year}
              </span>
              <span className="text-xs text-app-subtle tabular-nums">
                {groupedByYear[year].length} {groupedByYear[year].length === 1 ? 'mês' : 'meses'}
              </span>
            </div>
          )}
          <div>
            {groupedByYear[year].map(pagamento => (
              <PaymentItem
                key={pagamento.id}
                pagamento={pagamento}
                isCurrentMonth={pagamento.mes_referencia === mesAtual}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
