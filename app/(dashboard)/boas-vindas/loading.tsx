import { Skeleton } from '@/components/ui/Skeleton'

export default function BoasVindasLoading() {
  return (
    <div className="space-y-5" aria-label="Carregando introdução">
      <div className="space-y-2 py-5">
        <Skeleton className="h-10 w-52 rounded-app-sm" />
        <Skeleton className="h-4 w-64 max-w-full rounded-app-sm" />
      </div>
      <Skeleton className="h-24 w-full rounded-app" />
      <Skeleton className="h-[420px] w-full rounded-app" />
    </div>
  )
}
