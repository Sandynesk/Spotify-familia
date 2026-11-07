import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { BrandMark } from '@/components/landing/BrandMark'
import { SpotifyShowcase, SpotifyShowcaseCompact } from '@/components/auth/SpotifyShowcase'

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative isolate flex min-h-dvh flex-col overflow-x-clip bg-app-bg font-app text-app-text">
      {/* Ambient background glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[850px] -translate-x-1/2 rounded-full bg-app-accent/[0.08] blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-60 -right-32 h-[450px] w-[450px] rounded-full bg-emerald-500/[0.05] blur-[150px]"
      />

      {/* Top navigation header */}
      <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-5 pt-[max(env(safe-area-inset-top),16px)] sm:px-8">
        <Link
          href="/"
          aria-label="SpotiFamília, página inicial"
          className="inline-flex min-h-11 items-center rounded-sm transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent"
        >
          <BrandMark size={28} />
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-1 text-xs text-app-muted transition-colors hover:text-app-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent"
        >
          Voltar ao início <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
        </Link>
      </header>

      {/* Main split content */}
      <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 items-center gap-8 px-5 pb-12 pt-4 sm:px-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(380px,440px)] lg:gap-14 lg:py-10">
        {/* Desktop Showcase (Vinyl + Soundwave + Proof) */}
        <aside className="hidden min-w-0 flex-col items-center justify-center lg:flex">
          <SpotifyShowcase />
        </aside>

        {/* Form Section */}
        <section className="mx-auto w-full max-w-[420px] min-w-0" aria-label="Acesso à sua conta">
          {/* Mobile Showcase Header */}
          <div className="relative mx-auto mb-6 w-full max-w-[340px] lg:hidden">
            <SpotifyShowcaseCompact />
          </div>

          {children}
        </section>
      </div>
    </main>
  )
}
