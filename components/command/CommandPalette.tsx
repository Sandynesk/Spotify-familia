'use client'

import { useEffect, useMemo, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Check,
  Clock3,
  ChevronRight,
  FileSpreadsheet,
  House,
  Menu,
  MessageCircleMore,
  Search,
  Settings2,
  Sparkles,
  UserRoundPlus,
  UsersRound,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { buscarMembrosPalette } from '@/lib/actions/busca'
import type { MembroBusca } from '@/lib/actions/busca'
import { exportarCsv } from '@/lib/actions/exportar'
import { marcarPago, desfazerPagamento } from '@/lib/actions/pagamentos'
import { Avatar } from '@/components/ui/Avatar'
import { IconButton } from '@/components/ui/IconButton'
import { Kbd } from '@/components/ui/Kbd'
import { Sheet } from '@/components/ui/Sheet'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

interface RouteCommand {
  kind: 'route'
  id: string
  label: string
  description: string
  href: string
  icon: LucideIcon
}

interface ActionCommand {
  kind: 'action'
  id: string
  label: string
  description: string
  action: 'new-member' | 'charge-pending' | 'export-csv' | 'download-ics' | 'group-message'
  icon: LucideIcon
}

interface MemberCommand extends MembroBusca {
  kind: 'member'
  label: string
  description: string
}

type PaletteItem = RouteCommand | ActionCommand | MemberCommand

const routes: RouteCommand[] = [
  { kind: 'route', id: 'today', label: 'Hoje', description: 'Resumo do mês e quem falta pagar', href: '/dashboard', icon: House },
  { kind: 'route', id: 'members', label: 'Membros', description: 'Pessoas do seu plano', href: '/membros', icon: UsersRound },
  { kind: 'route', id: 'charge', label: 'Cobrar', description: 'Central de cobrança', href: '/cobrar', icon: MessageCircleMore },
  { kind: 'route', id: 'insights', label: 'Insights', description: 'Saldo e pontualidade', href: '/visao-geral', icon: ChartNoAxesColumnIncreasing },
  { kind: 'route', id: 'agenda', label: 'Agenda', description: 'Próximos vencimentos', href: '/agenda', icon: CalendarDays },
  { kind: 'route', id: 'history', label: 'Histórico', description: 'Atividade do seu grupo', href: '/historico', icon: Clock3 },
  { kind: 'route', id: 'retrospective', label: 'Retrospectiva', description: 'Um ano do seu plano', href: '/retrospectiva', icon: Sparkles },
  { kind: 'route', id: 'settings', label: 'Ajustes', description: 'Plano, PIX e preferências', href: '/configuracoes', icon: Settings2 },
  { kind: 'route', id: 'more', label: 'Mais', description: 'Atalhos e informações do app', href: '/mais', icon: Menu },
]

const actions: ActionCommand[] = [
  { kind: 'action', id: 'new-member', label: 'Novo membro', description: 'Adicionar alguém ao plano', action: 'new-member', icon: UserRoundPlus },
  { kind: 'action', id: 'charge-pending', label: 'Cobrar pendentes', description: 'Abrir a central com quem ainda falta pagar', action: 'charge-pending', icon: MessageCircleMore },
  { kind: 'action', id: 'export-csv', label: 'Exportar CSV', description: 'Baixar pagamentos deste ano', action: 'export-csv', icon: FileSpreadsheet },
  { kind: 'action', id: 'download-ics', label: 'Baixar agenda (.ics)', description: 'Adicionar vencimentos ao calendário', action: 'download-ics', icon: CalendarDays },
  { kind: 'action', id: 'group-message', label: 'Mensagem do grupo', description: 'Preparar uma mensagem para todos', action: 'group-message', icon: UsersRound },
]

let memberSearchCache: MembroBusca[] | null = null
let memberSearchPromise: Promise<MembroBusca[]> | null = null

function loadMemberSearchCache(): Promise<MembroBusca[]> {
  if (memberSearchCache) return Promise.resolve(memberSearchCache)
  if (!memberSearchPromise) {
    memberSearchPromise = buscarMembrosPalette()
      .then((result) => {
        if ('error' in result) throw new Error(result.error)
        memberSearchCache = result.membros
        return result.membros
      })
      .catch((error: unknown) => {
        memberSearchPromise = null
        throw error
      })
  }
  return memberSearchPromise
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter()
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [members, setMembers] = useState<MembroBusca[] | null>(memberSearchCache)
  const [memberError, setMemberError] = useState<string | null>(null)
  const [busyMemberId, setBusyMemberId] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (!open || !query.trim() || members !== null || memberError) return
    let current = true
    void loadMemberSearchCache()
      .then((result) => {
        if (current) setMembers(result)
      })
      .catch(() => {
        if (current) setMemberError('Não foi possível carregar os membros.')
      })
    return () => {
      current = false
    }
  }, [memberError, members, open, query])

  const groups = useMemo<{ label: string; items: PaletteItem[] }[]>(() => {
    const search = query.trim()
    const matchingRoutes = rankItems(routes, search)
    const matchingMembers: MemberCommand[] = search && members
      ? rankItems(members.map((member) => ({ ...member, label: member.nome })), search).map((member) => ({
          ...member,
          kind: 'member' as const,
          label: member.nome,
          description: memberDescription(member),
        }))
      : []
    const matchingActions = rankItems(actions, search)

    return [
      { label: 'Ir para', items: matchingRoutes },
      { label: 'Membros', items: matchingMembers },
      { label: 'Ações', items: matchingActions },
    ].filter((group) => group.items.length > 0)
  }, [members, query])

  const flatItems = useMemo(() => groups.flatMap((group) => group.items), [groups])
  const selectedIndex = Math.min(activeIndex, Math.max(flatItems.length - 1, 0))

  async function exportCsv() {
    setExporting(true)
    try {
      const result = await exportarCsv('pagamentos')
      if ('error' in result) {
        toast.error('Não foi possível exportar o CSV.')
        return
      }

      const blob = new Blob([result.conteudo], { type: 'text/csv;charset=utf-8' })
      const objectUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = objectUrl
      anchor.download = result.nome
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
      toast.success('CSV baixado.')
      onClose()
    } catch {
      toast.error('Não foi possível exportar o CSV.')
    } finally {
      setExporting(false)
    }
  }

  async function markMemberPaid(member: MemberCommand) {
    if (!member.pagamento_id || member.status_pagamento === 'pago' || busyMemberId) return
    setBusyMemberId(member.id)
    let result: Awaited<ReturnType<typeof marcarPago>>
    try {
      result = await marcarPago(member.pagamento_id)
    } catch {
      toast.error('Não foi possível marcar o pagamento.')
      setBusyMemberId(null)
      return
    }
    setBusyMemberId(null)
    if ('error' in result) {
      toast.error('Não foi possível marcar o pagamento.')
      return
    }

    updateMemberCache(member.id, { status_pagamento: 'pago' })
    setMembers((current) => current?.map((item) => item.id === member.id ? { ...item, status_pagamento: 'pago' } : item) ?? null)
    toast.show({
      message: `${member.nome} marcada como paga neste mês.`,
      action: {
        label: 'Desfazer',
        onClick: () => { void undoMemberPayment(member) },
      },
    })
  }

  async function undoMemberPayment(member: MemberCommand) {
    if (!member.pagamento_id) return
    let result: Awaited<ReturnType<typeof desfazerPagamento>>
    try {
      result = await desfazerPagamento(member.pagamento_id, member.mes_referencia)
    } catch {
      toast.error('Não foi possível desfazer o pagamento.')
      return
    }
    if ('error' in result) {
      toast.error('Não foi possível desfazer o pagamento.')
      return
    }

    updateMemberCache(member.id, { status_pagamento: 'pendente' })
    setMembers((current) => current?.map((item) => item.id === member.id ? { ...item, status_pagamento: 'pendente' } : item) ?? null)
    toast.success(`Pagamento de ${member.nome} desfeito.`)
  }

  function activate(item: PaletteItem | undefined) {
    if (!item) return
    if (item.kind === 'route') {
      onClose()
      router.push(item.href)
      return
    }
    if (item.kind === 'member') {
      onClose()
      router.push(`/membros/${encodeURIComponent(item.id)}`)
      return
    }

    switch (item.action) {
      case 'new-member':
        onClose()
        router.push('/membros/novo')
        break
      case 'charge-pending':
      case 'group-message':
        onClose()
        router.push('/cobrar')
        break
      case 'download-ics':
        onClose()
        downloadFile('/api/agenda/ics')
        break
      case 'export-csv':
        void exportCsv()
        break
    }
  }

  function onSearchKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => flatItems.length ? (index + 1) % flatItems.length : 0)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => flatItems.length ? (index - 1 + flatItems.length) % flatItems.length : 0)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      activate(flatItems[selectedIndex])
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Buscar" description="Encontre telas, pessoas e ações em um só lugar." className="sm:max-w-xl">
      <div className="relative">
        <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-app-muted" strokeWidth={1.8} />
        <input
          autoFocus
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setActiveIndex(0)
          }}
          onKeyDown={onSearchKeyDown}
          placeholder="Buscar telas, membros e ações…"
          aria-label="Buscar telas, membros e ações"
          aria-activedescendant={flatItems.length ? `command-result-${flatItems[selectedIndex]?.id}` : undefined}
          className="h-14 w-full rounded-app-sm border border-app-line-strong bg-app-elevated pl-12 pr-4 text-base text-app-text outline-none placeholder:text-app-subtle focus:border-app-accent/60 focus:ring-2 focus:ring-app-accent/20"
        />
      </div>

      <div className="mt-4 max-h-[min(54dvh,480px)] space-y-5 overflow-y-auto pr-1" aria-live="polite">
        {groups.map((group) => (
          <section key={group.label} aria-label={group.label}>
            <h3 className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-app-subtle">{group.label}</h3>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const index = flatItems.indexOf(item)
                const active = index === selectedIndex
                const id = `command-result-${item.id}`
                return (
                  <li key={item.id}>
                    {item.kind === 'member' ? (
                      <div className={cn('flex min-h-[68px] items-center gap-2 rounded-app-sm px-2 transition-colors', active && 'bg-app-elevated')} onMouseMove={() => setActiveIndex(index)}>
                        <button
                          id={id}
                          type="button"
                          aria-current={active ? 'true' : undefined}
                          onClick={() => activate(item)}
                          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg py-2 pl-1 text-left focus-visible:outline-none"
                        >
                          <Avatar nome={item.nome} cor={item.cor_avatar} size="md" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-app-text">{highlight(item.nome, query)}</span>
                            <span className="mt-0.5 block truncate text-xs text-app-muted">{item.description}</span>
                          </span>
                        </button>
                        <div className="flex shrink-0 items-center gap-0.5">
                          <IconButton
                            aria-label={`Cobrar ${item.nome}`}
                            title={`Cobrar ${item.nome}`}
                            icon={<MessageCircleMore />}
                            size="md"
                            variant="ghost"
                            onClick={() => {
                              onClose()
                              router.push(`/cobrar?membro=${encodeURIComponent(item.id)}`)
                            }}
                          />
                          <IconButton
                            aria-label={item.status_pagamento === 'pago' ? `${item.nome} já está paga neste mês` : `Marcar ${item.nome} como paga neste mês`}
                            title={item.status_pagamento === 'pago' ? 'Pago neste mês' : 'Marcar pago do mês'}
                            icon={busyMemberId === item.id ? <span className="h-4 w-4 animate-pulse rounded-full bg-app-muted" /> : <Check />}
                            size="md"
                            variant={item.status_pagamento === 'pago' ? 'default' : 'ghost'}
                            disabled={item.status_pagamento === 'pago' || !item.pagamento_id || busyMemberId !== null}
                            onClick={() => { void markMemberPaid(item) }}
                          />
                        </div>
                      </div>
                    ) : (
                      <CommandRow
                        id={id}
                        item={item}
                        query={query}
                        active={active}
                        busy={item.kind === 'action' && item.action === 'export-csv' && exporting}
                        onActivate={() => activate(item)}
                        onMouseMove={() => setActiveIndex(index)}
                      />
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        ))}

        {query.trim() && members === null && !memberError && (
          <p className="px-3 py-2 text-sm text-app-muted">Buscando membros…</p>
        )}
        {memberError && query.trim() && (
          <button type="button" onClick={() => setMemberError(null)} className="min-h-11 rounded-full px-3 text-sm font-medium text-app-accent hover:bg-app-accent/10">
            {memberError} Tentar de novo
          </button>
        )}
        {query.trim() && flatItems.length === 0 && members !== null && !memberError && (
          <div className="px-3 py-8 text-center">
            <p className="text-sm font-medium text-app-text">Nada encontrado</p>
            <p className="mt-1 text-xs text-app-muted">Tente outro nome, tela ou ação.</p>
          </div>
        )}
      </div>

      <div className="mt-4 hidden items-center justify-between border-t border-app-line pt-3 text-xs text-app-subtle sm:flex">
        <span className="flex items-center gap-1.5"><Kbd><ArrowUp className="h-3 w-3" /></Kbd><Kbd><ArrowDown className="h-3 w-3" /></Kbd><span className="ml-1">navegar</span></span>
        <span className="flex items-center gap-1.5"><Kbd>↵</Kbd><span>abrir</span></span>
        <span className="flex items-center gap-1.5"><Kbd>Esc</Kbd><span>fechar</span></span>
      </div>
    </Sheet>
  )
}

function CommandRow({
  id,
  item,
  query,
  active,
  busy,
  onActivate,
  onMouseMove,
}: {
  id: string
  item: RouteCommand | ActionCommand
  query: string
  active: boolean
  busy: boolean
  onActivate: () => void
  onMouseMove: () => void
}) {
  const Icon = item.icon
  return (
    <button
      id={id}
      type="button"
      aria-current={active ? 'true' : undefined}
      onClick={onActivate}
      onMouseMove={onMouseMove}
      className={cn('flex min-h-[60px] w-full items-center gap-3 rounded-app-sm px-3 text-left transition-colors focus-visible:outline-none', active ? 'bg-app-elevated' : 'hover:bg-app-elevated/70')}
    >
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-app-xs bg-app-raised text-app-muted">
        {busy ? <span className="h-4 w-4 animate-pulse rounded-full bg-app-muted" /> : <Icon aria-hidden className="h-[18px] w-[18px]" strokeWidth={1.8} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-app-text">{highlight(item.label, query)}</span>
        <span className="mt-0.5 block truncate text-xs text-app-muted">{item.description}</span>
      </span>
      <ChevronRight aria-hidden className="h-4 w-4 shrink-0 text-app-subtle" />
    </button>
  )
}

function rankItems<T extends { label: string }>(items: T[], query: string): T[] {
  const needle = fold(query.trim())
  if (!needle) return items
  return items
    .map((item) => ({ item, score: rank(fold(item.label), needle) }))
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score || left.item.label.localeCompare(right.item.label, 'pt-BR'))
    .map((result) => result.item)
}

function rank(label: string, query: string): number {
  if (label.startsWith(query)) return 2
  if (label.includes(query)) return 1
  return 0
}

function fold(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')
}

function highlight(value: string, query: string) {
  const needle = fold(query.trim())
  if (!needle) return value
  const normalized = fold(value)
  const index = normalized.indexOf(needle)
  if (index < 0) return value
  return <>{value.slice(0, index)}<mark className="rounded bg-app-accent/20 px-0.5 text-app-accent">{value.slice(index, index + needle.length)}</mark>{value.slice(index + needle.length)}</>
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function memberDescription(member: MembroBusca) {
  const paymentLabel = member.status_pagamento === 'pago'
    ? 'Pago neste mês'
    : member.status_pagamento === 'atrasado'
      ? 'Pagamento em atraso'
      : null
  const details = `${formatMoney(member.valor_mensal)} por mês · vence dia ${member.dia_vencimento}`
  return paymentLabel ? `${details} · ${paymentLabel}` : details
}

function downloadFile(href: string) {
  const anchor = document.createElement('a')
  anchor.href = href
  anchor.download = ''
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}

function updateMemberCache(id: string, patch: Partial<MembroBusca>) {
  if (!memberSearchCache) return
  memberSearchCache = memberSearchCache.map((member) => member.id === id ? { ...member, ...patch } : member)
}
