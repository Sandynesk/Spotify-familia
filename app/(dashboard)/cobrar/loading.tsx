import { Skeleton } from '@/components/ui/Skeleton'

export default function CobrarLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Carregando cobranças">
      <div className="space-y-3 py-4">
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-4 w-60 max-w-full" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
        <div className="space-y-4 rounded-app border border-app-line bg-app-surface p-5 sm:p-7">
          <Skeleton className="h-4 w-28" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-14 w-14" rounded />
            <div className="flex-1 space-y-2"><Skeleton className="h-5 w-32" /><Skeleton className="h-4 w-24" /></div>
            <Skeleton className="h-8 w-20" />
          </div>
          <Skeleton className="h-28 w-full" />
          <div className="flex gap-2"><Skeleton className="h-11 flex-1" rounded /><Skeleton className="h-11 w-28" rounded /></div>
        </div>
        <div className="space-y-4">
          <div className="space-y-3 rounded-app border border-app-line bg-app-surface p-5"><Skeleton className="h-5 w-36" /><Skeleton className="h-24 w-full" /><Skeleton className="h-11 w-full" rounded /></div>
          <div className="space-y-3 rounded-app border border-app-line bg-app-surface p-5"><Skeleton className="h-5 w-40" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>
        </div>
      </div>
    </div>
  )
}
