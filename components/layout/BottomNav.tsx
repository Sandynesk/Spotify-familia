'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Calendar, History } from 'lucide-react'

const navItems = [
  { href: '/dashboard',   label: 'Início',      icon: LayoutDashboard },
  { href: '/membros',     label: 'Membros',     icon: Users },
  { href: '/visao-geral', label: 'Visão Geral', icon: Calendar },
  { href: '/historico',   label: 'Histórico',   icon: History },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-app-line bg-app-bg/80 backdrop-blur-md pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      aria-label="Navegação principal"
    >
      <div className="flex items-center justify-around px-2 pt-1.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-xl
                transition-colors min-h-[44px] min-w-[56px]
                ${isActive
                  ? 'text-app-accent'
                  : 'text-app-muted hover:text-app-text'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className="w-5 h-5 flex-shrink-0"
                strokeWidth={isActive ? 2.5 : 1.75}
              />
              <span className="text-xs font-medium leading-none">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
