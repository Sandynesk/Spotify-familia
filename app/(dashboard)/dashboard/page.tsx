export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { AlertCircle, RotateCcw } from 'lucide-react'
import { getHojeData } from '@/lib/actions/hoje'
import { HojeDashboard } from '@/components/hoje/HojeDashboard'

function DashboardLoadError() {
  return (
    <div className="mx-auto max-w-xl rounded-app border border-app-line bg-app-surface px-6 py-10 text-center">
      <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-app-danger/10 text-app-danger">
        <AlertCircle aria-hidden className="h-6 w-6" />
      </span>
      <h2 className="text-lg font-semibold text-app-text">Não foi possível carregar o Hoje</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-app-muted">
        Tente novamente para atualizar os pagamentos do mês.
      </p>
      <Link
        href="/dashboard"
        className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-app-elevated px-5 text-sm font-medium text-app-text transition-colors hover:bg-app-raised"
      >
        <RotateCcw aria-hidden className="h-4 w-4" />
        Tentar de novo
      </Link>
    </div>
  )
}

export default async function DashboardPage() {
  const data = await getHojeData()
  if (!data) return <DashboardLoadError />

  return (
    <HojeDashboard
      key={`${data.monthISO}-${data.pagamentosMes.map((payment) => `${payment.id}:${payment.status}:${payment.data_pagamento ?? ''}`).join('|')}`}
      membros={data.membros}
      pagamentosMes={data.pagamentosMes}
      summary={data.summary}
      devedores={data.devedores}
      custo={data.custo}
      saldo={data.balance}
      agenda={data.agenda}
      monthISO={data.monthISO}
      monthTitle={data.monthTitle}
      todayISO={data.todayISO}
      greeting={data.greeting}
    />
  )
}
