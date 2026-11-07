'use client'

import { Button } from '@/components/ui/Button'

export default function CobrarError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="mx-auto flex max-w-lg flex-col items-center gap-3 rounded-app border border-app-line bg-app-surface px-6 py-10 text-center">
      <h1 className="text-lg font-semibold text-app-text">Não foi possível carregar as cobranças</h1>
      <p className="text-sm text-app-muted">Tente novamente em instantes.</p>
      <Button onClick={reset}>Tentar de novo</Button>
    </section>
  )
}
