import { PageHeader } from '@/components/ui/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'

export default function LoadingMembros() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Carregando membros">
      <PageHeader title="Membros" subtitle="Carregando suas vagas" actions={<Skeleton className="h-11 w-24 rounded-full" />} />
      <div className="flex items-center gap-4 rounded-app border border-app-line bg-app-surface p-4">
        <Skeleton className="h-[54px] w-[54px]" rounded />
        <Skeleton className="h-12 flex-1" />
      </div>
      <Skeleton className="h-11 w-full rounded-full" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="min-h-52 space-y-4 rounded-app border border-app-line bg-app-surface p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10" rounded />
              <div className="flex-1 space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-24" /></div>
            </div>
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
