export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { DashboardMonthHeader } from '@/components/dashboard/DashboardMonthHeader'
import { DevedoresCard } from '@/components/dashboard/DevedoresCard'
import { RelatorioButton } from '@/components/relatorio/RelatorioButton'
import { DashboardCustoCard } from '@/components/dashboard/DashboardCustoCard'
import { MemberList } from '@/components/dashboard/MemberList'
import { DashboardLocalSkeleton } from '@/components/dashboard/DashboardSkeleton'
import { getDashboardData } from '@/lib/actions/pagamentos'
import { getCurrentMonthISO } from '@/lib/utils/date'

async function DashboardContent() {
  const data = await getDashboardData()

  if (!data) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-app-muted">Erro ao carregar dados. Recarregue a página.</p>
      </div>
    )
  }

  const { membros, pagamentosMes, summary, devedores, custo } = data
  const mesAtual = getCurrentMonthISO()

  return (
    <div className="space-y-6">
      {/* 1. Cabeçalho do mês com resumo e barra fina */}
      <DashboardMonthHeader
        mes={mesAtual}
        pago={summary.totalPago}
        total={summary.totalAReceber}
        progresso={summary.progresso}
      />

      {/* 2. Card "Quem está devendo" */}
      <DevedoresCard
        devedores={devedores}
        pagamentosMes={pagamentosMes}
        mesAtual={mesAtual}
      />

      {/* 3. Botão do relatório logo abaixo dos devedores */}
      <div className="flex w-full [&>button]:flex [&>button]:min-h-[44px] [&>button]:w-full [&>button]:items-center [&>button]:justify-center">
        <RelatorioButton variant="full" />
      </div>

      {/* 4. Card de custo */}
      <DashboardCustoCard custo={custo} />

      {/* 5. Lista de membros do mês (mais discreta) */}
      <MemberList
        membros={membros}
        pagamentosMes={pagamentosMes}
      />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <>
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-5 lg:px-8 lg:py-8">
        <Suspense fallback={<DashboardLocalSkeleton />}>
          <DashboardContent />
        </Suspense>
      </div>
    </>
  )
}
