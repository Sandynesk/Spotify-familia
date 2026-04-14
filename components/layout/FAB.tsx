'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'

export function FAB() {
  return (
    <Link
      href="/membros/novo"
      className="
        fixed bottom-20 right-5 z-40 lg:hidden
        w-14 h-14 bg-[#1DB954] hover:bg-[#1ed760]
        rounded-full flex items-center justify-center
        shadow-lg shadow-black/40
        active:scale-95 transition-all duration-200
        fab-pulse
      "
      aria-label="Adicionar membro"
    >
      <Plus className="w-7 h-7 text-black font-bold" strokeWidth={2.5} />
    </Link>
  )
}
