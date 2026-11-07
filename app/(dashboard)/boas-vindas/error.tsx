'use client'

import { Button, Card } from '@/components/ui'

export default function BoasVindasError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Card padding="lg" className="mx-auto mt-8 max-w-xl text-center">
      <h2 className="text-lg font-semibold text-app-text">Não foi possível abrir a introdução</h2>
      <p className="mt-2 text-sm text-app-muted">Tente novamente para continuar organizando seu plano.</p>
      <Button className="mt-5" onClick={reset}>Tentar de novo</Button>
    </Card>
  )
}
