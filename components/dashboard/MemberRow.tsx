'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ChevronRight, CheckCircle } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils/currency'
import { marcarPago } from '@/lib/actions/pagamentos'
import { useToast } from '@/components/ui/Toast'
import type { Membro, Pagamento, PagamentoStatus } from '@/types/database'

interface MemberRowProps {
  membro: Membro
  pagamento: (Pagamento & { status: PagamentoStatus }) | null
}

export function MemberRow({ membro, pagamento }: MemberRowProps) {
  const { success, error } = useToast()
  const [pending, startTransition] = useTransition()
  const [swipedOpen, setSwipedOpen] = useState(false)

  const status = pagamento?.status ?? 'pendente'

  function handleMarcarPago(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!pagamento) return

    startTransition(async () => {
      const result = await marcarPago(pagamento.id, membro.id)
      if (result?.error) error('Erro ao marcar como pago')
      else success(`${membro.nome} marcado como pago!`)
    })
  }

  return (
    <Link
      href={`/membros/${membro.id}`}
      className="group flex items-center gap-3 p-4 bg-[#181818] hover:bg-[#282828] rounded-lg transition-all duration-200"
    >
      <Avatar nome={membro.nome} cor={membro.cor_avatar} size="md" />

      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm truncate">{membro.nome}</p>
        {membro.email && (
          <p className="text-[#535353] text-xs truncate mt-0.5">{membro.email}</p>
        )}
      </div>

      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span className="text-white text-sm font-semibold">
          {formatCurrency(Number(membro.valor_mensal))}
        </span>
        <Badge status={status} />
      </div>

      {(status === 'pendente' || status === 'atrasado') && pagamento && (
        <button
          onClick={handleMarcarPago}
          disabled={pending}
          className="
            ml-1 flex-shrink-0 w-8 h-8 rounded-full
            bg-[#1DB954]/10 hover:bg-[#1DB954]/20
            flex items-center justify-center
            transition-all duration-200 active:scale-95
            disabled:opacity-50
          "
          aria-label={`Marcar ${membro.nome} como pago`}
        >
          {pending
            ? <div className="w-3.5 h-3.5 border-2 border-[#1DB954]/40 border-t-[#1DB954] rounded-full animate-spin" />
            : <CheckCircle className="w-4 h-4 text-[#1DB954]" />
          }
        </button>
      )}

      <ChevronRight
        className="w-4 h-4 text-[#535353] group-hover:text-[#B3B3B3] transition-colors flex-shrink-0"
      />
    </Link>
  )
}
