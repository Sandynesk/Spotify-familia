import { PageHeader } from '@/components/ui/PageHeader'
import { AddCalendarButton } from '@/components/agenda/AddCalendarButton'
import { AgendaCalendar } from '@/components/agenda/AgendaCalendar'
import { UpcomingList } from '@/components/agenda/UpcomingList'
import { getAgendaPageData } from '@/lib/actions/agenda'

export const dynamic = 'force-dynamic'

export default async function AgendaPage() {
  const data = await getAgendaPageData()
  if ('error' in data) throw new Error(data.error)

  const nextDue = data.upcoming.find((item) => item.dataVencimento >= data.today)
  const subtitle = nextDue
    ? `Próximo vencimento: ${nextDue.nome.split(' ')[0]}, dia ${Number(nextDue.dataVencimento.slice(-2))}`
    : 'Nenhum vencimento nos próximos 30 dias'
  const [year, month] = data.today.split('-')
  const initialMonth = `${year}-${month}`

  return (
    <div className="space-y-5 pb-8 sm:space-y-6">
      <PageHeader title="Agenda" subtitle={subtitle} actions={<AddCalendarButton />} />
      <div className="grid min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-12 lg:gap-6">
        <div className="min-w-0 lg:col-span-7">
          <AgendaCalendar members={data.members} payments={data.payments} initialMonth={initialMonth} today={data.today} />
        </div>
        <div className="min-w-0 lg:col-span-5">
          <UpcomingList upcoming={data.upcoming} today={data.today} hasMembers={data.members.length > 0} />
        </div>
      </div>
    </div>
  )
}
