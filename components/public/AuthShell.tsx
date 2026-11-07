import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowUpRight, LockKeyhole } from 'lucide-react'
import { BrandMark } from '@/components/landing/BrandMark'
import { AuthPreview } from '@/components/public/AuthPreview'

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-app-bg font-app text-app-text">
      <div aria-hidden="true" className="pointer-events-none absolute -top-64 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-app-accent/10 blur-[150px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-80 -right-48 h-[520px] w-[520px] rounded-full bg-app-info/[0.06] blur-[160px]" />

      <header className="relative z-10 mx-auto flex w-full max-w-[1320px] items-center justify-between px-5 pt-[max(env(safe-area-inset-top),16px)] sm:px-8 lg:px-10">
        <Link href="/" aria-label="SpotiFamília, página inicial" className="inline-flex min-h-11 items-center rounded-sm">
          <BrandMark size={28} />
        </Link>
        <Link href="/" className="inline-flex min-h-11 items-center gap-1.5 rounded-sm text-sm text-app-muted transition-colors hover:text-app-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent">
          Voltar ao site <ArrowUpRight aria-hidden className="h-4 w-4" />
        </Link>
      </header>

      <div className="relative z-10 mx-auto grid w-full max-w-[1320px] flex-1 grid-cols-1 items-center gap-10 px-5 pb-12 pt-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(400px,480px)] lg:gap-16 lg:px-10 lg:py-12">
        <aside className="hidden min-w-0 flex-col justify-center lg:flex">
          <div className="mb-7 max-w-[620px]">
            <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-app-accent">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-app-accent shadow-[0_0_14px_var(--color-app-accent)]" />
              Seu plano, sob controle
            </p>
            <h2 className="text-[clamp(38px,4vw,58px)] font-semibold leading-[1.04] tracking-[-0.045em] text-app-text">
              Seis vagas.<br />
              <span className="text-app-accent">Um mês em ordem.</span>
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-app-muted">
              Saiba quem já pagou, o que falta receber e quando cada pessoa vence — tudo num só lugar.
            </p>
          </div>

          <AuthPreview />

          <p className="mt-4 flex items-center gap-2 text-xs text-app-subtle">
            <LockKeyhole aria-hidden className="h-4 w-4 text-app-muted" />
            Acesso seguro à sua organização familiar.
          </p>
        </aside>

        <section className="mx-auto w-full max-w-[480px] min-w-0" aria-label="Acesso à sua conta">
          {children}
        </section>
      </div>
    </main>
  )
}
