'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, Calendar, History, Settings, LogOut } from 'lucide-react'
import { SpotifyLogo } from '@/components/ui/SpotifyLogo'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/dashboard',   label: 'Início',      icon: LayoutDashboard },
  { href: '/membros',     label: 'Membros',     icon: Users },
  { href: '/visao-geral', label: 'Visão Geral', icon: Calendar },
  { href: '/historico',   label: 'Histórico',   icon: History },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isConfiguracoesActive = pathname.startsWith('/configuracoes')

  return (
    <aside className="hidden lg:flex flex-col w-64 fixed left-0 top-0 h-full bg-app-surface border-r border-app-line z-30 font-app">
      {/* Logo */}
      <div className="p-6 pb-4">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <SpotifyLogo size={32} color="#1DB954" className="group-hover:scale-105 transition-transform duration-200" />
          <div>
            <span className="font-semibold text-app-text text-base tracking-tight">SpotiFamília</span>
          </div>
        </Link>
      </div>

      {/* Navegação principal */}
      <nav className="flex-1 px-3 space-y-1" aria-label="Navegação da barra lateral">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-3 px-3.5 py-2.5 rounded-[var(--radius-app-sm)] min-h-[44px]
                text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-app-elevated text-app-text'
                  : 'text-app-muted hover:text-app-text hover:bg-app-elevated/50'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-app-accent' : ''}`}
                strokeWidth={isActive ? 2.5 : 1.75}
              />
              <span>{label}</span>
              {isActive && (
                <div className="ml-auto w-1 h-4 bg-app-accent rounded-full" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Configurações + Sair */}
      <div className="p-3 border-t border-app-line space-y-1">
        <Link
          href="/configuracoes"
          className={`
            flex items-center gap-3 px-3.5 py-2.5 rounded-[var(--radius-app-sm)] min-h-[44px]
            text-sm font-medium transition-colors
            ${isConfiguracoesActive
              ? 'bg-app-elevated text-app-text'
              : 'text-app-muted hover:text-app-text hover:bg-app-elevated/50'
            }
          `}
          aria-current={isConfiguracoesActive ? 'page' : undefined}
        >
          <Settings
            className={`w-5 h-5 flex-shrink-0 ${isConfiguracoesActive ? 'text-app-accent' : ''}`}
            strokeWidth={isConfiguracoesActive ? 2.5 : 1.75}
          />
          <span>Configurações</span>
          {isConfiguracoesActive && (
            <div className="ml-auto w-1 h-4 bg-app-accent rounded-full" />
          )}
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-[var(--radius-app-sm)] w-full min-h-[44px] text-sm font-medium text-app-muted hover:text-app-text hover:bg-app-elevated/50 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" strokeWidth={1.75} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}
