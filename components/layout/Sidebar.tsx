'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, ChartNoAxesColumnIncreasing, Clock3, Command, House, LogOut, Menu, MessageCircleMore, Search, Settings2, UsersRound } from 'lucide-react'
import { BrandMark } from '@/components/landing/BrandMark'
import { Button } from '@/components/ui/Button'
import { Kbd } from '@/components/ui/Kbd'
import { useCommandPalette } from '@/components/command/CommandPaletteProvider'
import { cn } from '@/lib/utils'

interface SidebarProps {
  occupiedSlots: number
  monthlyValue: number | null
  demo?: boolean
}

const groups = [
  {
    label: 'Principal',
    items: [
      { href: '/dashboard', label: 'Hoje', icon: House },
      { href: '/membros', label: 'Membros', icon: UsersRound },
      { href: '/cobrar', label: 'Cobrar', icon: MessageCircleMore },
      { href: '/visao-geral', label: 'Insights', icon: ChartNoAxesColumnIncreasing },
    ],
  },
  {
    label: 'Planejar',
    items: [
      { href: '/agenda', label: 'Agenda', icon: CalendarDays },
      { href: '/historico', label: 'Histórico', icon: Clock3 },
      { href: '/retrospectiva', label: 'Retrospectiva', icon: Command },
    ],
  },
  {
    label: 'Conta',
    items: [
      { href: '/configuracoes', label: 'Configurações', icon: Settings2 },
      { href: '/mais', label: 'Mais', icon: Menu },
    ],
  },
]

/** Fixed desktop navigation with account actions and live plan summary. */
export function Sidebar({ occupiedSlots, monthlyValue, demo = false }: SidebarProps) {
  const pathname = usePathname()
  const { openPalette } = useCommandPalette()

  return (
    <aside className={cn('fixed left-0 z-40 hidden w-[264px] flex-col border-r border-app-line bg-app-surface/90 px-4 py-6 font-app backdrop-blur-2xl lg:flex', demo ? 'top-16 bottom-0' : 'inset-y-0')}>
      <div className="px-3 pb-8">
        <Link href="/dashboard" aria-label="SpotiFamília, ir para Hoje" className="inline-flex rounded-lg transition-transform hover:scale-[1.02]">
          <BrandMark size={28} />
        </Link>
      </div>

      <div className="px-1 pb-5">
        <Button
          type="button"
          variant="glass"
          size="sm"
          className="h-10 w-full justify-start rounded-app-sm px-3 font-normal text-app-muted"
          icon={<Search />}
          data-command-trigger
          onClick={openPalette}
        >
          <span className="flex flex-1 items-center justify-between gap-3">
            <span>Buscar</span>
            <span className="inline-flex items-center gap-1"><Kbd>⌘</Kbd><Kbd>K</Kbd></span>
          </span>
        </Button>
      </div>

      <nav className="min-h-0 flex-1 space-y-7 overflow-y-auto px-1" aria-label="Navegação principal">
        {groups.map((group) => (
          <section key={group.label}>
            <h2 className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-app-subtle">{group.label}</h2>
            <ul className="space-y-1">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = href === '/dashboard' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'relative flex min-h-11 items-center gap-3 rounded-app-sm px-3 text-sm font-medium transition-colors',
                        active ? 'bg-app-elevated text-app-text' : 'text-app-muted hover:bg-app-elevated/65 hover:text-app-text',
                      )}
                    >
                      {active && <span aria-hidden className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-app-accent" />}
                      <Icon aria-hidden className={cn('h-5 w-5 shrink-0', active ? 'text-app-accent' : 'text-app-subtle')} strokeWidth={1.75} />
                      <span>{label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </nav>

      <div className="mt-5 border-t border-app-line pt-4">
        <div className="rounded-app border border-app-line bg-app-elevated/70 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-app-muted">Seu plano</p>
              <p className="mt-1 text-sm font-semibold text-app-text">{occupiedSlots} de 6 vagas usadas</p>
            </div>
            <span className="tabular text-sm font-semibold text-app-text">{monthlyValue == null ? '—' : formatMonthly(monthlyValue)}</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-app-raised" aria-label={`${occupiedSlots} de 6 vagas usadas`} role="img">
            <span className="block h-full rounded-full bg-app-accent transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${Math.max(0, Math.min(occupiedSlots, 6)) / 6 * 100}%` }} />
          </div>
          <p className="mt-2 text-[11px] text-app-subtle">total mensal</p>
        </div>
        <form action="/sair" method="post" className="mt-3">
          <Button type="submit" variant="ghost" size="md" className="w-full justify-start rounded-app-sm px-3 text-app-muted" icon={<LogOut />}>
            Sair
          </Button>
        </form>
      </div>
    </aside>
  )
}

function formatMonthly(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 }).format(value)
}
