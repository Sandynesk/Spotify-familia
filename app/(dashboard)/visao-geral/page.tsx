import { PageHeader } from '@/components/ui/PageHeader'
import { OverviewYearSwitcher } from '@/components/dashboard/OverviewYearSwitcher'
import { InsightsDashboard } from '@/components/insights/InsightsDashboard'
import { getDashboardData } from '@/lib/actions/pagamentos'
import { getInsightsData } from '@/lib/actions/insights'
import { calcularPontualidade } from '@/lib/domain/pontualidade'
import {
  previsaoProximosMeses,
  ranking as criarRanking,
  taxaDeRecebimento,
  tempoMedioParaReceber,
} from '@/lib/domain/insights'

interface PageProps {
  searchParams: Promise<{ ano?: string | string[] }>
}

function parseYear(rawYear: string | string[] | undefined, currentYear: number): number {
  const value = Array.isArray(rawYear) ? rawYear[0] : rawYear
  if (!value || !/^\d{4}$/.test(value)) return currentYear

  const year = Number(value)
  return year >= 2000 && year <= currentYear ? year : currentYear
}

export default async function VisaoGeralPage({ searchParams }: PageProps) {
  const params = await searchParams
  const currentYear = new Date().getFullYear()
  const ano = parseYear(params.ano, currentYear)

  const [data, dashboard] = await Promise.all([
    getInsightsData(ano),
    getDashboardData(),
  ])

  if ('error' in data) throw new Error(data.error)
  if (!dashboard) throw new Error('Não foi possível carregar o resumo do mês atual.')

  const mesesConsiderados = ano < currentYear ? 12 : new Date().getMonth() + 1
  const ultimoMesConsiderado = mesesConsiderados
    ? `${ano}-${String(mesesConsiderados).padStart(2, '0')}`
    : `${ano}-00`
  const pagamentosNoPeriodo = data.pagamentos.filter(
    pagamento => pagamento.mes_referencia.slice(0, 7) <= ultimoMesConsiderado,
  )
  const arrecadado = pagamentosNoPeriodo
    .filter(pagamento => pagamento.status === 'pago')
    .reduce((total, pagamento) => total + Number(pagamento.valor), 0)
  const saldoAcumulado = Number((arrecadado - data.saldo.valorPlano * mesesConsiderados).toFixed(2))

  const mesesFechados = Array.from({ length: mesesConsiderados }, (_, index) => {
    const mes = `${ano}-${String(index + 1).padStart(2, '0')}`
    const membrosNoPlano = data.membros.filter(membro => membro.data_entrada.slice(0, 7) <= mes)
    if (membrosNoPlano.length === 0) return false

    return membrosNoPlano.every(membro => data.pagamentos.some(pagamento =>
      pagamento.membro_id === membro.id &&
      pagamento.mes_referencia.slice(0, 7) === mes &&
      pagamento.status === 'pago',
    ))
  }).filter(Boolean).length

  const dataPontualidade = new Date(Date.UTC(ano, 11, 31, 12))
  const ranking = criarRanking(data.membros, data.pagamentos, dataPontualidade).map(item => {
    const membro = data.membros.find(candidato => candidato.id === item.membroId)
    const pontualidade = membro
      ? calcularPontualidade(membro, data.pagamentos, dataPontualidade)
      : null

    return {
      ...item,
      selos: pontualidade?.selos ?? [],
      pagamentosAnalisados: pontualidade?.pagamentosAnalisados ?? 0,
    }
  })

  const previsao = previsaoProximosMeses(data.membros, 3)
  const emAbertoAgora = Math.max(0, dashboard.summary.totalAReceber - dashboard.summary.totalPago)

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Insights"
        subtitle="A saúde do seu plano e a pontualidade de cada pessoa."
        actions={<OverviewYearSwitcher ano={ano} />}
      />

      <InsightsDashboard
        ano={ano}
        membros={data.membros}
        pagamentos={data.pagamentos}
        serie={data.serie}
        valorPlano={data.saldo.valorPlano}
        saldo={saldoAcumulado}
        arrecadado={arrecadado}
        taxaRecebimento={taxaDeRecebimento(pagamentosNoPeriodo)}
        tempoMedio={tempoMedioParaReceber(data.membros, pagamentosNoPeriodo)}
        mesesFechados={mesesFechados}
        emAbertoAgora={emAbertoAgora}
        ranking={ranking}
        previsao={previsao}
      />
    </div>
  )
}
