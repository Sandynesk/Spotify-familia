export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { OverviewGrid } from '@/components/dashboard/OverviewGrid'
import { OverviewChart } from '@/components/dashboard/OverviewChart'
import { getVisaoGeralData } from '@/lib/actions/pagamentos'
import { Skeleton } from '@/components/ui/Skeleton'

interface PageProps {
  searchParams: Promise<{ ano?: string }>
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[400px] rounded-xl" />
      <Skeleton className="h-[500px] rounded-xl" />
    </div>
  )
}

async function VisaoGeralContent({ ano }: { ano: number }) {
  const data = await getVisaoGeralData(ano)

  if (!data) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-[#535353]">Erro ao carregar dados. Recarregue a página.</p>
      </div>
    )
  }

  const { membros, pagamentos, ano: anoData } = data

  return (
    <div className="space-y-6">
      {/* Gráfico de Faturamento */}
      <OverviewChart pagamentos={pagamentos} membros={membros} ano={anoData} />

      {/* Grid de Visão Geral */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">
          Calendário de Pagamentos - {anoData}
        </h2>
        <OverviewGrid membros={membros} pagamentos={pagamentos} ano={anoData} />
      </div>
    </div>
  )
}

export default async function VisaoGeralPage({ searchParams }: PageProps) {
  const params = await searchParams
  const ano = params.ano ? parseInt(params.ano) : new Date().getFullYear()

  return (
    <>
      <Header title="Visão Geral" />
      <div className="px-4 py-5 lg:px-8 lg:py-8">
        {/* Desktop header */}
        <div className="hidden lg:block mb-8">
          <h1 className="text-3xl font-bold text-white">Visão Geral</h1>
          <p className="text-[#B3B3B3] text-sm mt-1">
            Controle visual dos pagamentos do plano família
          </p>
        </div>

        <Suspense fallback={<LoadingSkeleton />}>
          <VisaoGeralContent ano={ano} />
        </Suspense>
      </div>
    </>
  )
}
