import { Suspense } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { MemberRow } from '@/components/dashboard/MemberRow'
import { MemberRowSkeleton } from '@/components/ui/Skeleton'
import { getMembros } from '@/lib/actions/membros'
import { getPagamentosMesAtual } from '@/lib/actions/pagamentos'
import type { Pagamento, PagamentoStatus } from '@/types/database'

async function MembersContent() {
  const [membros, pagamentos] = await Promise.all([
    getMembros(),
    getPagamentosMesAtual(),
  ])

  const pagMap = new Map(
    (pagamentos as (Pagamento & { status: PagamentoStatus })[]).map(p => [p.membro_id, p])
  )

  const statusOrder: Record<PagamentoStatus, number> = { atrasado: 0, pendente: 1, pago: 2 }
  const sorted = [...membros].sort((a, b) => {
    const sA = pagMap.get(a.id)?.status ?? 'pendente'
    const sB = pagMap.get(b.id)?.status ?? 'pendente'
    return statusOrder[sA] - statusOrder[sB]
  })

  if (sorted.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-[#535353] text-sm mb-4">Nenhum membro cadastrado</p>
        <Link
          href="/membros/novo"
          className="px-6 py-2.5 bg-[#1DB954] text-black font-bold text-sm rounded-full transition-all hover:bg-[#1ed760] active:scale-[0.97]"
        >
          Adicionar membro
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {sorted.map(membro => (
        <MemberRow
          key={membro.id}
          membro={membro}
          pagamento={pagMap.get(membro.id) || null}
        />
      ))}
    </div>
  )
}

export default function MembrosPage() {
  return (
    <>
      <Header title="Membros" />
      <div className="px-4 py-5 lg:px-8 lg:py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white lg:text-2xl">Membros</h1>
            <p className="text-[#B3B3B3] text-xs mt-0.5">Todos os membros do seu plano</p>
          </div>
          <Link
            href="/membros/novo"
            className="hidden lg:flex items-center gap-2 px-4 py-2 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-sm rounded-full transition-all active:scale-[0.97]"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <MemberRowSkeleton key={i} />)}
            </div>
          }
        >
          <MembersContent />
        </Suspense>
      </div>
    </>
  )
}
