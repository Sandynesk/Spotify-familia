'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  LoaderCircle,
  Plus,
  Search,
  Users,
  X,
} from 'lucide-react'
import { AtrasosCard } from '@/components/hoje/AtrasosCard'
import { MonthCelebration } from '@/components/hoje/MonthCelebration'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { IconButton } from '@/components/ui/IconButton'
import { ListGroup } from '@/components/ui/ListGroup'
import { NumberTicker } from '@/components/ui/NumberTicker'
import { PageHeader } from '@/components/ui/PageHeader'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SlotsRing } from '@/components/ui/SlotsRing'
import { StatusBadge } from '@/components/ui/Badge'
import { SwipeRow } from '@/components/ui/SwipeRow'
import { useToast } from '@/components/ui/Toast'
import { haptic } from '@/components/ui/haptics'
import { desfazerPagamento, marcarPago } from '@/lib/actions/pagamentos'
import { desfazerVarios, marcarVariosPagos } from '@/lib/actions/lote'
import { formatCurrency } from '@/lib/utils/currency'
import type { ProximoVencimento } from '@/lib/domain/agenda'
import type { SaldoPlano } from '@/lib/domain/insights'
import type { DashboardSummary, Devedor, Membro, Pagamento, ResumoCusto } from '@/types/database'

interface HojeDashboardProps {
  membros: Membro[]
  pagamentosMes: Pagamento[]
  summary: DashboardSummary
  devedores: Devedor[]
  custo: ResumoCusto
  saldo: SaldoPlano | null
  agenda: ProximoVencimento[]
  monthISO: string
  monthTitle: string
  todayISO: string
  greeting: string
}

interface PaymentEntry {
  membro: Membro
  pagamento: Pagamento
  status: 'pendente' | 'atrasado' | 'pago'
  dueLabel: string
}

export function HojeDashboard({
  membros,
  pagamentosMes,
  summary,
  devedores,
  custo,
  saldo,
  agenda,
  monthISO,
  monthTitle,
  todayISO,
  greeting,
}: HojeDashboardProps) {
  const router = useRouter()
  const toast = useToast()
  const [pagamentos, setPagamentos] = useState(pagamentosMes)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [busyIds, setBusyIds] = useState<string[]>([])
  const [bulkLoading, setBulkLoading] = useState(false)

  const paymentByMember = useMemo(
    () => new Map(pagamentos.map((payment) => [payment.membro_id, payment])),
    [pagamentos],
  )
  const entries = useMemo<PaymentEntry[]>(() => membros.flatMap((membro) => {
    const pagamento = paymentByMember.get(membro.id)
    if (!pagamento) return []
    const overdue = pagamento.status !== 'pago' && dueDateISO(membro.dia_vencimento, monthISO) < todayISO
    return [{
      membro,
      pagamento,
      status: pagamento.status === 'pago' ? 'pago' : overdue ? 'atrasado' : 'pendente',
      dueLabel: pagamento.status === 'pago' ? '' : dueLabel(membro.dia_vencimento, monthISO, todayISO),
    }]
  }), [membros, monthISO, paymentByMember, todayISO])
  const pending = entries.filter((entry) => entry.pagamento.status !== 'pago')
    .sort((left, right) => Number(right.status === 'atrasado') - Number(left.status === 'atrasado') || left.membro.nome.localeCompare(right.membro.nome, 'pt-BR'))
  const paid = entries.filter((entry) => entry.pagamento.status === 'pago')
  const totalPaid = paid.reduce((total, entry) => total + Number(entry.pagamento.valor), 0)
  const pendingTotal = Math.max(0, summary.totalAReceber - totalPaid)
  const selectedEntries = pending.filter((entry) => selectedIds.includes(entry.pagamento.id))
  const selectedTotal = selectedEntries.reduce((total, entry) => total + Number(entry.pagamento.valor), 0)
  const isComplete = membros.length > 0 && paid.length === membros.length

  function setBusy(id: string, busy: boolean) {
    setBusyIds((current) => busy
      ? current.includes(id) ? current : [...current, id]
      : current.filter((item) => item !== id))
  }

  async function undoOne(snapshot: Pagamento, nome: string, paidSnapshot: Pagamento) {
    setPaymentsWithSnapshot([snapshot])
    setBusy(snapshot.id, true)

    try {
      const result = await desfazerPagamento(snapshot.id, snapshot.mes_referencia)
      if ('error' in result && result.error) throw new Error(result.error)
      toast.show({ message: `Pagamento de ${nome} desfeito`, type: 'success' })
      router.refresh()
    } catch (caught) {
      setPaymentsWithSnapshot([paidSnapshot])
      toast.show({
        message: caught instanceof Error ? caught.message : 'Não foi possível desfazer o pagamento.',
        type: 'error',
      })
    } finally {
      setBusy(snapshot.id, false)
    }
  }

  async function markOne(entry: PaymentEntry) {
    const { pagamento, membro } = entry
    if (busyIds.includes(pagamento.id) || bulkLoading || pagamento.status === 'pago') return
    const snapshot = { ...pagamento }
    const marked = { ...pagamento, status: 'pago' as const, data_pagamento: new Date().toISOString() }
    setBusy(pagamento.id, true)
    setPaymentsWithSnapshot([marked])
    haptic('light')

    try {
      const result = await marcarPago(pagamento.id)
      if ('error' in result && result.error) throw new Error(result.error)
      toast.show({
        message: `Pagamento de ${membro.nome} marcado como pago`,
        type: 'success',
        duration: 8000,
        action: { label: 'Desfazer', onClick: () => { void undoOne(snapshot, membro.nome, marked) } },
      })
      router.refresh()
    } catch (caught) {
      setPaymentsWithSnapshot([snapshot])
      toast.show({
        message: caught instanceof Error ? caught.message : 'Não foi possível registrar o pagamento.',
        type: 'error',
      })
    } finally {
      setBusy(pagamento.id, false)
    }
  }

  async function undoMany(snapshots: Pagamento[], paidSnapshots: Pagamento[]) {
    if (!snapshots.length) return
    setPaymentsWithSnapshot(snapshots)
    setBulkLoading(true)

    try {
      const result = await desfazerVarios(snapshots.map((payment) => payment.id))
      if ('error' in result && result.error) throw new Error(result.error)
      toast.show({ message: 'Pagamentos desfeitos', type: 'success' })
      router.refresh()
    } catch (caught) {
      setPaymentsWithSnapshot(paidSnapshots)
      toast.show({
        message: caught instanceof Error ? caught.message : 'Não foi possível desfazer os pagamentos.',
        type: 'error',
      })
    } finally {
      setBulkLoading(false)
    }
  }

  async function markSelected() {
    const snapshots = selectedEntries.map((entry) => ({ ...entry.pagamento }))
    if (!snapshots.length || bulkLoading) return
    const marked = snapshots.map((payment) => ({ ...payment, status: 'pago' as const, data_pagamento: new Date().toISOString() }))
    setBulkLoading(true)
    setPaymentsWithSnapshot(marked)
    haptic('success')

    try {
      const result = await marcarVariosPagos(snapshots.map((payment) => payment.id))
      if ('error' in result && result.error) throw new Error(result.error)
      const names = selectedEntries.map((entry) => entry.membro.nome)
      const message = names.length === 1 ? `Pagamento de ${names[0]} marcado como pago` : `${names.length} pessoas marcadas como pagas`
      setSelectionMode(false)
      setSelectedIds([])
      toast.show({
        message,
        type: 'success',
        duration: 8000,
        action: { label: 'Desfazer', onClick: () => { void undoMany(snapshots, marked) } },
      })
      router.refresh()
    } catch (caught) {
      setPaymentsWithSnapshot(snapshots)
      toast.show({
        message: caught instanceof Error ? caught.message : 'Não foi possível registrar os pagamentos.',
        type: 'error',
      })
    } finally {
      setBulkLoading(false)
    }
  }

  function setPaymentsWithSnapshot(snapshots: Pagamento[]) {
    const byId = new Map(snapshots.map((snapshot) => [snapshot.id, snapshot]))
    setPagamentos((current) => current.map((payment) => byId.get(payment.id) ?? payment))
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  function toggleSelectionMode() {
    setSelectedIds([])
    setSelectionMode((current) => !current)
  }

  if (membros.length === 0) {
    return (
      <div className="space-y-5">
        <PageHeader
          title={greeting}
          subtitle={monthTitle}
          eyebrow="Hoje"
          actions={<HeaderActions />}
        />
        <EmptyState
          className="min-h-[360px] px-6 py-14 sm:min-h-[420px]"
          icon={<Users aria-hidden className="h-7 w-7" />}
          title="Vamos montar sua família"
          description="Adicione até cinco pessoas para acompanhar os pagamentos do seu plano por aqui."
          action={(
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Link href="/boas-vindas" className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-app-accent px-6 text-sm font-semibold text-app-accent-ink transition-colors hover:bg-app-accent-hover">
                Começar agora
              </Link>
              <Link href="/membros/novo" className="inline-flex min-h-11 items-center justify-center rounded-full border border-app-line-strong bg-app-elevated px-5 text-sm font-medium text-app-text transition-colors hover:bg-app-raised">
                Adicionar membro
              </Link>
            </div>
          )}
        />
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-8">
      <PageHeader
        title={greeting}
        subtitle={monthTitle}
        eyebrow="Hoje"
        actions={<HeaderActions />}
      />

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-8">
          <Card variant="hero" padding="lg" className="overflow-hidden">
            <MonthCelebration monthISO={monthISO} complete={isComplete} />
            <div className="relative z-10 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:gap-5">
              <div className="min-w-0">
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-app-subtle">Arrecadação do mês</p>
                <p className="truncate text-[clamp(2rem,9vw,3.5rem)] font-semibold leading-none tracking-[-0.04em] tabular text-app-text">
                  <NumberTicker value={totalPaid} decimals={2} format={formatCurrency} />
                </p>
                <p className="mt-2 text-sm text-app-muted">
                  recebidos de <span className="font-medium tabular text-app-text">{formatCurrency(summary.totalAReceber)}</span>
                </p>
              </div>
              <SlotsRing
                occupied={Math.min(membros.length + 1, 6)}
                paid={Math.min(paid.length + 1, membros.length + 1, 6)}
                total={6}
                size={72}
                label={`${Math.min(membros.length + 1, 6)} de 6 vagas ocupadas, ${Math.min(paid.length + 1, membros.length + 1, 6)} pagas neste mês`}
              />
            </div>

            <div className="relative z-10 mt-6 flex flex-wrap items-center gap-2">
              {isComplete ? (
                <p className="inline-flex items-center gap-2 text-sm font-medium text-app-accent">
                  <CheckCircle2 aria-hidden className="h-5 w-5" />
                  Mês fechado. Tudo pago
                </p>
              ) : (
                <>
                  <Clock3 aria-hidden className="h-4 w-4 shrink-0 text-app-warn" />
                  <p className="text-sm text-app-muted">
                    Faltam <span className="font-semibold tabular text-app-text">{formatCurrency(pendingTotal)}</span> de{' '}
                    <span className="font-semibold text-app-text">{pending.length} {pending.length === 1 ? 'pessoa' : 'pessoas'}</span>
                  </p>
                </>
              )}
            </div>

            <div className="relative z-10 mt-5 h-1.5 overflow-hidden rounded-full bg-app-elevated/90" role="progressbar" aria-label="Arrecadação do mês" aria-valuemin={0} aria-valuemax={100} aria-valuenow={summary.totalAReceber ? Math.round((totalPaid / summary.totalAReceber) * 100) : 0}>
              <div
                className="h-full rounded-full bg-app-accent transition-[width] duration-500 ease-app motion-reduce:transition-none"
                style={{ width: `${summary.totalAReceber ? Math.min(100, Math.max(0, (totalPaid / summary.totalAReceber) * 100)) : 0}%` }}
              />
            </div>
          </Card>

          <QuickActions selectionMode={selectionMode} onToggleSelection={toggleSelectionMode} />

          <div className="grid gap-5 lg:grid-cols-2">
            <section>
              <SectionHeader
                title="Pendentes deste mês"
                description={`${pending.length} ${pending.length === 1 ? 'pagamento em aberto' : 'pagamentos em aberto'}`}
              />
              {pending.length === 0 ? (
                <Card padding="md" className="flex min-h-28 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-app-accent/10 text-app-accent">
                    <CheckCircle2 aria-hidden className="h-5 w-5" />
                  </span>
                  <p className="text-sm text-app-muted">Nenhum pagamento pendente neste mês.</p>
                </Card>
              ) : (
                <ListGroup className="overflow-visible">
                  {pending.map((entry) => (
                    <PaymentRow
                      key={entry.pagamento.id}
                      entry={entry}
                      selectionMode={selectionMode}
                      selected={selectedIds.includes(entry.pagamento.id)}
                      loading={busyIds.includes(entry.pagamento.id) || bulkLoading}
                      onToggle={() => toggleSelected(entry.pagamento.id)}
                      onMark={() => { void markOne(entry) }}
                    />
                  ))}
                </ListGroup>
              )}
            </section>

            <section>
              <SectionHeader title="Já pagaram" description={`${paid.length} ${paid.length === 1 ? 'pagamento recebido' : 'pagamentos recebidos'}`} />
              <Card padding="none" className="overflow-hidden">
                <details>
                  <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-3 text-left [&::-webkit-details-marker]:hidden">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-app-accent/10 text-app-accent">
                      <Check aria-hidden className="h-[18px] w-[18px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-app-text">Recebidos em {monthTitle}</span>
                      <span className="block text-xs text-app-muted">Toque para {paid.length ? 'ver as confirmações' : 'conferir os recebimentos'}</span>
                    </span>
                    <span className="tabular text-sm font-semibold text-app-muted">{paid.length}</span>
                    <ChevronDown aria-hidden className="h-4 w-4 shrink-0 text-app-subtle" />
                  </summary>
                  {paid.length ? (
                    <div className="divide-y divide-app-line border-t border-app-line px-4">
                      {paid.map((entry) => (
                        <Link key={entry.pagamento.id} href={`/membros/${entry.membro.id}`} className="flex min-h-[60px] items-center gap-3 py-2.5">
                          <Avatar nome={entry.membro.nome} cor={entry.membro.cor_avatar} size="sm" status="paid" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-app-text">{entry.membro.nome}</span>
                            <span className="block truncate text-xs text-app-muted">{paidDateLabel(entry.pagamento, entry.membro, monthISO)}</span>
                          </span>
                          <span className="shrink-0 text-sm font-medium tabular text-app-text">{formatCurrency(entry.pagamento.valor)}</span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="border-t border-app-line px-4 py-4 text-sm text-app-muted">Os pagamentos recebidos vão aparecer aqui.</p>
                  )}
                </details>
              </Card>
            </section>
          </div>

          <AtrasosCard devedores={devedores} />
        </div>

        <aside className="space-y-5 lg:col-span-4">
          <UpcomingCard agenda={agenda} todayISO={todayISO} />
          <SaldoCard custo={custo} saldo={saldo} />
        </aside>
      </div>

      {selectionMode && selectedEntries.length > 0 && (
        <div className="fixed inset-x-3 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-xl lg:sticky lg:inset-x-auto lg:bottom-4 lg:mt-5">
          <div className="app-glass flex items-center gap-3 rounded-app px-3 py-3 shadow-app-float sm:px-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-app-text" aria-label={`Marcar ${selectedEntries.length} ${selectedEntries.length === 1 ? 'como pago' : 'como pagos'} · ${formatCurrency(selectedTotal)}`}>
                Marcar {selectedEntries.length} {selectedEntries.length === 1 ? 'como pago' : 'como pagos'}
              </p>
              <p className="text-xs tabular text-app-muted">· {formatCurrency(selectedTotal)}</p>
            </div>
            <Button
              size="md"
              loading={bulkLoading}
              disabled={selectedEntries.length === 0}
              onClick={() => { void markSelected() }}
              className="max-w-[52%] truncate px-4"
            >
              Marcar pagos
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function HeaderActions() {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <Link
        href="/membros"
        aria-label="Buscar membros"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-app-line bg-app-elevated text-app-muted transition-colors hover:bg-app-raised hover:text-app-text"
      >
        <Search aria-hidden className="h-5 w-5" />
      </Link>
      <Link
        href="/mais"
        aria-label="Abrir mais opções"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-app-line bg-app-elevated transition-colors hover:bg-app-raised"
      >
        <Avatar nome="Você" size="sm" />
      </Link>
    </div>
  )
}

function QuickActions({ selectionMode, onToggleSelection }: { selectionMode: boolean; onToggleSelection: () => void }) {
  const pills = [
    { href: '/cobrar', icon: <CircleDollarSign aria-hidden />, label: 'Cobrar pendentes' },
    { href: '/membros/novo', icon: <Plus aria-hidden />, label: 'Novo membro' },
    { href: '/agenda', icon: <CalendarDays aria-hidden />, label: 'Agenda' },
  ]

  return (
    <nav aria-label="Ações rápidas" className="-mx-5 flex max-w-[calc(100%+2.5rem)] gap-2 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:max-w-[calc(100%+4rem)] sm:px-8 lg:mx-0 lg:max-w-full lg:px-0">
      {pills.slice(0, 1).map((pill) => (
        <Link key={pill.href} href={pill.href} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-app-line bg-app-surface px-4 text-sm font-medium text-app-text transition-colors hover:bg-app-elevated">
          <span className="text-app-accent [&>svg]:h-4 [&>svg]:w-4">{pill.icon}</span>
          {pill.label}
        </Link>
      ))}
      <button
        type="button"
        onClick={onToggleSelection}
        aria-pressed={selectionMode}
        className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-app-line bg-app-surface px-4 text-sm font-medium text-app-text transition-colors hover:bg-app-elevated"
      >
        <span className="text-app-accent [&>svg]:h-4 [&>svg]:w-4">{selectionMode ? <X aria-hidden /> : <CheckCircle2 aria-hidden />}</span>
        {selectionMode ? 'Cancelar seleção' : 'Marcar vários'}
      </button>
      {pills.slice(1).map((pill) => (
        <Link key={pill.href} href={pill.href} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-app-line bg-app-surface px-4 text-sm font-medium text-app-text transition-colors hover:bg-app-elevated">
          <span className="text-app-accent [&>svg]:h-4 [&>svg]:w-4">{pill.icon}</span>
          {pill.label}
        </Link>
      ))}
    </nav>
  )
}

function PaymentRow({
  entry,
  selectionMode,
  selected,
  loading,
  onToggle,
  onMark,
}: {
  entry: PaymentEntry
  selectionMode: boolean
  selected: boolean
  loading: boolean
  onToggle: () => void
  onMark: () => void
}) {
  const { membro } = entry
  const content = selectionMode ? (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onToggle}
      className="flex min-h-[76px] min-w-0 flex-1 items-center gap-2.5 px-3 py-3 text-left sm:gap-3 sm:px-4"
    >
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${selected ? 'border-app-accent bg-app-accent text-app-accent-ink' : 'border-app-line-strong bg-app-elevated text-transparent'}`}>
        <Check aria-hidden className="h-4 w-4" />
      </span>
      <PaymentDetails entry={entry} />
    </button>
  ) : (
    <Link href={`/membros/${membro.id}`} className="flex min-h-[76px] min-w-0 flex-1 items-center gap-2.5 px-3 py-3 transition-colors hover:bg-app-elevated/50 sm:gap-3 sm:px-4">
      <PaymentDetails entry={entry} />
    </Link>
  )

  const row = (
    <div className={`flex min-w-0 items-center ${selected ? 'bg-app-accent/5' : 'bg-app-surface'}`}>
      {content}
      {!selectionMode && (
        <IconButton
          aria-label={`Marcar ${membro.nome} como paga`}
          icon={loading ? <LoaderCircle className="animate-spin" /> : <Check />}
          disabled={loading}
          onClick={onMark}
          variant="ghost"
          className="mr-2 border border-app-line-strong bg-app-elevated text-app-accent hover:bg-app-accent hover:text-app-accent-ink sm:mr-3"
        />
      )}
    </div>
  )

  return selectionMode ? row : (
    <SwipeRow actionLabel="Pago" onAction={onMark} actionClassName="rounded-r-app-sm">
      {row}
    </SwipeRow>
  )
}

function PaymentDetails({ entry }: { entry: PaymentEntry }) {
  const { membro, pagamento, status, dueLabel: label } = entry
  return (
    <span className="flex min-w-0 flex-1 items-center gap-2">
      {!('status' in entry && entry.status === 'pago') && <Avatar nome={membro.nome} cor={membro.cor_avatar} size="md" status={status === 'atrasado' ? 'overdue' : 'pending'} />}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-app-text">{membro.nome}</span>
        <span className="mt-0.5 block truncate text-xs text-app-muted">{label}</span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-sm font-semibold tabular text-app-text">{formatCurrency(pagamento.valor)}</span>
        <StatusBadge status={status} className="min-h-5 px-2 py-1 text-[11px] [&>svg]:h-3 [&>svg]:w-3" />
      </span>
    </span>
  )
}

function UpcomingCard({ agenda, todayISO }: { agenda: ProximoVencimento[]; todayISO: string }) {
  return (
    <Card padding="md">
      <SectionHeader title="Próximos vencimentos" actionLabel="Ver agenda" href="/agenda" />
      {agenda.length === 0 ? (
        <p className="rounded-app-sm bg-app-elevated/60 px-3.5 py-3 text-sm text-app-muted">Nenhum vencimento em aberto nos próximos dias.</p>
      ) : (
        <div className="divide-y divide-app-line">
          {agenda.map((item) => (
            <Link key={`${item.membroId}-${item.mesReferencia}`} href={`/membros/${item.membroId}`} className="flex min-h-[66px] items-center gap-3 py-3 first:pt-1 last:pb-0">
              <span className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-app-sm bg-app-elevated text-app-muted">
                <CalendarDays aria-hidden className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-app-text">{item.nome}</span>
                <span className="block truncate text-xs text-app-muted">{agendaDateLabel(item.dataVencimento, todayISO)}</span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-sm font-semibold tabular text-app-text">{formatCurrency(item.valor)}</span>
                <span className="text-xs text-app-subtle">{item.status === 'atrasado' ? 'Em atraso' : 'Em aberto'}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </Card>
  )
}

function SaldoCard({ custo, saldo }: { custo: ResumoCusto; saldo: SaldoPlano | null }) {
  if (!saldo || custo.valorPlano === null) {
    return (
      <Card padding="md">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-app-sm bg-app-elevated text-app-accent">
            <CircleDollarSign aria-hidden className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-app-text">Saldo do plano</h2>
            <p className="mt-1 text-sm leading-relaxed text-app-muted">Informe o valor do plano para acompanhar se a divisão cobre a mensalidade.</p>
            <Link href="/configuracoes" className="mt-3 inline-flex min-h-10 items-center rounded-full px-3 text-sm font-semibold text-app-accent transition-colors hover:bg-app-accent/10">Configurar plano</Link>
          </div>
        </div>
      </Card>
    )
  }

  const hasSurplus = saldo.sobraPrevista >= 0
  const amount = hasSurplus ? saldo.sobraPrevista : saldo.faltaPrevista
  return (
    <Card padding="md">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-app-sm bg-app-accent/10 text-app-accent">
          <CircleDollarSign aria-hidden className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-app-text">Saldo do plano</h2>
          <p className={`mt-2 text-2xl font-semibold tracking-[-0.03em] tabular ${hasSurplus ? 'text-app-accent' : 'text-app-warn'}`}>
            {hasSurplus ? 'Sobra ' : 'Você cobre '}{formatCurrency(amount)}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-app-muted">
            Projeção com {formatCurrency(saldo.previstoMes)} recebidos de um plano de {formatCurrency(saldo.valorPlano)}.
          </p>
        </div>
      </div>
    </Card>
  )
}

function dueDateISO(day: number, monthISO: string) {
  const year = Number(monthISO.slice(0, 4))
  const month = Number(monthISO.slice(5, 7))
  const lastDay = new Date(year, month, 0).getDate()
  const safeDay = Math.min(Math.max(1, day), lastDay)
  return `${year}-${String(month).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`
}

function dueLabel(day: number, monthISO: string, todayISO: string) {
  const due = dueDateISO(day, monthISO)
  if (due < todayISO) {
    const diff = Math.round((dateAtNoon(todayISO).getTime() - dateAtNoon(due).getTime()) / 86_400_000)
    return `venceu há ${diff} ${diff === 1 ? 'dia' : 'dias'}`
  }
  if (due === todayISO) return 'vence hoje'
  return `vence dia ${Number(due.slice(-2))}`
}

function paidDateLabel(payment: Pagamento, membro: Membro, monthISO: string) {
  if (!payment.data_pagamento) return 'Pagamento confirmado'
  const paid = new Date(payment.data_pagamento)
  const paidISO = `${paid.getFullYear()}-${String(paid.getMonth() + 1).padStart(2, '0')}-${String(paid.getDate()).padStart(2, '0')}`
  const due = dueDateISO(membro.dia_vencimento, monthISO)
  const days = Math.round((dateAtNoon(due).getTime() - dateAtNoon(paidISO).getTime()) / 86_400_000)
  const relation = days > 0 ? `${days} ${days === 1 ? 'dia' : 'dias'} antes` : days < 0 ? `${Math.abs(days)} ${days === -1 ? 'dia' : 'dias'} depois` : 'no vencimento'
  return `pagou dia ${paid.getDate()}, ${relation}`
}

function dateAtNoon(iso: string) {
  return new Date(`${iso}T12:00:00`)
}

function agendaDateLabel(dateISO: string, todayISO: string) {
  if (dateISO === todayISO) return 'Vence hoje'
  const tomorrow = dateAtNoon(todayISO)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (`${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}` === dateISO) return 'Vence amanhã'
  return `Vence ${dateAtNoon(dateISO).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace('.', '')}`
}
