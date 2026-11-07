'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronLeft, LogOut, Settings } from 'lucide-react'
import { SpotifyLogo } from '@/components/ui/SpotifyLogo'
import { createClient } from '@/lib/supabase/client'

interface HeaderProps {
  title?: string
  showBack?: boolean
}

export function Header({ title, showBack }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-20 border-b border-app-line bg-app-bg/80 backdrop-blur-md lg:hidden">
      <div className="flex h-14 items-center justify-between px-3">
        {/* Lado esquerdo: voltar ou logo + título */}
        <div className="flex min-w-0 items-center gap-2.5">
          {showBack ? (
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-11 w-11 items-center justify-center rounded-full text-app-muted transition-colors hover:bg-app-elevated hover:text-app-text"
              aria-label="Voltar"
            >
              <ChevronLeft className="h-6 w-6" strokeWidth={2} />
            </button>
          ) : (
            <div className="flex h-11 w-11 items-center justify-center">
              <SpotifyLogo size={28} color="#1DB954" />
            </div>
          )}
          <span className="truncate text-xl font-semibold tracking-tight text-app-text">
            {title || 'SpotiFamília'}
          </span>
        </div>

        {/* Lado direito: configurações + sair */}
        <div className="flex items-center gap-1">
          {pathname !== '/configuracoes' && (
            <Link
              href="/configuracoes"
              className="flex h-11 w-11 items-center justify-center rounded-full text-app-muted transition-colors hover:bg-app-elevated hover:text-app-text"
              aria-label="Configurações"
            >
              <Settings className="h-5 w-5" strokeWidth={1.75} />
            </Link>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="flex h-11 w-11 items-center justify-center rounded-full text-app-muted transition-colors hover:bg-app-elevated hover:text-app-text"
            aria-label="Sair da conta"
          >
            <LogOut className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </header>
  )
}
