import { Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import { createClient } from '@/lib/supabase/server'
import { getEffectiveStatus, formatShortMonthYear, formatDateTime } from '@/lib/utils/date'
import { formatCurrency } from '@/lib/utils/currency'
import type { PagamentoStatus } from '@/types/database'

async function HistoricoContent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

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
      <div className="text-center py-16">
        <p className="text-[#535353] text-sm">Nenhum pagamento ainda</p>
      </div>
    )
  }

  // Group by month
  const grouped = pagamentos.reduce<Record<string, typeof pagamentos>>((acc, p) => {
    const key = p.mes_referencia
    if (!acc[key]) acc[key] = []
    acc[key].push(p)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([mes, pags]) => (
        <section key={mes}>
          <h2 className="text-[#B3B3B3] text-xs font-semibold uppercase tracking-wider mb-3 capitalize">
            {formatShortMonthYear(mes)}
          </h2>
          <div className="bg-[#181818] rounded-lg overflow-hidden">
            {pags.map((p, i) => {
              const membro = (p as any).membros
              return (
                <div key={p.id} className={`flex items-center gap-3 px-4 py-3 ${i < pags.length - 1 ? 'border-b border-white/5' : ''}`}>
                  <Avatar nome={membro?.nome || '?'} cor={membro?.cor_avatar} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{membro?.nome || 'Membro'}</p>
                    {p.data_pagamento && (
                      <p className="text-[#535353] text-xs">pago em {formatDateTime(p.data_pagamento)}</p>
                    )}
                  </div>
                  <span className="text-white text-sm font-semibold flex-shrink-0">
                    {formatCurrency(Number(p.valor))}
                  </span>
                  <Badge status={p.status} />
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

export default function HistoricoPage() {
  return (
    <>
      <Header title="Histórico" />
      <div className="px-4 py-5 lg:px-8 lg:py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white lg:text-2xl">Histórico</h1>
          <p className="text-[#B3B3B3] text-xs mt-0.5">Todos os pagamentos registrados</p>
        </div>

        <Suspense
          fallback={
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-[#181818] rounded-lg">
                  <Skeleton className="w-8 h-8" rounded />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-20 rounded-full" />
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
