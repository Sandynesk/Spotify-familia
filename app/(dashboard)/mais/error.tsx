'use client'

import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function MaisError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <Card className="mx-auto mt-10 max-w-lg text-center" padding="lg">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-app-danger/10 text-app-danger">
        <AlertCircle aria-hidden className="h-6 w-6" />
      </span>
      <h1 className="mt-4 text-lg font-semibold text-app-text">Não foi possível abrir esta página</h1>
      <p className="mt-2 text-sm text-app-muted">Tente de novo em instantes.</p>
      <Button type="button" onClick={retry} className="mt-5">Tentar de novo</Button>
    </Card>
  )
}
