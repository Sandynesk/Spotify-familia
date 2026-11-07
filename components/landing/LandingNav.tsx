'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import { BrandMark } from './BrandMark'
import { LINKS } from './data'
import { cn } from '@/lib/utils'

export function LandingNav() {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const isPast = latest > 24
    setScrolled((prev) => (prev === isPast ? prev : isPast))
  })

  return (
    <nav
      aria-label="Principal"
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b px-6 transition-colors duration-300 motion-reduce:transition-none',
        scrolled
          ? 'border-white/[0.08] bg-black/72 backdrop-blur-xl backdrop-saturate-150'
          : 'border-transparent bg-transparent'
      )}
      style={{
        height: 'calc(52px + env(safe-area-inset-top, 0px))',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingLeft: 'max(24px, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(24px, env(safe-area-inset-right, 0px))',
      }}
    >
      <div className="mx-auto flex h-[52px] w-full max-w-[1200px] items-center justify-between">
        {/* Esquerda */}
        <div className="flex flex-1 items-center justify-start">
          <Link
            href="/"
            className="flex items-center rounded-sm text-[17px] text-white outline-none focus-visible:outline-2 focus-visible:outline-(--landing-accent) focus-visible:outline-offset-2"
          >
            <BrandMark size={20} className="text-[17px]" />
          </Link>
        </div>

        {/* Centro (≥ md) */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="#como-funciona"
            className="rounded-sm text-[13px] text-[#A1A1A6] transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-(--landing-accent) focus-visible:outline-offset-2"
          >
            Como funciona
          </Link>
          <Link
            href="#detalhes"
            className="rounded-sm text-[13px] text-[#A1A1A6] transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-(--landing-accent) focus-visible:outline-offset-2"
          >
            Detalhes
          </Link>
        </div>

        {/* Direita */}
        <div className="flex flex-1 items-center justify-end gap-4">
          <Link
            href="/demo"
            className="hidden xl:inline-flex items-center rounded-sm text-[13px] text-[#A1A1A6] transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-(--landing-accent) focus-visible:outline-offset-2"
          >
            Experimentar sem cadastro
          </Link>
          <Link
            href={LINKS.login}
            className="hidden min-[400px]:inline-flex items-center rounded-sm text-[13px] text-[#A1A1A6] transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-(--landing-accent) focus-visible:outline-offset-2"
          >
            Entrar
          </Link>
          <Link
            href={LINKS.cadastro}
            className="inline-flex h-8 shrink-0 items-center justify-center rounded-full bg-(--landing-accent) px-4 text-[13px] font-semibold text-black whitespace-nowrap transition-opacity hover:opacity-90 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-(--landing-accent) focus-visible:outline-offset-2"
          >
            Começar grátis
          </Link>
        </div>
      </div>
    </nav>
  )
}
