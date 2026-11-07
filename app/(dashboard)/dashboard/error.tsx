'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function DashboardError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto max-w-xl rounded-app border border-app-line bg-app-surface px-6 py-10 text-center">
      <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-app-danger/10 text-app-danger">
        <AlertCircle aria-hidden className="h-6 w-6" />
      </span>
      <h2 className="text-lg font-semibold text-app-text">Hoje não carregou</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-app-muted">Tente de novo para atualizar os pagamentos e vencimentos.</p>
      <Button className="mt-5" variant="secondary" onClick={retry}>Tentar de novo</Button>
    </div>
  )
}
