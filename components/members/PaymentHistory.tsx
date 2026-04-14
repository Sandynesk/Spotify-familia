'use client'

import { useTransition } from 'react'
import { CheckCircle, RotateCcw, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { marcarPago, desfazerPagamento } from '@/lib/actions/pagamentos'
import { formatShortMonthYear, formatDateTime } from '@/lib/utils/date'
import { formatCurrency } from '@/lib/utils/currency'
import type { Pagamento } from '@/types/database'

interface PaymentHistoryProps {
  pagamentos: Pagamento[]
  membroId: string
}

interface PaymentItemProps {
  pagamento: Pagamento
  membroId: string
}

function PaymentItem({ pagamento, membroId }: PaymentItemProps) {
  const { success, error } = useToast()
  const [pending, startTransition] = useTransition()

  function handleMarcarPago() {
    startTransition(async () => {
      const result = await marcarPago(pagamento.id, membroId)
      if (result?.error) error('Erro ao marcar como pago')
      else success('Pagamento confirmado!')
    })
  }

  function handleDesfazer() {
    startTransition(async () => {
      const result = await desfazerPagamento(pagamento.id, membroId, pagamento.mes_referencia)
      if (result?.error) error('Erro ao desfazer pagamento')
      else success('Pagamento revertido')
    })
  }

  const mesStr = formatShortMonthYear(pagamento.mes_referencia)

  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
      <div className="flex-shrink-0">
        <div className="w-9 h-9 bg-[#282828] rounded-lg flex items-center justify-center">
          <Calendar className="w-4 h-4 text-[#535353]" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium capitalize">{mesStr}</p>
        {pagamento.data_pagamento && (
          <p className="text-[#535353] text-xs mt-0.5">
            pago em {formatDateTime(pagamento.data_pagamento)}
          </p>
        )}
        {pagamento.observacao && (
          <p className="text-[#535353] text-xs truncate">{pagamento.observacao}</p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-white text-sm font-semibold">
          {formatCurrency(Number(pagamento.valor))}
        </span>
        <Badge status={pagamento.status} />
      </div>

      {/* Actions */}
      {pagamento.status !== 'pago' && (
        <button
          onClick={handleMarcarPago}
          disabled={pending}
          className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1DB954]/10 hover:bg-[#1DB954]/20 flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
          aria-label="Marcar como pago"
        >
          {pending
            ? <div className="w-3.5 h-3.5 border-2 border-[#1DB954]/30 border-t-[#1DB954] rounded-full animate-spin" />
            : <CheckCircle className="w-4 h-4 text-[#1DB954]" />
          }
        </button>
      )}

      {pagamento.status === 'pago' && (
        <button
          onClick={handleDesfazer}
          disabled={pending}
          className="flex-shrink-0 w-8 h-8 rounded-full bg-[#282828] hover:bg-[#3E3E3E] flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
          aria-label="Desfazer pagamento"
        >
          {pending
            ? <div className="w-3.5 h-3.5 border-2 border-[#535353] border-t-[#B3B3B3] rounded-full animate-spin" />
            : <RotateCcw className="w-3.5 h-3.5 text-[#535353]" />
          }
        </button>
      )}
    </div>
  )
}

export function PaymentHistory({ pagamentos, membroId }: PaymentHistoryProps) {
  if (pagamentos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[#535353] text-sm">Nenhum pagamento registrado</p>
      </div>
    )
  }

  return (
    <div className="bg-[#181818] rounded-lg px-4">
      {pagamentos.map(pagamento => (
        <PaymentItem
          key={pagamento.id}
          pagamento={pagamento}
          membroId={membroId}
        />
      ))}
    </div>
  )
}
