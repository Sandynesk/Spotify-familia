import { Suspense } from 'react'
import Link from 'next/link'
import { Plus, Users } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { MemberCard } from '@/components/members/MemberCard'
import { ArchivedMembers } from '@/components/members/ArchivedMembers'
import { Skeleton } from '@/components/ui/Skeleton'
import { getMembros, getMembrosArquivados } from '@/lib/actions/membros'
import { getPagamentosMesAtual } from '@/lib/actions/pagamentos'
import type { Membro, Pagamento, PagamentoStatus } from '@/types/database'

export const dynamic = 'force-dynamic'

async function MembersContent() {
  const [membrosAtivos, pagamentos, membrosArquivadosRaw] = await Promise.all([
    getMembros(),
    getPagamentosMesAtual(),
    getMembrosArquivados().catch(() => [] as Membro[]),
  ])

  const membrosArquivados = membrosArquivadosRaw || []

  const pagMap = new Map(
    (pagamentos as (Pagamento & { status: PagamentoStatus })[]).map(p => [p.membro_id, p])
  )

  const statusOrder: Record<PagamentoStatus, number> = { atrasado: 0, pendente: 1, pago: 2 }
  const sorted = [...membrosAtivos].sort((a, b) => {
    const sA = pagMap.get(a.id)?.status ?? 'pendente'
    const sB = pagMap.get(b.id)?.status ?? 'pendente'
    if (statusOrder[sA] !== statusOrder[sB]) {
      return statusOrder[sA] - statusOrder[sB]
    }
    return a.nome.localeCompare(b.nome)
  })

  return (
    <div className="space-y-6">
      {/* Lista de membros ativos */}
      {sorted.length === 0 ? (
        <div className="rounded-[var(--radius-app)] border border-app-line bg-app-surface p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-app-elevated flex items-center justify-center mx-auto mb-3 text-app-subtle">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-app-text font-medium text-base mb-1">Nenhum membro ativo no momento</p>
          <p className="text-app-muted text-sm mb-6 max-w-sm mx-auto">
            Cadastre os membros da sua família para acompanhar e organizar os pagamentos mensais.
          </p>
          <Link
            href="/membros/novo"
            className="inline-flex items-center gap-2 px-6 min-h-[48px] bg-app-accent hover:bg-app-accent-hover text-black font-semibold text-sm rounded-full transition-all duration-200 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar primeiro membro</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sorted.map(membro => (
            <MemberCard
              key={membro.id}
              membro={membro}
              pagamento={pagMap.get(membro.id) || null}
            />
          ))}
        </div>
      )}

      {/* Seção Arquivados (N) */}
      {membrosArquivados.length > 0 && (
        <div className="pt-2">
          <ArchivedMembers membros={membrosArquivados} />
        </div>
      )}
    </div>
  )
}

function MembersLoadingSkeleton() {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3.5 p-4 rounded-[var(--radius-app)] border border-app-line bg-app-surface min-h-[64px]"
        >
          <Skeleton className="w-10 h-10" rounded />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-48" />
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function MembrosPage() {
  return (
    <>
      <Header title="Membros" />

      <div className="px-4 py-5 lg:px-8 lg:py-8 max-w-3xl mx-auto lg:mx-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight text-app-text">
              Membros
            </h1>
            <p className="text-app-muted text-sm mt-0.5">
              Pessoas que dividem o plano Spotify com você
            </p>
          </div>
          <Link
            href="/membros/novo"
            className="flex items-center gap-2 px-5 min-h-[44px] bg-app-accent hover:bg-app-accent-hover text-black font-semibold text-sm rounded-full transition-all duration-200 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar</span>
          </Link>
        </div>

        <Suspense fallback={<MembersLoadingSkeleton />}>
          <MembersContent />
        </Suspense>
      </div>
    </>
  )
}
