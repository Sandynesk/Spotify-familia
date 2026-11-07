import { PageHeader } from '@/components/ui/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'

export default function LoadingPerfilMembro() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Carregando perfil do membro">
      <PageHeader title="Perfil do membro" subtitle="Carregando pagamentos e pontualidade" />
      <div className="grid grid-cols-[minmax(0,1fr)_92px] items-center gap-4 rounded-app border border-app-line bg-app-surface p-5 sm:p-7">
        <div className="flex items-center gap-3"><Skeleton className="h-16 w-16" rounded /><div className="flex-1 space-y-2"><Skeleton className="h-5 w-40" /><Skeleton className="h-4 w-28" /></div></div>
        <Skeleton className="h-[92px] w-[92px]" rounded />
        <Skeleton className="col-span-2 h-12 w-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-24" />)}</div>
      <Skeleton className="h-52 w-full" />
      <Skeleton className="h-80 w-full" />
    </div>
  )
}
