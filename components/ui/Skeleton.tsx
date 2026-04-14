interface SkeletonProps {
  className?: string
  rounded?: boolean
}

export function Skeleton({ className = '', rounded = false }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
      aria-hidden="true"
    />
  )
}

export function MemberRowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 bg-[#181818] rounded-lg">
      <Skeleton className="w-10 h-10" rounded />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
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
    <div className="bg-[#181818] rounded-lg p-4 space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-3 w-16" />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SummaryCardSkeleton key={i} />
        ))}
      </div>
      {/* Progress */}
      <div className="bg-[#181818] rounded-lg p-4 space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      {/* Members */}
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <MemberRowSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
