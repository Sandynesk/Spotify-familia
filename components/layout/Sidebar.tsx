'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, History, LogOut, Music2 } from 'lucide-react'
import { SpotifyLogo } from '@/components/ui/SpotifyLogo'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/membros',   label: 'Membros',    icon: Users },
  { href: '/historico', label: 'Histórico',  icon: History },
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

  return (
    <aside className="hidden lg:flex flex-col w-64 fixed left-0 top-0 h-full bg-[#0a0a0a] border-r border-white/5 z-30">
      {/* Logo */}
      <div className="p-6 pb-4">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <SpotifyLogo size={32} color="#1DB954" className="group-hover:scale-110 transition-transform duration-300" />
          <div>
            <span className="font-bold text-white text-base">SpotiFamília</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-[#282828] text-white'
                  : 'text-[#B3B3B3] hover:text-white hover:bg-[#181818]'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[#1DB954]' : ''}`}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              {label}
              {isActive && (
                <div className="ml-auto w-1 h-4 bg-[#1DB954] rounded-full" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sm text-[#B3B3B3] hover:text-white hover:bg-[#181818] transition-all duration-200"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
          Sair
        </button>
      </div>
    </aside>
  )
}
