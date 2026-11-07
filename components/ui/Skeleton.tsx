import { cn } from '@/lib/utils'

export interface SkeletonProps {
  className?: string
  rounded?: boolean
  variant?: 'text' | 'circle' | 'rect'
}

/** Loading placeholder; size and shape come from the supplied utility classes. */
export function Skeleton({ className = '', rounded = false, variant = 'rect' }: SkeletonProps) {
  return (
    <div
      className={cn('skeleton', variant === 'circle' || rounded ? 'rounded-full' : variant === 'text' ? 'rounded-sm' : 'rounded-app-xs', className)}
      aria-hidden="true"
    />
  )
}

export function MemberRowSkeleton() {
  return (
    <div className="flex min-h-16 items-center gap-3 rounded-app border border-app-line bg-app-surface p-4" aria-busy="true">
      <Skeleton className="h-10 w-10" rounded />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48 max-w-full" />
      </div>
      <div className="flex flex-col items-end gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </div>
  )
}

export function SummaryCardSkeleton() {
  return (
    <div className="space-y-3 rounded-app border border-app-line bg-app-surface p-4" aria-busy="true">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-3 w-16" />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Carregando painel">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => <SummaryCardSkeleton key={index} />)}
      </div>
      <div className="space-y-3 rounded-app border border-app-line bg-app-surface p-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      <div className="space-y-2">{Array.from({ length: 5 }).map((_, index) => <MemberRowSkeleton key={index} />)}</div>
    </div>
  )
}
