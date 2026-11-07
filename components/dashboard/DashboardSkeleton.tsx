import { Skeleton } from '@/components/ui/Skeleton'

export function DashboardLocalSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Carregando painel">
      {/* 1. Cabeçalho do mês */}
      <div className="space-y-3">
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-4 w-60" />
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>

      {/* 2. Card devedores */}
      <div className="space-y-4 rounded-[var(--radius-app)] border border-app-line bg-app-surface p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-5 w-8 rounded-full" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <Skeleton className="h-10 w-10" rounded />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-40" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-11 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Botão do relatório */}
      <Skeleton className="h-11 w-full rounded-full" />

      {/* 4. Card de custo */}
      <div className="rounded-[var(--radius-app)] border border-app-line bg-app-surface p-4">
        <Skeleton className="h-5 w-3/4" />
      </div>

      {/* 5. Lista de membros */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex min-h-[44px] items-center gap-3 rounded-[var(--radius-app-sm)] border border-app-line bg-app-surface p-3.5 sm:p-4"
            >
              <Skeleton className="h-10 w-10" rounded />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-11 w-11 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
