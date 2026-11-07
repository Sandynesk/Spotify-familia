'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Archive, CalendarDays, CircleAlert, CircleCheck, UserRoundPlus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { NumberTicker } from '@/components/ui/NumberTicker'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import type { HistoricoMember } from '@/lib/actions/agenda'
import type { EventoAtividade } from '@/types/domain'
import { formatCurrency } from '@/lib/utils/currency'

type EventFilter = 'tudo' | 'pagamentos' | 'membros'
type PeriodFilter = '30' | '90' | '365' | 'all'

const eventKinds: Record<EventoAtividade['tipo'], { icon: LucideIcon; style: string }> = {
  pagou: { icon: CircleCheck, style: 'bg-app-accent/12 text-app-accent' },
  atrasou: { icon: CircleAlert, style: 'bg-app-danger/12 text-app-danger' },
  entrou: { icon: UserRoundPlus, style: 'bg-app-info/12 text-app-info' },
  arquivado: { icon: Archive, style: 'bg-app-elevated text-app-muted' },
}

function dateKey(value: string) {
  const date = new Date(value)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function dayHeading(value: string, today: string) {
  if (value === today) return 'Hoje'
  const yesterday = new Date(`${today}T12:00:00`)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
  if (value === yesterdayKey) return 'Ontem'
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long' }).format(new Date(`${value}T12:00:00`))
}

function periodStart(period: PeriodFilter, today: string) {
  if (period === 'all') return null
  const date = new Date(`${today}T12:00:00`)
  if (period === '30') date.setDate(date.getDate() - 29)
  else if (period === '90') date.setMonth(date.getMonth() - 3)
  else date.setFullYear(date.getFullYear() - 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function monthName(reference?: string) {
  if (!reference) return 'o mês'
  return new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(`${reference.slice(0, 7)}-01T12:00:00`))
}

function dueTiming(event: EventoAtividade, member?: HistoricoMember) {
  if (!member || !event.mesReferencia) return 'pagamento registrado'
  const [year, month] = event.mesReferencia.slice(0, 7).split('-').map(Number)
  const dueDay = Math.min(member.dia_vencimento, new Date(year, month, 0).getDate())
  const dueDate = new Date(year, month - 1, dueDay, 12)
  const paidAt = new Date(event.data)
  const paidDate = new Date(paidAt.getFullYear(), paidAt.getMonth(), paidAt.getDate(), 12)
  const days = Math.round((dueDate.getTime() - paidDate.getTime()) / 86_400_000)
  if (days === 0) return 'no dia do vencimento'
  if (days === 1) return '1 dia antes do vencimento'
  if (days > 1) return `${days} dias antes do vencimento`
  if (days === -1) return '1 dia depois do vencimento'
  return `${Math.abs(days)} dias depois do vencimento`
}

function eventText(event: EventoAtividade, member?: HistoricoMember) {
  if (event.tipo === 'pagou') {
    return <><strong className="font-semibold text-app-text">{event.membro}</strong> pagou {monthName(event.mesReferencia)} · {formatCurrency(event.valor ?? 0)} · {dueTiming(event, member)}</>
  }
  if (event.tipo === 'atrasou') {
    return <><strong className="font-semibold text-app-text">{event.membro}</strong> ficou com {monthName(event.mesReferencia)} em atraso{event.valor == null ? '' : ` · ${formatCurrency(event.valor)}`}</>
  }
  if (event.tipo === 'entrou') {
    return <><strong className="font-semibold text-app-text">{event.membro}</strong> entrou no plano</>
  }
  return <><strong className="font-semibold text-app-text">{event.membro}</strong> saiu do plano</>
}

export function Timeline({
  events,
  members,
  today,
}: {
  events: EventoAtividade[]
  members: HistoricoMember[]
  today: string
}) {
  const [kind, setKind] = useState<EventFilter>('tudo')
  const [memberId, setMemberId] = useState<string | null>(null)
  const [period, setPeriod] = useState<PeriodFilter>('90')
  const [limit, setLimit] = useState(20)
  const start = periodStart(period, today)
  const filtered = events.filter((event) => {
    const date = dateKey(event.data)
    if (start && date < start) return false
    if (memberId && event.membroId !== memberId) return false
    if (kind === 'pagamentos' && event.tipo !== 'pagou' && event.tipo !== 'atrasou') return false
    if (kind === 'membros' && event.tipo !== 'entrou' && event.tipo !== 'arquivado') return false
    return true
  })
  const visible = filtered.slice(0, limit)
  const dayKeys = Array.from(new Set(visible.map((event) => dateKey(event.data))))
  const totalRecebido = filtered.filter((event) => event.tipo === 'pagou').reduce((sum, event) => sum + Number(event.valor ?? 0), 0)
  const pagamentos = filtered.filter((event) => event.tipo === 'pagou').length

  function updateKind(value: EventFilter) {
    setKind(value)
    setLimit(20)
  }

  function updateMember(value: string | null) {
    setMemberId(value)
    setLimit(20)
  }

  function updatePeriod(value: PeriodFilter) {
    setPeriod(value)
    setLimit(20)
  }

  const reducedMotion = useReducedMotion()

  return (
    <div className="space-y-5">
      <Card padding="md" className="grid grid-cols-2 gap-4 sm:gap-8">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-app-subtle select-none">Total recebido</p>
          <p className="mt-2 truncate text-2xl font-semibold tracking-[-0.03em] text-app-text tabular">
            <NumberTicker value={totalRecebido} format={formatCurrency} decimals={2} />
          </p>
        </div>
        <div className="min-w-0 border-l border-app-line pl-4 sm:pl-8">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-app-subtle select-none">Pagamentos</p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-app-text tabular">
            <NumberTicker value={pagamentos} />
          </p>
        </div>
      </Card>

      <Card padding="md" className="space-y-4">
        <SegmentedControl<EventFilter>
          aria-label="Filtrar eventos"
          options={[
            { value: 'tudo', label: 'Tudo' },
            { value: 'pagamentos', label: 'Pagamentos' },
            { value: 'membros', label: 'Membros' },
          ]}
          value={kind}
          onChange={updateKind}
          className="w-full select-none"
        />

        <div>
          <div className="mb-2 flex items-center justify-between gap-3 select-none">
            <p id="member-filter-label" className="text-xs font-medium uppercase tracking-[0.08em] text-app-subtle">Por membro</p>
            <label htmlFor="history-period" className="sr-only">Período do histórico</label>
            <select
              id="history-period"
              value={period}
              onChange={(event) => updatePeriod(event.target.value as PeriodFilter)}
              className="min-h-10 max-w-[10.5rem] rounded-full border border-app-line bg-app-elevated px-3 text-xs font-medium text-app-text outline-none transition-colors hover:border-app-line-strong focus-visible:ring-2 focus-visible:ring-app-accent"
            >
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 3 meses</option>
              <option value="365">Últimos 12 meses</option>
              <option value="all">Todo o período</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2 select-none" role="group" aria-labelledby="member-filter-label">
            <button
              type="button"
              aria-pressed={memberId === null}
              onClick={() => updateMember(null)}
              className={`inline-flex min-h-10 items-center rounded-full border px-3.5 text-xs font-semibold transition-all ${memberId === null ? 'border-app-accent/40 bg-app-accent/10 text-app-accent shadow-xs' : 'border-app-line bg-app-elevated text-app-muted hover:border-app-line-strong hover:text-app-text'}`}
            >
              Todos
            </button>
            {members.map((member) => (
              <button
                key={member.id}
                type="button"
                aria-pressed={memberId === member.id}
                onClick={() => updateMember(member.id)}
                className={`inline-flex min-h-10 max-w-full items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-xs font-semibold transition-all ${memberId === member.id ? 'border-app-accent/40 bg-app-accent/10 text-app-accent shadow-xs' : 'border-app-line bg-app-elevated text-app-muted hover:border-app-line-strong hover:text-app-text'}`}
              >
                <Avatar nome={member.nome} cor={member.cor_avatar} size="sm" className="h-7 w-7 text-[10px]" />
                <span className="max-w-28 truncate">{member.nome.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<CalendarDays aria-hidden className="h-7 w-7" />}
          title={events.length ? 'Nenhum evento com esses filtros' : 'Sua linha do tempo começa aqui'}
          description={events.length ? 'Tente outro período ou escolha outro membro.' : 'Pagamentos e mudanças nos membros aparecerão aqui.'}
          action={events.length ? (
            <Button variant="secondary" onClick={() => { updateKind('tudo'); updateMember(null); updatePeriod('all') }}>Limpar filtros</Button>
          ) : (
            <Link href="/membros/novo" className="inline-flex min-h-11 items-center justify-center rounded-full bg-app-accent px-5 text-sm font-semibold text-app-accent-ink transition-transform hover:scale-[1.02]">Adicionar membro</Link>
          )}
        />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${kind}-${memberId ?? 'all'}-${period}`}
            initial={reducedMotion ? undefined : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="space-y-5"
          >
            {dayKeys.map((day) => {
              const dayEvents = visible.filter((event) => dateKey(event.data) === day)
              return (
                <section key={day}>
                  <h2 className="mb-3 px-1 text-[13px] font-medium uppercase tracking-[0.08em] text-app-subtle select-none">{dayHeading(day, today)}</h2>
                  <div className="relative space-y-2">
                    {dayEvents.length > 1 && <span aria-hidden className="absolute bottom-7 left-[19px] top-7 w-px bg-app-line-strong" />}
                    {dayEvents.map((event) => {
                      const config = eventKinds[event.tipo]
                      const Icon = config.icon
                      const member = members.find((item) => item.id === event.membroId)
                      const time = new Date(event.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                      return (
                        <article
                          key={event.id}
                          className="group relative flex min-w-0 items-start gap-3 rounded-app border border-app-line bg-app-surface p-3.5 sm:p-4 transition-all duration-200 hover:border-app-line-strong hover:bg-app-elevated/60"
                        >
                          <span className={`relative z-[1] inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-app-xs transition-transform duration-200 group-hover:scale-105 ${config.style}`}>
                            <Icon aria-hidden className="h-[18px] w-[18px]" />
                          </span>
                          <div className="min-w-0 flex-1 pt-0.5">
                            <p className="text-sm leading-6 text-app-muted">{eventText(event, member)}</p>
                            <time dateTime={event.data} className="mt-1 block text-xs text-app-subtle select-none">{time}</time>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </section>
              )
            })}
            {visible.length < filtered.length && (
              <div className="flex justify-center pt-1">
                <Button variant="secondary" onClick={() => setLimit((current) => current + 20)}>
                  Carregar mais
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
