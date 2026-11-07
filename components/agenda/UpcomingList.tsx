import Link from 'next/link'
import { ArrowUpRight, CalendarClock } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/Badge'
import type { AgendaDue } from '@/lib/actions/agenda'
import { formatCurrency } from '@/lib/utils/currency'

function parseLocalDate(value: string) {
  return new Date(`${value}T12:00:00`)
}

function daysFromToday(value: string, today: string) {
  return Math.round((parseLocalDate(value).getTime() - parseLocalDate(today).getTime()) / 86_400_000)
}

function countdown(value: string, today: string) {
  const days = daysFromToday(value, today)
  if (days === 0) return 'vence hoje'
  if (days === 1) return 'amanhã'
  if (days > 1) return `em ${days} dias`
  const late = Math.abs(days)
  return late === 1 ? 'atrasado há 1 dia' : `atrasado há ${late} dias`
}

function weekLabel(value: string, today: string) {
  const startOfWeek = (date: Date) => {
    const monday = new Date(date)
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
    return monday
  }
  const days = Math.round((startOfWeek(parseLocalDate(value)).getTime() - startOfWeek(parseLocalDate(today)).getTime()) / 86_400_000)
  const week = Math.max(0, Math.round(days / 7))
  if (week === 0) return 'Esta semana'
  if (week === 1) return 'Próxima semana'
  return `Em ${week} semanas`
}

export function UpcomingList({ upcoming, today, hasMembers }: { upcoming: AgendaDue[]; today: string; hasMembers: boolean }) {
  const visible = upcoming.filter((item) => item.dataVencimento >= today)
  const groups = Array.from(new Set(visible.map((item) => weekLabel(item.dataVencimento, today))))

  return (
    <Card padding="md" className="h-fit">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-app-text">Próximos 30 dias</h2>
          <p className="mt-1 text-sm text-app-muted">{visible.length} {visible.length === 1 ? 'vencimento' : 'vencimentos'}</p>
        </div>
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-app-xs bg-app-elevated text-app-accent">
          <CalendarClock aria-hidden className="h-5 w-5" />
        </span>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="Tudo tranquilo por aqui"
          description={upcoming.length ? 'Os vencimentos em aberto já passaram da data. Veja-os no calendário do mês.' : 'Nenhum vencimento nos próximos 30 dias.'}
          className="px-4 py-7"
          action={!hasMembers ? <Link href="/membros/novo" className="inline-flex min-h-11 items-center justify-center rounded-full bg-app-accent px-5 text-sm font-semibold text-app-accent-ink">Adicionar membro</Link> : undefined}
        />
      ) : (
        <div className="space-y-5">
          {groups.map((group) => (
            <section key={group}>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-app-subtle">{group}</h3>
              <div className="space-y-2">
                {visible.filter((item) => weekLabel(item.dataVencimento, today) === group).map((item) => (
                  <div key={`${item.membroId}-${item.mesReferencia}`} className="rounded-app-sm border border-app-line bg-app-elevated/40 p-3">
                    <div className="flex items-center gap-3">
                      <Avatar nome={item.nome} cor={item.cor_avatar} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-app-text">{item.nome}</p>
                        <p className="mt-0.5 text-xs text-app-muted">{countdown(item.dataVencimento, today)}</p>
                      </div>
                      <div className="text-right">
                        <p className="tabular text-sm font-semibold text-app-text">{formatCurrency(item.valor)}</p>
                        <StatusBadge status={item.status} className="mt-1" />
                      </div>
                    </div>
                    <Link
                      href={`/cobrar?membro=${encodeURIComponent(item.membroId)}`}
                      className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full bg-app-elevated px-4 text-sm font-semibold text-app-text transition-colors hover:bg-app-raised"
                    >
                      Cobrar <ArrowUpRight aria-hidden className="h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </Card>
  )
}
