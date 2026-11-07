'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { ChevronRight, CheckCircle, Loader2 } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils/currency'
import { marcarPago } from '@/lib/actions/pagamentos'
import { useToast } from '@/components/ui/Toast'
import type { Membro, Pagamento, PagamentoStatus } from '@/types/database'

interface MemberCardProps {
  membro: Membro
  pagamento: (Pagamento & { status: PagamentoStatus }) | null
}

export function MemberCard({ membro, pagamento }: MemberCardProps) {
  const { success, error } = useToast()
  const [pending, startTransition] = useTransition()

  const status = pagamento?.status ?? 'pendente'

  function handleMarcarPago(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!pagamento) return

    startTransition(async () => {
      const result = await marcarPago(pagamento.id)
      if (result && 'error' in result && result.error) {
        error('Erro ao marcar como pago')
      } else {
        success(`${membro.nome} marcado como pago!`)
      }
    })
  }

  return (
    <Link
      href={`/membros/${membro.id}`}
      className="group flex items-center gap-3.5 p-4 rounded-[var(--radius-app)] border border-app-line bg-app-surface hover:bg-app-elevated transition-colors min-h-[64px]"
    >
      <Avatar nome={membro.nome} cor={membro.cor_avatar} size="md" />

      <div className="flex-1 min-w-0">
        <p className="text-app-text font-medium text-sm sm:text-base truncate group-hover:text-white transition-colors">
          {membro.nome}
        </p>
        <p className="text-app-muted text-xs truncate mt-0.5">
          {membro.email || `Vencimento dia ${membro.dia_vencimento}`}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-app-text text-sm font-semibold tabular-nums">
          {formatCurrency(Number(pagamento ? pagamento.valor : membro.valor_mensal))}
        </span>
        <Badge status={status} />
      </div>

      {(status === 'pendente' || status === 'atrasado') && pagamento && (
        <button
          onClick={handleMarcarPago}
          disabled={pending}
          className="
            ml-1 flex-shrink-0 min-w-[44px] min-h-[44px] rounded-full
            bg-app-accent/15 hover:bg-app-accent/25 text-app-accent
            flex items-center justify-center
            transition-all duration-200 active:scale-95
            disabled:opacity-50
          "
          aria-label={`Marcar ${membro.nome} como pago`}
        >
          {pending ? (
            <Loader2 className="w-5 h-5 animate-spin text-app-accent" />
          ) : (
            <CheckCircle className="w-5 h-5 text-app-accent" />
          )}
        </button>
      )}

      <div className="flex-shrink-0 text-app-subtle group-hover:text-app-text transition-colors pl-1">
        <ChevronRight className="w-5 h-5" />
      </div>
    </Link>
  )
}
