'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, History, Calendar } from 'lucide-react'

const navItems = [
  { href: '/dashboard',        label: 'Home',      icon: LayoutDashboard },
  { href: '/membros', label: 'Membros',   icon: Users },
  { href: '/visao-geral', label: 'Visão Geral', icon: Calendar },
  { href: '/historico', label: 'Histórico', icon: History },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#0a0a0a]/95 backdrop-blur-md border-t border-white/5">
      <div className="flex items-center justify-around px-2 py-2 safe-area-pb">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex flex-col items-center gap-1 px-4 py-2 rounded-xl
                transition-all duration-200 min-w-[64px]
                ${isActive
                  ? 'text-[#1DB954]'
                  : 'text-[#535353] hover:text-[#B3B3B3]'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
