import Link from 'next/link'
import { Plus } from 'lucide-react'
import { ArchivedMembers } from '@/components/members/ArchivedMembers'
import { MemberDirectory } from '@/components/members/MemberDirectory'
import { PageHeader } from '@/components/ui/PageHeader'
import { getMembrosArquivados } from '@/lib/actions/membros'
import { getMembrosComPagamentos } from '@/lib/actions/membros-extra'
import { getCurrentMonthISO } from '@/lib/utils/date'
import { calcularPontualidade } from '@/lib/domain/pontualidade'
import type { Membro } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function MembrosPage() {
  const [lista, arquivados] = await Promise.all([
    getMembrosComPagamentos(),
    getMembrosArquivados().catch(() => [] as Membro[]),
  ])

  if ('error' in lista) throw new Error(lista.error)

  const mesAtual = getCurrentMonthISO()
  const itens = lista.membros
    .map((membro) => {
      const pagamentos = lista.pagamentos.filter((pagamento) => pagamento.membro_id === membro.id)
      const pagamento = pagamentos.find((item) => item.mes_referencia === mesAtual) ?? null
      return {
        membro,
        pagamento,
        pontualidade: calcularPontualidade(membro, pagamentos),
      }
    })
    .sort((a, b) => {
      const ordem = { atrasado: 0, pendente: 1, pago: 2 }
      const statusA = a.pagamento?.status ?? 'pendente'
      const statusB = b.pagamento?.status ?? 'pendente'
      return ordem[statusA] - ordem[statusB] || a.membro.nome.localeCompare(b.membro.nome, 'pt-BR')
    })

  const vagasOcupadas = Math.min(itens.length + 1, 6)
  const vagasPagas = itens.filter((item) => item.pagamento?.status === 'pago').length + 1

  return (
    <div className="space-y-6 pb-4">
      <PageHeader
        title="Membros"
        subtitle={`${vagasOcupadas} de 6 vagas ocupadas`}
        actions={(
          <Link
            href="/membros/novo"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-app-accent px-5 text-sm font-semibold text-app-accent-ink transition-colors hover:bg-app-accent-hover"
          >
            <Plus aria-hidden className="h-4 w-4" /> Novo
          </Link>
        )}
      />

      <MemberDirectory membros={itens} vagasOcupadas={vagasOcupadas} vagasPagas={vagasPagas} />

      {arquivados.length > 0 && (
        <section aria-label="Membros arquivados" className="pt-2">
          <ArchivedMembers membros={arquivados} />
        </section>
      )}
    </div>
  )
}
