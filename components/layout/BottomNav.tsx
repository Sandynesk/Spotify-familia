'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import { ChartNoAxesColumnIncreasing, House, Menu, MessageCircleMore, UsersRound } from 'lucide-react'
import { cn } from '@/lib/utils'
import { springs } from '@/components/ui/motion'

const tabs = [
  { href: '/dashboard', label: 'Hoje', icon: House },
  { href: '/membros', label: 'Membros', icon: UsersRound },
  { href: '/cobrar', label: 'Cobrar', icon: MessageCircleMore },
  { href: '/visao-geral', label: 'Insights', icon: ChartNoAxesColumnIncreasing },
  { href: '/mais', label: 'Mais', icon: Menu },
]

/** Floating mobile navigation with a shared spring indicator. */
export function BottomNav() {
  const pathname = usePathname()
  const reducedMotion = useReducedMotion()
  const activeHref = activeTab(pathname)

  return (
    <nav
      className="app-glass fixed bottom-[max(12px,env(safe-area-inset-bottom))] left-3 right-3 max-w-[calc(100vw-24px)] mx-auto z-40 rounded-[28px] px-1.5 pb-1.5 pt-1.5 shadow-app-float lg:hidden select-none"
      aria-label="Navegação móvel"
    >
      <div className="grid grid-cols-5">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = href === activeHref
          return (
            <Link
              href={href}
              key={href}
              aria-current={active ? 'page' : undefined}
              className={cn('relative flex min-h-[54px] min-w-0 flex-col items-center justify-center gap-1 rounded-[22px] px-1 text-[10px] font-medium leading-none transition-colors', active ? 'text-app-accent' : 'text-app-muted hover:text-app-text')}
            >
              {active && <motion.span aria-hidden layoutId="mobile-nav-active" className="absolute inset-0 rounded-[22px] bg-app-elevated/85" transition={reducedMotion ? { duration: 0 } : springs.snappy} />}
              <Icon aria-hidden className="relative z-[1] h-5 w-5 shrink-0" strokeWidth={active ? 2 : 1.75} />
              <span className="relative z-[1] truncate">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

function activeTab(pathname: string): string {
  if (pathname === '/dashboard' || pathname === '/') return '/dashboard'
  if (pathname.startsWith('/membros')) return '/membros'
  if (pathname.startsWith('/cobrar')) return '/cobrar'
  if (pathname.startsWith('/visao-geral')) return '/visao-geral'
  return '/mais'
}
