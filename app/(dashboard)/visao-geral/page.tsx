export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import Link from 'next/link'
import { Users, UserPlus, AlertCircle, RotateCcw } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { OverviewGrid } from '@/components/dashboard/OverviewGrid'
import { OverviewChart } from '@/components/dashboard/OverviewChart'
import { OverviewYearSwitcher } from '@/components/dashboard/OverviewYearSwitcher'
import { Skeleton } from '@/components/ui/Skeleton'
import { getVisaoGeralData } from '@/lib/actions/pagamentos'

interface PageProps {
  searchParams: Promise<{ ano?: string }>
}

function parseAndValidateAno(rawAno?: string): number {
  const currentYear = new Date().getFullYear()
  if (!rawAno) return currentYear

  const trimmed = rawAno.trim()
  // Validar se é número inteiro (sem decimais ou caracteres estranhos)
  if (!/^\d+$/.test(trimmed)) return currentYear

  const parsed = parseInt(trimmed, 10)
  if (isNaN(parsed) || parsed < 2000 || parsed > currentYear + 1) {
    return currentYear
  }

  return parsed
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-6 w-44 rounded-[var(--radius-app-sm)]" />
          <Skeleton className="h-4 w-60 rounded-[var(--radius-app-sm)]" />
        </div>
        <Skeleton className="h-12 w-44 rounded-[var(--radius-app)]" />
      </div>

      <Skeleton className="h-12 w-full rounded-[var(--radius-app)]" />

      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-44 w-full rounded-[var(--radius-app)]" />
        ))}
      </div>

      <Skeleton className="h-72 w-full rounded-[var(--radius-app)]" />
    </div>
  )
}

function ErrorState({ ano }: { ano: number }) {
  return (
    <div className="rounded-[var(--radius-app)] border border-app-line bg-app-surface p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-app-danger/10 text-app-danger mb-4">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-app-text mb-1">
        Não foi possível carregar os dados de {ano}
      </h3>
      <p className="text-sm text-app-muted max-w-md mx-auto mb-6">
        Ocorreu uma falha ao buscar os pagamentos do plano. Recarregue a página para tentar novamente.
      </p>
      <Link
        href={`/visao-geral?ano=${ano}`}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-app-elevated hover:bg-app-elevated/80 text-app-text font-medium text-sm transition-colors border border-app-line"
      >
        <RotateCcw className="h-4 w-4" />
        Recarregar
      </Link>
    </div>
  )
}

function EmptyMembersState() {
  return (
    <div className="rounded-[var(--radius-app)] border border-app-line bg-app-surface p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-app-elevated text-app-muted mb-4">
        <Users className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-app-text mb-1">
        Nenhum membro ativo cadastrado
      </h3>
      <p className="text-sm text-app-muted max-w-md mx-auto mb-6">
        Cadastre os membros do seu Plano Família para acompanhar o calendário anual de pagamentos.
      </p>
      <Link
        href="/membros/novo"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-app-accent hover:bg-app-accent-hover text-black font-semibold text-sm transition-transform active:scale-95"
      >
        <UserPlus className="h-4 w-4" />
        Adicionar membro
      </Link>
    </div>
  )
}

async function VisaoGeralContent({ ano }: { ano: number }) {
  const data = await getVisaoGeralData(ano)

  if (!data) {
    return <ErrorState ano={ano} />
  }

  const { membros, pagamentos, ano: anoData } = data

  if (membros.length === 0) {
    return (
      <div className="space-y-6">
        <OverviewYearSwitcher ano={anoData} />
        <EmptyMembersState />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Seletor de Ano no Topo */}
      <OverviewYearSwitcher ano={anoData} />

      {/* No celular: grid/cards de membros vem primeiro, gráfico depois.
          No desktop: gráfico vem primeiro, tabela de membros depois. */}
      <div className="flex flex-col gap-6">
        <div className="order-1 lg:order-2">
          <OverviewGrid membros={membros} pagamentos={pagamentos} ano={anoData} />
        </div>

        <div className="order-2 lg:order-1">
          <OverviewChart pagamentos={pagamentos} membros={membros} ano={anoData} />
        </div>
      </div>
    </div>
  )
}

export default async function VisaoGeralPage({ searchParams }: PageProps) {
  const params = await searchParams
  const ano = parseAndValidateAno(params.ano)

  return (
    <>
      <Header title="Visão Geral" />
      <div className="px-4 py-5 lg:px-8 lg:py-8 font-app">
        {/* Desktop Header */}
        <div className="hidden lg:block mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-app-text">
            Visão Geral
          </h1>
          <p className="text-app-muted text-sm mt-1">
            Controle visual e gestão de pagamentos do ano
          </p>
        </div>

        <Suspense fallback={<LoadingSkeleton />}>
          <VisaoGeralContent ano={ano} />
        </Suspense>
      </div>
    </>
  )
}
