import Link from 'next/link'
import { UserPlus } from 'lucide-react'
import { MemberRow } from './MemberRow'
import type { Membro, Pagamento, PagamentoStatus } from '@/types/database'

interface MemberListProps {
  membros: Membro[]
  pagamentosMes: (Pagamento & { status: PagamentoStatus })[]
}

const statusOrder: Record<PagamentoStatus, number> = {
  atrasado: 0,
  pendente: 1,
  pago:     2,
}

export function MemberList({ membros, pagamentosMes }: MemberListProps) {
  if (membros.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[var(--radius-app)] border border-app-line bg-app-surface px-4 py-12 text-center">
        {/* Illustration */}
        <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-app-elevated">
          <UserPlus className="h-7 w-7 text-app-muted" />
          <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-app-accent text-xs font-bold text-black">
            +
          </div>
        </div>
        <h3 className="mb-1 text-base font-semibold text-app-text">Nenhum membro ainda</h3>
        <p className="max-w-xs text-xs leading-relaxed text-app-muted">
          Adicione os membros do seu Plano Família para começar a controlar os pagamentos.
        </p>
        <Link
          href="/membros/novo"
          className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-full bg-app-accent px-5 py-2.5 text-xs font-semibold text-black transition-all hover:bg-app-accent-hover active:scale-[0.97]"
        >
          Adicionar primeiro membro
        </Link>
      </div>
    )
  }

  // Criar mapa de pagamentos por membro
  const pagMap = new Map(pagamentosMes.map(p => [p.membro_id, p]))

  // Ordenar: atrasado → pendente → pago
  const sorted = [...membros].sort((a, b) => {
    const sA = pagMap.get(a.id)?.status ?? 'pendente'
    const sB = pagMap.get(b.id)?.status ?? 'pendente'
    return statusOrder[sA] - statusOrder[sB]
  })

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight text-app-text">Membros</h2>
        <Link
          href="/membros"
          className="inline-flex min-h-[44px] items-center text-xs font-medium text-app-accent transition-colors hover:text-app-accent-hover"
        >
          Ver todos
        </Link>
      </div>

      <div className="space-y-2">
        {sorted.map(membro => (
          <MemberRow
            key={membro.id}
            membro={membro}
            pagamento={pagMap.get(membro.id) || null}
          />
        ))}
      </div>
    </section>
  )
}
