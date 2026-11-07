import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export default function MaisLoading() {
  return (
    <div className="space-y-6" aria-label="Carregando Mais">
      <div className="space-y-2 pt-3">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Card padding="lg" className="space-y-5">
        <div className="flex items-center gap-4">
          <Skeleton variant="circle" className="h-12 w-12" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-36" />
          </div>
          <Skeleton variant="circle" className="h-[76px] w-[76px]" />
        </div>
        <Skeleton className="h-12 w-full" />
      </Card>
      {[1, 2, 3].map((group) => (
        <div key={group} className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Card padding="none" className="divide-y divide-app-line overflow-hidden">
            {[1, 2, 3].slice(0, group === 1 ? 3 : 2).map((row) => (
              <div key={row} className="flex min-h-16 items-center gap-3 px-4">
                <Skeleton variant="circle" className="h-9 w-9" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-44" />
                </div>
              </div>
            ))}
          </Card>
        </div>
      ))}
    </div>
  )
}
