import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { BrandSymbol } from '@/components/landing/BrandMark'
import { Card } from '@/components/ui/Card'

export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[62dvh] items-center justify-center py-10">
      <Card variant="hero" padding="lg" className="w-full max-w-lg overflow-hidden text-center sm:p-9">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] border border-app-line bg-app-surface/80 shadow-app-float">
          <BrandSymbol size={34} />
        </span>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-app-accent">404 · rota perdida</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-app-text sm:text-[30px]">Essa página não existe</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-app-muted">O endereço pode ter mudado. Volte para Hoje e continue de onde parou.</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-app-accent px-5 text-sm font-semibold text-app-accent-ink transition-colors hover:bg-app-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent"
        >
          <ArrowLeft aria-hidden className="h-4 w-4" />
          Voltar para Hoje
        </Link>
      </Card>
    </div>
  )
}
