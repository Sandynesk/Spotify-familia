'use client'

import { useRef, useState } from 'react'
import type { TouchEvent } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, CircleCheck, ExternalLink, RotateCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { IconButton } from '@/components/ui/IconButton'
import { StatusBadge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { desfazerPagamento, marcarPago } from '@/lib/actions/pagamentos'
import type { AgendaMember, AgendaPayment } from '@/lib/actions/agenda'
import type { PagamentoStatus } from '@/types/database'
import { formatCurrency } from '@/lib/utils/currency'

interface CalendarEvent {
  member: AgendaMember
  payment: AgendaPayment | undefined
  date: string
  status: PagamentoStatus
  value: number
}

const statusDot: Record<PagamentoStatus, string> = {
  pago: 'bg-app-accent',
  pendente: 'bg-app-warn',
  atrasado: 'bg-app-danger',
}

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate()
}

function dateLabel(value: string) {
  const date = new Date(`${value}T12:00:00`)
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(date)
}

function dayOffset(value: string, today: string) {
  const due = new Date(`${value}T12:00:00`)
  const now = new Date(`${today}T12:00:00`)
  return Math.round((due.getTime() - now.getTime()) / 86_400_000)
}

function dueLabel(value: string, today: string) {
  const days = dayOffset(value, today)
  if (days === 0) return 'vence hoje'
  if (days === 1) return 'vence amanhã'
  if (days > 1) return `vence em ${days} dias`
  const late = Math.abs(days)
  return late === 1 ? 'venceu há 1 dia' : `venceu há ${late} dias`
}

export function AgendaCalendar({
  members,
  payments,
  initialMonth,
  today,
}: {
  members: AgendaMember[]
  payments: AgendaPayment[]
  initialMonth: string
  today: string
}) {
  const [monthKey, setMonthKey] = useState(initialMonth)
  const [selectedDate, setSelectedDate] = useState(today)
  const [pendingPayment, setPendingPayment] = useState<string | null>(null)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const router = useRouter()
  const toast = useToast()

  const [year, monthNumber] = monthKey.split('-').map(Number)
  const monthIndex = monthNumber - 1
  const monthLength = daysInMonth(year, monthIndex)
  const firstWeekday = (new Date(year, monthIndex, 1).getDay() + 6) % 7
  const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(year, monthIndex, 1))
  const selectedDay = Number(selectedDate.slice(-2))
  const days = Array.from({ length: monthLength }, (_, index) => index + 1)

  function eventsForDay(day: number): CalendarEvent[] {
    const date = `${monthKey}-${String(day).padStart(2, '0')}`
    const reference = monthKey
    return members
      .filter((member) => Math.min(member.dia_vencimento, monthLength) === day)
      .map((member) => {
        const payment = payments.find((item) => item.membro_id === member.id && item.mes_referencia.slice(0, 7) === reference)
        const status: PagamentoStatus = payment?.status === 'pago' ? 'pago' : date < today ? 'atrasado' : 'pendente'
        return { member, payment, date, status, value: Number(payment?.valor ?? member.valor_mensal) }
      })
  }

  function changeMonth(offset: number) {
    const next = new Date(year, monthIndex + offset, 1)
    const nextMonthKey = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`
    const nextDay = Math.min(selectedDay, daysInMonth(next.getFullYear(), next.getMonth()))
    setMonthKey(nextMonthKey)
    setSelectedDate(`${nextMonthKey}-${String(nextDay).padStart(2, '0')}`)
  }

  const selectedEvents = eventsForDay(Number(selectedDate.slice(-2)))

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    const touch = event.changedTouches[0]
    touchStart.current = { x: touch.clientX, y: touch.clientY }
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = touchStart.current
    const touch = event.changedTouches[0]
    touchStart.current = null
    if (!start) return
    const horizontal = touch.clientX - start.x
    const vertical = touch.clientY - start.y
    if (Math.abs(horizontal) > 55 && Math.abs(horizontal) > Math.abs(vertical) * 1.2) {
      changeMonth(horizontal < 0 ? 1 : -1)
    }
  }

  async function markAsPaid(event: CalendarEvent) {
    if (!event.payment) return
    setPendingPayment(event.payment.id)
    try {
      const result = await marcarPago(event.payment.id)
      if ('error' in result) {
        toast.show({ message: 'Não foi possível marcar o pagamento.', type: 'error' })
        return
      }
      toast.show({
        message: `Pagamento de ${event.member.nome} marcado como pago.`,
        action: {
          label: 'Desfazer',
          onClick: () => {
            void undoPayment(event)
          },
        },
      })
      router.refresh()
    } catch {
      toast.show({ message: 'Não foi possível marcar o pagamento.', type: 'error' })
    } finally {
      setPendingPayment(null)
    }
  }

  async function undoPayment(event: CalendarEvent) {
    if (!event.payment) return
    try {
      const result = await desfazerPagamento(event.payment.id, event.payment.mes_referencia)
      if ('error' in result) {
        toast.show({ message: 'Não foi possível desfazer o pagamento.', type: 'error' })
        return
      }
      toast.show({ message: 'Pagamento desfeito.', type: 'success' })
      router.refresh()
    } catch {
      toast.show({ message: 'Não foi possível desfazer o pagamento.', type: 'error' })
    }
  }

  return (
    <Card padding="md">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-[17px] font-semibold capitalize tracking-[-0.01em] text-app-text">{monthName}</h2>
          <p className="mt-1 text-xs text-app-muted">Toque em um dia para ver os detalhes</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <IconButton aria-label="Mês anterior" icon={<ChevronLeft />} variant="ghost" onClick={() => changeMonth(-1)} />
          <IconButton aria-label="Próximo mês" icon={<ChevronRight />} variant="ghost" onClick={() => changeMonth(1)} />
        </div>
      </div>

      <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} className="touch-pan-y">
        <div className="grid grid-cols-7 gap-1 text-center">
          {['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'].map((weekday) => (
            <span key={weekday} className="py-2 text-[11px] font-medium uppercase tracking-wide text-app-subtle">{weekday}</span>
          ))}
          {Array.from({ length: firstWeekday }, (_, index) => <span key={`blank-${index}`} aria-hidden="true" />)}
          {days.map((day) => {
            const events = eventsForDay(day)
            const value = `${monthKey}-${String(day).padStart(2, '0')}`
            const selected = value === selectedDate
            const isToday = value === today
            const statuses = Array.from(new Set(events.map((event) => event.status)))
            return (
              <button
                key={day}
                type="button"
                aria-label={`${day} de ${monthName}${events.length ? `, ${events.length} ${events.length === 1 ? 'vencimento' : 'vencimentos'}` : ''}`}
                aria-pressed={selected}
                onClick={() => setSelectedDate(value)}
                className={`flex min-h-[68px] min-w-0 flex-col items-center rounded-app-xs border px-0.5 py-1 transition-colors ${selected ? 'border-app-accent/60 bg-app-accent/10' : 'border-transparent hover:bg-app-elevated'} ${isToday && !selected ? 'bg-app-elevated/80' : ''}`}
              >
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold tabular ${isToday ? 'bg-app-accent text-app-accent-ink' : 'text-app-text'}`}>{day}</span>
                <span className="mt-0.5 flex h-1.5 items-center gap-0.5" aria-hidden="true">
                  {statuses.map((status) => <span key={status} className={`h-1.5 w-1.5 rounded-full ${statusDot[status]}`} />)}
                </span>
                <span className="mt-0.5 flex h-4 items-center justify-center">
                  {events.slice(0, 2).map((event) => (
                    <Avatar key={event.member.id} nome={event.member.nome} cor={event.member.cor_avatar} size="sm" className="-ml-1 h-4 w-4 border border-app-bg text-[7px]" />
                  ))}
                  {events.length > 2 && <span className="-ml-1 flex h-4 w-4 items-center justify-center rounded-full border border-app-bg bg-app-raised text-[7px] text-app-muted">+{events.length - 2}</span>}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-app-line pt-3 text-xs text-app-muted" aria-label="Legenda dos vencimentos">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-app-accent" />Pago</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-app-warn" />Pendente</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-app-danger" />Atrasado</span>
      </div>

      <section className="mt-5 border-t border-app-line pt-4" aria-live="polite">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold capitalize text-app-text">{dateLabel(selectedDate)}</h3>
          <span className="text-xs text-app-muted">{selectedEvents.length} {selectedEvents.length === 1 ? 'vencimento' : 'vencimentos'}</span>
        </div>
        {selectedEvents.length === 0 ? (
          <EmptyState
            title={members.length ? 'Sem vencimentos neste dia' : 'Adicione seus membros'}
            description={members.length ? 'Escolha outro dia para ver quem precisa pagar.' : 'Cadastre quem divide o plano para acompanhar os próximos pagamentos.'}
            className="px-4 py-6"
            action={!members.length ? <Link href="/membros/novo" className="inline-flex min-h-11 items-center justify-center rounded-full bg-app-accent px-5 text-sm font-semibold text-app-accent-ink">Adicionar membro</Link> : undefined}
          />
        ) : (
          <div className="space-y-2">
            {selectedEvents.map((event) => (
              <div key={event.member.id} className="flex min-w-0 flex-wrap items-center gap-3 rounded-app-sm border border-app-line bg-app-elevated/40 p-3">
                <Avatar nome={event.member.nome} cor={event.member.cor_avatar} size="sm" status={event.status === 'pago' ? 'paid' : event.status === 'atrasado' ? 'overdue' : 'pending'} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-app-text">{event.member.nome}</p>
                  <p className="mt-0.5 text-xs text-app-muted">{dueLabel(event.date, today)} · <span className="tabular">{formatCurrency(event.value)}</span></p>
                </div>
                <StatusBadge status={event.status} />
                <div className="flex w-full gap-2 sm:w-auto">
                  {event.status !== 'pago' && event.payment && (
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={pendingPayment === event.payment.id}
                      icon={pendingPayment === event.payment.id ? undefined : <CircleCheck />}
                      onClick={() => void markAsPaid(event)}
                      className="min-h-11 flex-1 sm:flex-none"
                    >
                      Marcar pago
                    </Button>
                  )}
                  {event.status !== 'pago' && (
                    <Link
                      href={`/cobrar?membro=${encodeURIComponent(event.member.id)}`}
                      className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-app-elevated px-4 text-sm font-semibold text-app-text transition-colors hover:bg-app-raised sm:flex-none"
                    >
                      Cobrar <ExternalLink aria-hidden className="h-4 w-4" />
                    </Link>
                  )}
                  {event.status === 'pago' && <span className="ml-auto inline-flex items-center gap-1 text-xs text-app-accent"><CircleCheck aria-hidden className="h-4 w-4" />Recebido</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="mt-4 flex items-center justify-between gap-2 text-xs text-app-subtle">
        <span>Deslize para trocar de mês</span>
        <Button variant="ghost" size="sm" icon={<RotateCcw />} className="min-h-11" onClick={() => { setMonthKey(initialMonth); setSelectedDate(today) }}>
          Ir para hoje
        </Button>
      </div>
      {members.length === 0 && <p className="sr-only">Cadastre um membro para começar a acompanhar vencimentos.</p>}
    </Card>
  )
}
