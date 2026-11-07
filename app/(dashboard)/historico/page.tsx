import { PageHeader } from '@/components/ui/PageHeader'
import { Timeline } from '@/components/historico/Timeline'
import { getHistoricoPageData } from '@/lib/actions/agenda'

export const dynamic = 'force-dynamic'

export default async function HistoricoPage() {
  const data = await getHistoricoPageData()
  if ('error' in data) throw new Error(data.error)

  return (
    <div className="space-y-5 pb-8 sm:space-y-6">
      <PageHeader title="Histórico" subtitle="Pagamentos e mudanças no plano, em ordem cronológica." />
      <Timeline events={data.events} members={data.members} today={data.today} />
    </div>
  )
}
