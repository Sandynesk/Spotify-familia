import { Skeleton } from '@/components/ui/Skeleton'

export default function ConfiguracoesLoading() {
  return (
    <div className="space-y-6" aria-label="Carregando configurações">
      <div className="space-y-2 py-5">
        <Skeleton className="h-10 w-56 rounded-app-sm" />
        <Skeleton className="h-4 w-72 max-w-full rounded-app-sm" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="h-4 w-28 rounded-app-sm" />
            <Skeleton className="h-56 w-full rounded-app" />
          </div>
        ))}
      </div>
    </div>
  )
}
