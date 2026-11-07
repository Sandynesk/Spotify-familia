import { Skeleton } from '@/components/ui/Skeleton'
import { BrandMark } from '@/components/landing/BrandMark'

export default function RetrospectivaLoading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-app-bg px-4 py-6">
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[40px] border border-app-line bg-app-surface p-6 md:h-auto md:aspect-[9/16] md:max-h-[92dvh] md:max-w-[472px]">
        <div className="flex items-center justify-between">
          <BrandMark size={22} />
          <Skeleton className="h-11 w-11 rounded-full" />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <Skeleton className="h-28 w-28 rounded-full" />
          <Skeleton className="mt-8 h-3 w-36 rounded-full" />
          <Skeleton className="mt-5 h-24 w-64 rounded-[24px]" />
          <Skeleton className="mt-5 h-5 w-52 rounded-full" />
        </div>
        <Skeleton className="mx-auto h-[52px] w-full max-w-[260px] rounded-full" />
      </div>
    </div>
  )
}
