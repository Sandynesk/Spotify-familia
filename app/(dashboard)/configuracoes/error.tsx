'use client'

import { Button, Card } from '@/components/ui'

export default function ConfiguracoesError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Card padding="lg" className="mx-auto mt-8 max-w-xl text-center">
      <h2 className="text-lg font-semibold text-app-text">Não foi possível carregar as configurações</h2>
      <p className="mt-2 text-sm text-app-muted">Tente novamente. Seus dados continuam protegidos.</p>
      <Button className="mt-5" onClick={reset}>Tentar de novo</Button>
    </Card>
  )
}
