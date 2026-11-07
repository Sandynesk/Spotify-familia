import Link from 'next/link'
import {
  Award,
  BookOpenCheck,
  CalendarDays,
  Check,
  Crown,
  Medal,
  Sparkles,
  Target,
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Card, SectionHeader } from '@/components/ui'
import { formatCurrency } from '@/lib/utils/currency'
import { formatMonthYear } from '@/lib/utils/date'
import type { PrevisaoMensal } from '@/lib/domain/insights'
import type { RankedMember } from '@/components/insights/InsightsDashboard'

export function InsightsForecast({ previsao }: { previsao: PrevisaoMensal[] }) {
  return (
    <Card padding="md" className="h-full">
      <SectionHeader title="Previsão" description="O valor contratado para os próximos meses" />
      <div className="mt-4 divide-y divide-app-line">
        {previsao.map(item => (
          <div key={item.mesReferencia} className="flex min-h-16 items-center justify-between gap-3 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-app-xs bg-app-elevated text-app-muted">
                <CalendarDays aria-hidden className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium capitalize text-app-text">{formatMonthYear(item.mesReferencia)}</p>
                <p className="text-xs text-app-muted">{item.membros} {item.membros === 1 ? 'membro' : 'membros'}</p>
              </div>
            </div>
            <p className="shrink-0 text-sm font-semibold tabular text-app-text">{formatCurrency(item.previsto)}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-app-subtle">Estimativa baseada nos valores mensais cadastrados.</p>
    </Card>
  )
}

export function InsightsRanking({ ranking }: { ranking: RankedMember[] }) {
  const comHistorico = ranking.filter(item => item.pagamentosPagos > 0)
  const podio = comHistorico.slice(0, 3)
  const podioIds = new Set(podio.map(item => item.membroId))
  const demais = ranking.filter(item => !podioIds.has(item.membroId))

  return (
    <Card padding="md" className="h-full">
      <SectionHeader title="Pontualidade" description="Quem costuma pagar no prazo" />

      {podio.length > 0 ? (
        <div className="mt-5 grid grid-cols-3 items-end gap-2 sm:gap-3">
          {[podio[1], podio[0], podio[2]].map((item, position) => {
            if (!item) return <div key={`empty-${position}`} aria-hidden="true" />
            const rank = podio.indexOf(item) + 1
            const RankIcon = rank === 1 ? Crown : rank === 2 ? Medal : Award
            const height = rank === 1 ? 'min-h-40' : rank === 2 ? 'min-h-32' : 'min-h-28'

            return (
              <Link
                key={item.membroId}
                href={`/membros/${item.membroId}`}
                className={`flex ${height} min-w-0 flex-col items-center justify-end rounded-app-sm border border-app-line bg-app-elevated/55 px-2 py-3 text-center transition-colors hover:bg-app-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent`}
              >
                <RankIcon aria-hidden className={`mb-2 h-4 w-4 ${rank === 1 ? 'text-app-warn' : 'text-app-muted'}`} />
                <Avatar nome={item.nome} size="sm" />
                <span className="mt-2 w-full truncate text-xs font-semibold text-app-text">{item.nome}</span>
                <span className="mt-1 text-lg font-semibold tabular text-app-accent">{item.scorePontualidade}</span>
                <span className="text-[10px] text-app-subtle">{rank}º lugar</span>
              </Link>
            )
          })}
        </div>
      ) : (
        <p className="mt-5 rounded-app-sm bg-app-elevated/50 p-4 text-sm text-app-muted">
          O ranking aparece quando alguém registrar o primeiro pagamento.
        </p>
      )}

      {demais.length > 0 && (
        <div className="mt-4 divide-y divide-app-line border-t border-app-line">
          {demais.map((item, index) => (
            <Link key={item.membroId} href={`/membros/${item.membroId}`} className="flex min-h-14 items-center gap-3 py-2.5">
              <span className="w-5 text-center text-xs tabular text-app-subtle">{podio.length + index + 1}</span>
              <Avatar nome={item.nome} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-app-text">{item.nome}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {item.selos.slice(0, 2).map(selo => <Seal key={selo.id} label={selo.titulo} />)}
                  {item.selos.length === 0 && <span className="text-[11px] text-app-subtle">Sem selo ainda</span>}
                </div>
              </div>
              <span className="shrink-0 text-sm font-semibold tabular text-app-text">{item.scorePontualidade}</span>
            </Link>
          ))}
        </div>
      )}

      {podio.some(item => item.selos.length > 0) && (
        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-app-line pt-3">
          {Array.from(new Map(podio.flatMap(item => item.selos.map(selo => [selo.id, selo.titulo] as const))).values()).slice(0, 4).map(label => (
            <Seal key={label} label={label} />
          ))}
        </div>
      )}
    </Card>
  )
}

export function RetrospectiveInvite({ ano }: { ano: number }) {
  return (
    <Card padding="md" className="flex h-full flex-col justify-between gap-5 border-app-line-strong">
      <div>
        <span className="flex h-10 w-10 items-center justify-center rounded-app-xs bg-app-accent/10 text-app-accent">
          <Sparkles aria-hidden className="h-5 w-5" />
        </span>
        <p className="mt-4 text-xs font-medium uppercase tracking-[0.08em] text-app-subtle">Fechamento do ano</p>
        <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-app-text">
          Sua retrospectiva de {ano} está pronta
        </h2>
        <p className="mt-2 text-sm text-app-muted">
          Reveja os momentos do plano, os meses mais fortes e quem manteve a sequência.
        </p>
      </div>
      <Link
        href={`/retrospectiva?ano=${ano}`}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-app-elevated px-5 text-sm font-semibold text-app-text transition-colors hover:bg-app-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent"
      >
        <BookOpenCheck aria-hidden className="h-4 w-4" />
        Abrir retrospectiva
      </Link>
    </Card>
  )
}

function Seal({ label }: { label: string }) {
  const Icon = label === 'Pontual' ? Target : label === 'Em dia' ? Check : Award
  return (
    <span className="inline-flex min-h-6 items-center gap-1 rounded-full bg-app-elevated px-2 text-[11px] font-medium text-app-muted">
      <Icon aria-hidden className="h-3 w-3 text-app-accent" />
      {label}
    </span>
  )
}
