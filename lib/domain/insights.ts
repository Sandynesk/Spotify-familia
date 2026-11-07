import type { MembroDominio, PagamentoDominio } from '../../types/domain'
// @ts-expect-error Node 24 exige extensão explícita para executar TypeScript nativo.
import { calcularPontualidade } from './pontualidade.ts'

export interface ItemSerieMensal {
  mesReferencia: string
  previsto: number
  arrecadado: number
}

export interface SaldoPlano {
  valorPlano: number
  previstoMes: number
  arrecadadoMes: number
  sobraPrevista: number
  sobraAtual: number
  faltaPrevista: number
  faltaAtual: number
}

export interface PrevisaoMensal {
  mesReferencia: string
  previsto: number
  membros: number
}

export interface ItemRanking {
  membroId: string
  nome: string
  valorArrecadado: number
  pagamentosPagos: number
  pagamentosEmAberto: number
  scorePontualidade: number
}

export interface ResumoAno {
  ano: number
  previsto: number
  arrecadado: number
  pendente: number
  taxaRecebimento: number
  pagamentos: number
  pagamentosPagos: number
  membrosAtivos: number
}

/** Agrupa as cobranças por mês; previsto inclui todas e arrecadado só as pagas. */
export function serieMensal(pagamentos: PagamentoDominio[], meses: string[]): ItemSerieMensal[] {
  return meses.map(mes => {
    const doMes = pagamentos.filter(p => p.mes_referencia.slice(0, 7) === mes.slice(0, 7))
    return {
      mesReferencia: `${mes.slice(0, 7)}-01`,
      previsto: doMes.reduce((soma, p) => soma + Number(p.valor), 0),
      arrecadado: doMes.filter(p => p.status === 'pago').reduce((soma, p) => soma + Number(p.valor), 0),
    }
  })
}

/** Calcula o saldo do plano em cenário previsto e com o valor já recebido. */
export function saldoDoPlano(input: { valorPlano: number; previstoMes: number; arrecadadoMes: number }): SaldoPlano {
  const sobraPrevista = Number((input.previstoMes - input.valorPlano).toFixed(2))
  const sobraAtual = Number((input.arrecadadoMes - input.valorPlano).toFixed(2))
  return {
    valorPlano: input.valorPlano,
    previstoMes: input.previstoMes,
    arrecadadoMes: input.arrecadadoMes,
    sobraPrevista,
    sobraAtual,
    faltaPrevista: Math.max(0, -sobraPrevista),
    faltaAtual: Math.max(0, -sobraAtual),
  }
}

/** Prevê o valor contratado para os próximos `n` meses, começando no mês seguinte. */
export function previsaoProximosMeses(membros: MembroDominio[], n: number, hoje: Date = new Date()): PrevisaoMensal[] {
  const ativos = membros.filter(m => m.ativo)
  const inicio = hoje.getFullYear() * 12 + hoje.getMonth() + 1
  return Array.from({ length: Math.max(0, Math.floor(n)) }, (_, offset) => {
    const indice = inicio + offset
    const ano = Math.floor(indice / 12)
    const mes = (indice % 12) + 1
    return {
      mesReferencia: `${ano}-${String(mes).padStart(2, '0')}-01`,
      previsto: Number(ativos.reduce((soma, m) => soma + Number(m.valor_mensal), 0).toFixed(2)),
      membros: ativos.length,
    }
  })
}

/** Ordena membros por score, depois por valor recebido e por nome. */
export function ranking(membros: MembroDominio[], pagamentos: PagamentoDominio[], hoje: Date = new Date()): ItemRanking[] {
  return membros.map(membro => {
    const doMembro = pagamentos.filter(p => p.membro_id === membro.id)
    return {
      membroId: membro.id,
      nome: membro.nome,
      valorArrecadado: doMembro.filter(p => p.status === 'pago').reduce((soma, p) => soma + Number(p.valor), 0),
      pagamentosPagos: doMembro.filter(p => p.status === 'pago').length,
      pagamentosEmAberto: doMembro.filter(p => p.status !== 'pago').length,
      scorePontualidade: calcularPontualidade(membro, doMembro, hoje).scorePontualidade,
    }
  }).sort((a, b) => b.scorePontualidade - a.scorePontualidade || b.valorArrecadado - a.valorArrecadado || a.nome.localeCompare(b.nome, 'pt-BR'))
}

/** Taxa percentual de valores recebidos sobre todos os valores lançados. */
export function taxaDeRecebimento(pagamentos: PagamentoDominio[]): number {
  const previsto = pagamentos.reduce((soma, p) => soma + Number(p.valor), 0)
  if (previsto <= 0) return 0
  const arrecadado = pagamentos.filter(p => p.status === 'pago').reduce((soma, p) => soma + Number(p.valor), 0)
  return Math.round((arrecadado / previsto) * 100)
}

/**
 * Média de dias entre o vencimento (dia cadastrado do membro) e o recebimento.
 * Resultado negativo indica que, em média, os pagamentos chegam adiantados.
 */
export function tempoMedioParaReceber(membros: MembroDominio[], pagamentos: PagamentoDominio[]): number | null {
  const atrasos = membros.flatMap(m => pagamentos.filter(p => p.membro_id === m.id).map(p => diasDePagamento(p, m)))
    .filter((n): n is number => n !== null)
  return atrasos.length ? Number((atrasos.reduce((s, n) => s + n, 0) / atrasos.length).toFixed(1)) : null
}

function diasDePagamento(pagamento: PagamentoDominio, membro: Pick<MembroDominio, 'dia_vencimento'>): number | null {
  if (pagamento.status !== 'pago' || !pagamento.data_pagamento) return null
  const [ano, mes] = pagamento.mes_referencia.slice(0, 7).split('-').map(Number)
  const ultimoDia = new Date(Date.UTC(ano, mes, 0)).getUTCDate()
  const vencimento = Date.UTC(ano, mes - 1, Math.min(membro.dia_vencimento, ultimoDia))
  const data = new Date(pagamento.data_pagamento)
  const pagamentoDia = Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate())
  return Math.round((pagamentoDia - vencimento) / 86_400_000)
}

/** Consolida os pagamentos e membros para o ano informado. */
export function resumoDoAno(membros: MembroDominio[], pagamentos: PagamentoDominio[], ano: number): ResumoAno {
  const doAno = pagamentos.filter(p => Number(p.mes_referencia.slice(0, 4)) === ano)
  const previsto = doAno.reduce((s, p) => s + Number(p.valor), 0)
  const arrecadado = doAno.filter(p => p.status === 'pago').reduce((s, p) => s + Number(p.valor), 0)
  const emDia = doAno.filter(p => p.status === 'pago')
  return {
    ano,
    previsto: Number(previsto.toFixed(2)),
    arrecadado: Number(arrecadado.toFixed(2)),
    pendente: Number((previsto - arrecadado).toFixed(2)),
    taxaRecebimento: taxaDeRecebimento(doAno),
    pagamentos: doAno.length,
    pagamentosPagos: emDia.length,
    membrosAtivos: membros.filter(m => m.ativo).length,
  }
}
