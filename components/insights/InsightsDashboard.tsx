import type { Membro, Pagamento } from '@/types/database'
import type { ItemSerieMensal, PrevisaoMensal, ItemRanking } from '@/lib/domain/insights'
import type { Selo } from '@/types/domain'
import { EmptyState } from '@/components/ui/EmptyState'
import { OverviewChart } from '@/components/dashboard/OverviewChart'
import { OverviewGrid } from '@/components/dashboard/OverviewGrid'
import { InsightsSummary } from '@/components/insights/InsightsSummary'
import {
  InsightsForecast,
  InsightsRanking,
  RetrospectiveInvite,
} from '@/components/insights/InsightsSections'
import Link from 'next/link'
import { UserPlus } from 'lucide-react'

export interface RankedMember extends ItemRanking {
  selos: Selo[]
  pagamentosAnalisados: number
}

interface InsightsDashboardProps {
  ano: number
  membros: Membro[]
  pagamentos: Pagamento[]
  serie: ItemSerieMensal[]
  valorPlano: number
  saldo: number
  arrecadado: number
  taxaRecebimento: number
  tempoMedio: number | null
  mesesFechados: number
  emAbertoAgora: number
  ranking: RankedMember[]
  previsao: PrevisaoMensal[]
}

export function InsightsDashboard({
  ano,
  membros,
  pagamentos,
  serie,
  valorPlano,
  saldo,
  arrecadado,
  taxaRecebimento,
  tempoMedio,
  mesesFechados,
  emAbertoAgora,
  ranking,
  previsao,
}: InsightsDashboardProps) {
  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      <InsightsSummary
        ano={ano}
        saldo={saldo}
        arrecadado={arrecadado}
        valorPlano={valorPlano}
        taxaRecebimento={taxaRecebimento}
        tempoMedio={tempoMedio}
        mesesFechados={mesesFechados}
        emAbertoAgora={emAbertoAgora}
      />

      {membros.length === 0 ? (
        <EmptyState
          title="Seu plano ainda não tem membros"
          description="Adicione as pessoas que dividem o plano para acompanhar pagamentos, previsões e pontualidade por aqui."
          icon={<UserPlus />}
          action={
            <Link href="/membros/novo" className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-app-accent px-5 text-sm font-semibold text-app-accent-ink transition-colors hover:bg-app-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent">
              <UserPlus aria-hidden className="h-4 w-4" />
              Adicionar membro
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-12 min-w-0 max-w-full">
            <div className="min-w-0 xl:col-span-7">
              <OverviewChart data={serie} ano={ano} valorPlano={valorPlano} />
            </div>
            <div className="min-w-0 xl:col-span-5">
              <InsightsForecast previsao={previsao} />
            </div>
          </div>

          <div className="w-full max-w-full min-w-0">
            <OverviewGrid membros={membros} pagamentos={pagamentos} ano={ano} />
          </div>

          <div className="grid gap-4 xl:grid-cols-12 min-w-0 max-w-full">
            <div className="min-w-0 xl:col-span-7">
              <InsightsRanking ranking={ranking} />
            </div>
            <div className="min-w-0 xl:col-span-5">
              <RetrospectiveInvite ano={ano} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
