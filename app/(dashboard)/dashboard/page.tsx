export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { ProgressBar } from '@/components/dashboard/ProgressBar'
import { MemberList } from '@/components/dashboard/MemberList'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { getDashboardData } from '@/lib/actions/pagamentos'
import { getCurrentMonthISO } from '@/lib/utils/date'

async function DashboardContent() {
  const data = await getDashboardData()

  if (!data) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-[#535353]">Erro ao carregar dados. Recarregue a página.</p>
      </div>
    )
  }

  const { membros, pagamentosMes, summary } = data
  const mesAtual = getCurrentMonthISO()

  return (
    <div className="space-y-5">
      <SummaryCards summary={summary} />

      <ProgressBar
        mes={mesAtual}
        pago={summary.totalPago}
        total={summary.totalAReceber}
        progresso={summary.progresso}
      />

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
      <div className="px-4 py-5 lg:px-8 lg:py-8">
        {/* Desktop header */}
        <div className="hidden lg:block mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-[#B3B3B3] text-sm mt-1">Visão geral do seu Plano Família</p>
        </div>

        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent />
        </Suspense>
      </div>
    </>
  )
}
