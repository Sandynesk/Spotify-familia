'use client'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function PerfilMembroError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <Card className="mx-auto max-w-xl text-center" role="alert" data-has-error={Boolean(error)}>
      <h2 className="text-lg font-semibold text-app-text">Não foi possível carregar este perfil</h2>
      <p className="mt-2 text-sm text-app-muted">Tente novamente em instantes.</p>
      <Button type="button" onClick={retry} className="mt-5">Tentar de novo</Button>
    </Card>
  )
}
