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
      <div className="flex flex-col items-center justify-center py-16 text-center">
        {/* Illustration */}
        <div className="relative w-24 h-24 mb-6">
          <div className="w-24 h-24 bg-[#181818] rounded-full flex items-center justify-center">
            <UserPlus className="w-10 h-10 text-[#535353]" />
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 bg-[#1DB954] rounded-full flex items-center justify-center">
            <span className="text-black font-bold text-lg">+</span>
          </div>
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">Nenhum membro ainda</h3>
        <p className="text-[#535353] text-sm max-w-xs leading-relaxed">
          Adicione os membros do seu Plano Família para começar a controlar os pagamentos.
        </p>
        <Link
          href="/membros/novo"
          className="
            mt-6 px-6 py-2.5 bg-[#1DB954] hover:bg-[#1ed760]
            text-black font-bold text-sm rounded-full
            transition-all duration-200 active:scale-[0.97]
          "
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
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white font-semibold">Membros</h2>
        <Link
          href="/membros"
          className="text-xs text-[#1DB954] hover:text-[#1ed760] transition-colors"
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
