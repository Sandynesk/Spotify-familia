'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import {
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Clock3,
  House,
  LogOut,
  Menu,
  MessageCircleMore,
  Search,
  Settings2,
  Sparkles,
  UsersRound,
} from 'lucide-react'
import { BrandMark } from '@/components/landing/BrandMark'
import { Button } from '@/components/ui/Button'
import { Kbd } from '@/components/ui/Kbd'
import { useCommandPalette } from '@/components/command/CommandPaletteProvider'
import { cn } from '@/lib/utils'
import { springs } from '@/components/ui/motion'

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
      { href: '/retrospectiva', label: 'Retrospectiva', icon: Sparkles },
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
  const reducedMotion = useReducedMotion()

  return (
    <aside
      className={cn(
        'sticky z-30 hidden w-[268px] shrink-0 flex-col border-r border-app-line bg-app-surface/90 px-3.5 py-4 font-app backdrop-blur-2xl lg:flex select-none',
        demo ? 'top-[53px] h-[calc(100dvh-53px)]' : 'top-0 h-dvh',
      )}
    >
      <div className="px-2 pb-3 pt-1">
        <Link
          href="/dashboard"
          aria-label="SpotiFamília, ir para Hoje"
          className="inline-flex rounded-lg transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent"
        >
          <BrandMark size={26} />
        </Link>
      </div>

      <div className="px-1 pb-3">
        <Button
          type="button"
          variant="glass"
          size="sm"
          className="h-9 w-full justify-start rounded-app-xs px-2.5 text-xs font-normal text-app-muted hover:text-app-text"
          icon={<Search className="h-3.5 w-3.5" />}
          data-command-trigger
          onClick={openPalette}
        >
          <span className="flex flex-1 items-center justify-between gap-2">
            <span>Buscar</span>
            <span className="inline-flex items-center gap-1">
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </span>
          </span>
        </Button>
      </div>

      <nav
        className="min-h-0 flex-1 space-y-3.5 overflow-y-auto scrollbar-none px-1 select-none"
        aria-label="Navegação lateral"
      >
        {groups.map((group) => (
          <section key={group.label}>
            <h2 className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-app-subtle select-none">
              {group.label}
            </h2>
            <ul className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = href === '/dashboard' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'group relative flex h-9.5 min-h-[38px] items-center gap-3 rounded-app-xs px-3 text-xs font-medium transition-colors select-none',
                        active ? 'text-app-text font-semibold' : 'text-app-muted hover:text-app-text hover:bg-app-elevated/50',
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="sidebar-active-indicator"
                          className="absolute inset-0 rounded-app-xs bg-app-elevated border border-app-line/80 shadow-xs"
                          transition={reducedMotion ? { duration: 0 } : springs.snappy}
                        />
                      )}
                      {active && (
                        <motion.span
                          layoutId="sidebar-active-accent"
                          className="absolute left-1 top-2 bottom-2 w-1 rounded-full bg-app-accent shadow-[0_0_8px_rgba(72,229,178,0.5)]"
                          transition={reducedMotion ? { duration: 0 } : springs.snappy}
                        />
                      )}
                      <Icon
                        aria-hidden
                        className={cn(
                          'relative z-[1] h-4 w-4 shrink-0 transition-colors',
                          active ? 'text-app-accent' : 'text-app-subtle group-hover:text-app-muted',
                        )}
                        strokeWidth={active ? 2 : 1.75}
                      />
                      <span className="relative z-[1] truncate whitespace-nowrap">{label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </nav>

      <div className="mt-auto border-t border-app-line/70 pt-3 select-none">
        <div className="group relative overflow-hidden rounded-app-xs border border-app-line bg-app-elevated/60 p-3 transition-colors hover:bg-app-elevated/90">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-app-muted">Plano Família</span>
            <span className="tabular font-semibold text-app-text">{monthlyValue == null ? '—' : formatMonthly(monthlyValue)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-app-subtle">
            <span>{occupiedSlots} de 6 vagas usadas</span>
            <span className="font-semibold text-app-accent">{Math.round((occupiedSlots / 6) * 100)}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-app-raised">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-app-accent to-emerald-400 transition-[width] duration-500 ease-out"
              style={{ width: `${Math.max(0, Math.min(occupiedSlots, 6)) / 6 * 100}%` }}
            />
          </div>
        </div>
        <form action="/sair" method="post" className="mt-2">
          <button
            type="submit"
            className="flex h-8 w-full items-center gap-2 rounded-app-xs px-2.5 text-xs font-medium text-app-muted transition-colors hover:bg-app-elevated/80 hover:text-app-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent"
          >
            <LogOut className="h-3.5 w-3.5 shrink-0 text-app-subtle" />
            <span>Sair da conta</span>
          </button>
        </form>
      </div>
    </aside>
  )
}

function formatMonthly(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 }).format(value)
}
