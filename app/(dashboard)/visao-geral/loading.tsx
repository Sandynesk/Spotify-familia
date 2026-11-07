import { Skeleton } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div aria-label="Carregando insights" className="space-y-6 pb-8">
      <div className="flex items-center justify-between gap-4 py-4 lg:py-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-11 w-32 rounded-full" />
      </div>
      <div className="grid gap-4 xl:grid-cols-12">
        <Skeleton className="h-56 rounded-app xl:col-span-7" />
        <div className="grid grid-cols-2 gap-3 xl:col-span-5">
          {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-28 rounded-app" />)}
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-12">
        <Skeleton className="h-80 rounded-app xl:col-span-7" />
        <Skeleton className="h-80 rounded-app xl:col-span-5" />
      </div>
      <Skeleton className="h-72 rounded-app" />
      <div className="grid gap-4 xl:grid-cols-12">
        <Skeleton className="h-72 rounded-app xl:col-span-7" />
        <Skeleton className="h-72 rounded-app xl:col-span-5" />
      </div>
    </div>
  )
}
