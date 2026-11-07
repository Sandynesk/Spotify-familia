import { Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import { createClient } from '@/lib/supabase/server'
import { getEffectiveStatus, formatShortMonthYear, formatDateTime } from '@/lib/utils/date'
import { formatCurrency } from '@/lib/utils/currency'
import { garantirPagamentos } from '@/lib/utils/payments'
import type { Membro, PagamentoStatus } from '@/types/database'

export const dynamic = 'force-dynamic'

async function HistoricoContent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  await garantirPagamentos(supabase, user.id)

  const { data } = await supabase
    .from('pagamentos')
    .select(`
      *,
      membros!inner(user_id, nome, cor_avatar)
    `)
    .eq('membros.user_id', user.id)
    .order('mes_referencia', { ascending: false })
    .limit(100)

  const pagamentos = (data || []).map(p => ({
    ...p,
    status: getEffectiveStatus(p.mes_referencia, p.status) as PagamentoStatus,
  }))

  if (pagamentos.length === 0) {
    return (
      <div className="rounded-[var(--radius-app)] border border-app-line bg-app-surface py-12 px-4 text-center">
        <p className="text-sm font-medium text-app-text">Nenhum pagamento registrado ainda</p>
        <p className="text-xs text-app-muted mt-1">
          Os pagamentos são gerados automaticamente a cada mês para os membros ativos.
        </p>
      </div>
    )
  }

  // Agrupar por mês
  const grouped = pagamentos.reduce<Record<string, typeof pagamentos>>((acc, p) => {
    const key = p.mes_referencia
    if (!acc[key]) acc[key] = []
    acc[key].push(p)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([mes, pags]) => {
        const totalPagoMes = pags
          .filter(p => p.status === 'pago')
          .reduce((acc, p) => acc + Number(p.valor), 0)

        return (
          <section key={mes} className="relative">
            {/* Cabeçalho de mês fixo (sticky) ao rolar */}
            <div className="sticky top-14 lg:top-0 z-10 -mx-4 px-4 lg:-mx-8 lg:px-8 py-2.5 bg-app-bg/90 backdrop-blur-md border-b border-app-line/40 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-app-muted capitalize">
                {formatShortMonthYear(mes)}
              </h2>
              <span className="text-xs font-medium text-app-muted tabular-nums">
                Total pago: <span className="font-semibold text-app-accent">{formatCurrency(totalPagoMes)}</span>
              </span>
            </div>

            {/* Linhas compactas */}
            <div className="mt-2.5 rounded-[var(--radius-app)] border border-app-line bg-app-surface divide-y divide-app-line overflow-hidden">
              {pags.map(p => {
                const membro = p.membros as Pick<Membro, 'nome' | 'cor_avatar'> | null
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 transition-colors hover:bg-app-elevated/40"
                  >
                    <Avatar nome={membro?.nome || '?'} cor={membro?.cor_avatar} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-app-text truncate">
                        {membro?.nome || 'Membro'}
                      </p>
                      {p.data_pagamento ? (
                        <p className="text-xs text-app-subtle">
                          pago em {formatDateTime(p.data_pagamento)}
                        </p>
                      ) : (
                        <p className="text-xs text-app-subtle capitalize">
                          {p.status}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      <span className="text-sm font-semibold text-app-text tabular-nums">
                        {formatCurrency(Number(p.valor))}
                      </span>
                      <Badge status={p.status} />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export default function HistoricoPage() {
  return (
    <>
      <Header title="Histórico" />
      <div className="px-4 py-5 lg:px-8 lg:py-8 max-w-3xl">
        <div className="hidden lg:block mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-app-text">Histórico</h1>
          <p className="text-app-muted text-sm mt-1">Todos os pagamentos registrados</p>
        </div>

        <Suspense
          fallback={
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, groupIdx) => (
                <div key={groupIdx} className="space-y-2">
                  <div className="flex justify-between items-center py-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="rounded-[var(--radius-app)] border border-app-line bg-app-surface divide-y divide-app-line overflow-hidden">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          }
        >
          <HistoricoContent />
        </Suspense>
      </div>
    </>
  )
}
