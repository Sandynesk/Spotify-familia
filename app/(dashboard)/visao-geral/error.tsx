'use client'

import { AlertCircle, RotateCcw } from 'lucide-react'
import { Button, Card } from '@/components/ui'

export default function InsightsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="py-12">
      <Card className="mx-auto max-w-lg p-6 text-center sm:p-8">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-app-danger/10 text-app-danger">
          <AlertCircle aria-hidden className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-app-text">Não foi possível abrir seus insights</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-app-muted">
          Seus dados não carregaram agora. Tente novamente em instantes.
        </p>
        <Button className="mt-6" onClick={reset} icon={<RotateCcw aria-hidden />}>
          Tentar de novo
        </Button>
      </Card>
    </div>
  )
}
