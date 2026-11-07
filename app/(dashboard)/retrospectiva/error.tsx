'use client'

import Link from 'next/link'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function RetrospectivaError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-app-bg px-5 py-8 font-app text-app-text">
      <div className="w-full max-w-md rounded-[28px] border border-app-line bg-app-surface p-7 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-app-danger/10 text-app-danger">
          <AlertTriangle className="h-6 w-6" aria-hidden />
        </span>
        <h1 className="mt-5 text-2xl font-semibold tracking-[-0.04em]">Não conseguimos abrir sua retrospectiva</h1>
        <p className="mt-2 text-sm leading-relaxed text-app-muted">Seus dados continuam seguros. Tente carregar de novo ou volte para Insights.</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button type="button" icon={<RotateCcw />} onClick={reset}>Tentar de novo</Button>
          <Link href="/visao-geral" className="inline-flex min-h-11 items-center justify-center rounded-full border border-app-line bg-app-elevated px-5 text-sm font-semibold text-app-text transition-colors hover:bg-app-raised">
            Voltar para Insights
          </Link>
        </div>
      </div>
    </div>
  )
}
