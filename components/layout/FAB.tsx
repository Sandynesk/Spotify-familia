'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plus } from 'lucide-react'

export function FAB() {
  const pathname = usePathname()

  // Esconder FAB em configurações e telas de formulário de membro
  const isHidden =
    pathname === '/configuracoes' ||
    pathname.startsWith('/configuracoes') ||
    pathname === '/membros/novo' ||
    /^\/membros\/[^/]+\/editar/.test(pathname)

  if (isHidden) {
    return null
  }

  return (
    <Link
      href="/membros/novo"
      className="
        fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4 z-40 lg:hidden
        w-14 h-14 bg-app-accent hover:bg-app-accent-hover text-black
        rounded-full flex items-center justify-center
        shadow-lg shadow-black/60
        active:scale-95 transition-all duration-200
        fab-pulse
      "
      aria-label="Adicionar membro"
    >
      <Plus className="w-6 h-6 stroke-[2.5]" />
    </Link>
  )
}
