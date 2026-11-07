'use client'

import { useTransition } from 'react'
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

  const status = pagamento?.status ?? 'pendente'

  function handleMarcarPago(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!pagamento) return

    startTransition(async () => {
      const result = await marcarPago(pagamento.id)
      if (result?.error) error('Erro ao marcar como pago')
      else success(`${membro.nome} marcado como pago!`)
    })
  }

  return (
    <Link
      href={`/membros/${membro.id}`}
      className="group flex min-h-[44px] items-center gap-3 rounded-[var(--radius-app-sm)] border border-app-line bg-app-surface p-3.5 transition-colors hover:bg-app-elevated sm:p-4"
    >
      <Avatar nome={membro.nome} cor={membro.cor_avatar} size="md" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-app-text">{membro.nome}</p>
        {membro.email && (
          <p className="mt-0.5 truncate text-xs text-app-muted">{membro.email}</p>
        )}
      </div>

      <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
        <span className="text-sm font-semibold tabular-nums text-app-text">
          {formatCurrency(Number(pagamento ? pagamento.valor : membro.valor_mensal))}
        </span>
        <Badge status={status} />
      </div>

      {(status === 'pendente' || status === 'atrasado') && pagamento && (
        <button
          onClick={handleMarcarPago}
          disabled={pending}
          className="ml-1 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-app-accent/15 text-app-accent transition-all duration-200 hover:bg-app-accent/25 active:scale-95 disabled:opacity-50"
          aria-label={`Marcar ${membro.nome} como pago`}
        >
          {pending ? (
            <div className="h-4 w-4 rounded-full border-2 border-app-accent/40 border-t-app-accent animate-spin" />
          ) : (
            <CheckCircle className="h-5 w-5 text-app-accent" />
          )}
        </button>
      )}

      <ChevronRight className="h-4 w-4 flex-shrink-0 text-app-subtle transition-colors group-hover:text-app-muted" />
    </Link>
  )
}
