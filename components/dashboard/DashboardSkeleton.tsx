import { Skeleton } from '@/components/ui/Skeleton'

export function DashboardLocalSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Carregando Hoje">
      <div className="flex items-center justify-between py-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-11 w-11 rounded-full" />
          <Skeleton className="h-11 w-11 rounded-full" />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-8">
          <div className="space-y-6 rounded-app border border-app-line bg-app-surface p-5 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-3">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-12 w-56 max-w-full" />
                <Skeleton className="h-4 w-48 max-w-full" />
              </div>
              <Skeleton className="h-[72px] w-[72px] rounded-full" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>

          <div className="flex gap-2 overflow-hidden">
            {[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-11 w-36 shrink-0 rounded-full" />)}
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {[1, 2].map((card) => (
              <div key={card} className="space-y-3">
                <Skeleton className="h-4 w-40" />
                <div className="space-y-1 overflow-hidden rounded-app border border-app-line bg-app-surface p-3">
                  {[1, 2, 3].map((row) => (
                    <div key={row} className="flex min-h-[64px] items-center gap-3 border-b border-app-line last:border-0">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-8 w-16 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-5 lg:col-span-4">
          {[1, 2].map((card) => (
            <div key={card} className="space-y-4 rounded-app border border-app-line bg-app-surface p-4">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-12 w-full rounded-app-sm" />
              <Skeleton className="h-12 w-full rounded-app-sm" />
              {card === 1 && <Skeleton className="h-12 w-full rounded-app-sm" />}
            </div>
          ))}
        </aside>
      </div>
    </div>
  )
}
