import { Skeleton } from '@/components/ui/Skeleton'

export default function HistoricoLoading() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Carregando histórico">
      <div className="space-y-2 py-4">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-4 rounded-app border border-app-line bg-app-surface p-5">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
      <div className="space-y-4 rounded-app border border-app-line bg-app-surface p-4">
        <Skeleton className="h-11 w-full rounded-full" />
        <Skeleton className="h-10 w-36" />
        <div className="flex gap-2"><Skeleton className="h-10 w-20 rounded-full" /><Skeleton className="h-10 w-28 rounded-full" /><Skeleton className="h-10 w-24 rounded-full" /></div>
      </div>
      <section className="space-y-3">
        <Skeleton className="h-4 w-20" />
        {Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-20 w-full" />)}
      </section>
    </div>
  )
}
