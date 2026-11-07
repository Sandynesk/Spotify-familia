import { PageHeader } from '@/components/ui/PageHeader'
import { CentralCobranca } from '@/components/cobranca/CentralCobranca'
import { getCobrancaData } from '@/lib/actions/cobranca'
import { getDadosAuxiliaresCobranca } from '@/lib/actions/cobrar'
import { getRelatorio } from '@/lib/actions/relatorio'
import { getConfiguracoes } from '@/lib/actions/configuracoes'
import { formatCurrency } from '@/lib/utils/currency'
import { getCurrentMonthISO } from '@/lib/utils/date'

export const dynamic = 'force-dynamic'

interface CobrarPageProps {
  searchParams: Promise<{ membro?: string | string[] }>
}

export default async function CobrarPage({ searchParams }: CobrarPageProps) {
  const params = await searchParams
  const membroInicial = Array.isArray(params.membro) ? params.membro[0] : params.membro
  const [cobrancaResult, auxiliaresResult, relatorioResult, configuracoes] = await Promise.all([
    getCobrancaData(),
    getDadosAuxiliaresCobranca(),
    getRelatorio(),
    getConfiguracoes(),
  ])

  const cobrancas = 'error' in cobrancaResult ? [] : cobrancaResult.cobrancas
  const dadosAuxiliares = 'data' in auxiliaresResult ? auxiliaresResult.data : { pagamentoIdsPorMembro: {}, recentes: [] }
  const mensagemGrupo = 'texto' in relatorioResult ? relatorioResult.texto : ''
  const erro = 'error' in cobrancaResult
    ? cobrancaResult.error
    : 'error' in auxiliaresResult
      ? auxiliaresResult.error
      : undefined
  const erroGrupo = 'error' in relatorioResult ? relatorioResult.error : undefined
  const totalAberto = cobrancas.reduce((total, cobranca) => total + cobranca.total, 0)
  const quantidade = cobrancas.length
  const subtitulo = quantidade
    ? `${quantidade} ${quantidade === 1 ? 'pessoa' : 'pessoas'} · ${formatCurrency(totalAberto)} em aberto`
    : 'Tudo em dia por aqui'

  return (
    <div className="space-y-5 pb-6 sm:space-y-7">
      <PageHeader title="Cobrar" subtitle={subtitulo} />
      <CentralCobranca
        cobrancas={cobrancas}
        pagamentoIdsPorMembro={dadosAuxiliares.pagamentoIdsPorMembro}
        recentes={dadosAuxiliares.recentes}
        mensagemGrupo={mensagemGrupo}
        erroGrupo={erroGrupo}
        chavePixConfigurada={Boolean(configuracoes?.chave_pix)}
        mesReferencia={getCurrentMonthISO()}
        membroInicial={membroInicial}
        erro={erro}
      />
    </div>
  )
}
