'use client'

import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function HistoricoError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Card className="my-8 text-center" padding="lg">
      <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-app-danger/10 text-app-danger"><AlertCircle aria-hidden className="h-6 w-6" /></span>
      <h1 className="mt-4 text-lg font-semibold text-app-text">Não foi possível carregar o histórico</h1>
      <p className="mx-auto mt-2 max-w-sm text-sm text-app-muted">Tente novamente para buscar as atividades do plano.</p>
      <Button variant="secondary" className="mt-5" onClick={reset}>Tentar de novo</Button>
    </Card>
  )
}
