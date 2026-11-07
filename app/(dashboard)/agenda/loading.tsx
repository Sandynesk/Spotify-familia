import { Skeleton } from '@/components/ui/Skeleton'

export default function AgendaLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Carregando agenda">
      <div className="flex items-center justify-between gap-4 py-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-4 w-56 max-w-full" />
        </div>
        <Skeleton className="h-10 w-28 rounded-full" />
      </div>
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="space-y-4 rounded-app border border-app-line bg-app-surface p-4 lg:col-span-7">
          <div className="flex justify-between"><Skeleton className="h-5 w-36" /><Skeleton className="h-9 w-20 rounded-full" /></div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }, (_, index) => <Skeleton key={index} className="h-14 w-full rounded-app-xs" />)}
          </div>
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="space-y-3 rounded-app border border-app-line bg-app-surface p-4 lg:col-span-5">
          <Skeleton className="h-5 w-40" />
          {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-24 w-full" />)}
        </div>
      </div>
    </div>
  )
}
