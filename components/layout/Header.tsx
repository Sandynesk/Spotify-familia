'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { SpotifyLogo } from '@/components/ui/SpotifyLogo'
import { createClient } from '@/lib/supabase/client'

interface HeaderProps {
  title?: string
  showBack?: boolean
}

export function Header({ title, showBack }: HeaderProps) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  async function checkAuthStatus() {
    try {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
    } catch (error) {
      console.error('Auth check failed:', error)
      setIsAuthenticated(false)
    }
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-20 bg-[#121212]/90 backdrop-blur-md border-b border-white/5 lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          {showBack ? (
            <button
              onClick={() => router.back()}
              className="text-[#B3B3B3] hover:text-white transition-colors p-1"
              aria-label="Voltar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <SpotifyLogo size={28} color="#1DB954" />
          )}
          <span className="font-bold text-white text-2xl tracking-[-0.5px]">
            {title || 'SpotiFamília'}
          </span>
        </div>

        {!showBack && isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="text-[#B3B3B3] hover:text-white transition-colors p-1"
            aria-label="Sair da conta"
          >
            <LogOut className="w-5 h-5" strokeWidth={1.5} />
          </button>
        ) : !showBack && !isAuthenticated ? (
          <a
            href="/login"
            className="text-[#1DB954] hover:text-white transition-colors p-1 font-medium"
            aria-label="Entrar"
          >
            Entrar
          </a>
        ) : null}
      </div>
    </header>
  )
}
