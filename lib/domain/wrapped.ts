import type { MembroDominio, PagamentoDominio } from '../../types/domain'
// @ts-expect-error Node 24 exige extensão explícita para executar TypeScript nativo.
import { calcularPontualidade } from './pontualidade.ts'

export interface RetrospectivaPagamentoRapido {
  membroId: string
  nome: string
  mesReferencia: string
  horasEmRelacaoVencimento: number
}

export interface RetrospectivaMesDificil {
  mesReferencia: string
  previsto: number
  arrecadado: number
  taxaRecebimento: number
}

export interface CardRetrospectiva {
  id: string
  titulo: string
  valor: string | number
  descricao: string
}

export interface Retrospectiva {
  ano: number
  totalArrecadado: number
  mesesFechados: number
  membroMaisPontual: { membroId: string; nome: string; score: number } | null
  pagamentoMaisRapido: RetrospectivaPagamentoRapido | null
  mesMaisDificil: RetrospectivaMesDificil | null
  valorPlanoAnual: number
  suaParte: number
  economia: number
  estiloCobrador: string
  numerosParaCompartilhar: { totalArrecadado: number; mesesFechados: number; membros: number; economia: number }
  cards: CardRetrospectiva[]
}

function moeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor).replace(/\u00a0/g, ' ')
}

function chaveMes(ano: number, mes: number): string {
  return `${ano}-${String(mes).padStart(2, '0')}-01`
}

function arredondar(valor: number): number {
  return Number(valor.toFixed(2))
}

/**
 * Gera os dados para a retrospectiva anual: recebimentos, fechamento mensal,
 * pontualidade, maior antecedência, mês mais difícil e economia estimada.
 */
export function calcularRetrospectiva(input: {
  ano: number
  membros: MembroDominio[]
  pagamentos: PagamentoDominio[]
  valorPlano: number
}): Retrospectiva {
  const doAno = input.pagamentos.filter(p => Number(p.mes_referencia.slice(0, 4)) === input.ano)
  const pagos = doAno.filter(p => p.status === 'pago' && p.data_pagamento)
  const totalArrecadado = arredondar(pagos.reduce((soma, p) => soma + Number(p.valor), 0))
  const meses = Array.from({ length: 12 }, (_, index) => chaveMes(input.ano, index + 1))
  const mesesComDados = meses.map(mes => {
    const esperados = input.membros.filter(m => m.data_entrada.slice(0, 7) <= mes.slice(0, 7))
    const doMes = doAno.filter(p => p.mes_referencia.slice(0, 7) === mes.slice(0, 7))
    const previsto = doMes.reduce((soma, p) => soma + Number(p.valor), 0)
    const arrecadado = doMes.filter(p => p.status === 'pago').reduce((soma, p) => soma + Number(p.valor), 0)
    const esperado = esperados.length
    const fechou = esperado > 0 && doMes.filter(p => p.status === 'pago').length >= esperado
    return { mesReferencia: mes, previsto, arrecadado, esperado, fechou, taxaRecebimento: previsto > 0 ? Math.round((arrecadado / previsto) * 100) : 0 }
  }).filter(m => m.esperado > 0)
  const mesesFechados = mesesComDados.filter(m => m.fechou).length

  const resumoMembros = input.membros.map(membro => ({ membro, resumo: calcularPontualidade(membro, doAno.filter(p => p.membro_id === membro.id), new Date(Date.UTC(input.ano, 11, 31))) }))
    .filter(x => x.resumo.pagamentosAnalisados > 0)
    .sort((a, b) => b.resumo.scorePontualidade - a.resumo.scorePontualidade || a.membro.nome.localeCompare(b.membro.nome, 'pt-BR'))
  const membroMaisPontual = resumoMembros[0]
    ? { membroId: resumoMembros[0].membro.id, nome: resumoMembros[0].membro.nome, score: resumoMembros[0].resumo.scorePontualidade }
    : null

  const pagamentosRapidos = pagos.map(p => {
    const membro = input.membros.find(m => m.id === p.membro_id)
    if (!membro || !p.data_pagamento) return null
    const [ano, mes] = p.mes_referencia.slice(0, 7).split('-').map(Number)
    const vencimentoDia = Math.min(membro.dia_vencimento, new Date(Date.UTC(ano, mes, 0)).getUTCDate())
    const vencimento = Date.UTC(ano, mes - 1, vencimentoDia, 9)
    const pagamento = new Date(p.data_pagamento).getTime()
    return {
      membroId: membro.id,
      nome: membro.nome,
      mesReferencia: p.mes_referencia,
      horasEmRelacaoVencimento: Math.round((pagamento - vencimento) / 3_600_000),
    }
  }).filter((x): x is RetrospectivaPagamentoRapido => x !== null)
    .sort((a, b) => a.horasEmRelacaoVencimento - b.horasEmRelacaoVencimento)
  const pagamentoMaisRapido = pagamentosRapidos[0] ?? null

  const mesMaisDificil = [...mesesComDados].sort((a, b) => a.taxaRecebimento - b.taxaRecebimento || a.mesReferencia.localeCompare(b.mesReferencia))[0]
  const valorPlanoAnual = arredondar(input.valorPlano * 12)
  const suaParte = Math.max(0, arredondar(valorPlanoAnual - totalArrecadado))
  const economia = arredondar(valorPlanoAnual - suaParte)
  const taxaNoPrazo = resumoMembros.length ? resumoMembros.reduce((soma, item) => soma + item.resumo.percentualNoPrazo, 0) / resumoMembros.length : 0
  const estiloCobrador = mesesFechados >= 10 ? 'O maestro da organização' : taxaNoPrazo >= 85 ? 'O lembrete gentil' : totalArrecadado > 0 ? 'O persistente do PIX' : 'O cobrador em aquecimento'
  const dificuldade = mesMaisDificil ? { mesReferencia: mesMaisDificil.mesReferencia, previsto: arredondar(mesMaisDificil.previsto), arrecadado: arredondar(mesMaisDificil.arrecadado), taxaRecebimento: mesMaisDificil.taxaRecebimento } : null
  const cards: CardRetrospectiva[] = [
    { id: 'arrecadado', titulo: 'O que entrou', valor: moeda(totalArrecadado), descricao: `Você recebeu no total em ${input.ano}.` },
    { id: 'meses-fechados', titulo: 'Meses completos', valor: mesesFechados, descricao: 'Meses em que todos os pagamentos previstos foram recebidos.' },
    { id: 'mais-pontual', titulo: 'Pessoa mais pontual', valor: membroMaisPontual?.nome ?? 'Sem dados', descricao: membroMaisPontual ? `Score de pontualidade: ${membroMaisPontual.score}/100.` : 'Ainda não há pagamentos registrados.' },
    { id: 'pagamento-rapido', titulo: 'Pagamento mais rápido', valor: pagamentoMaisRapido?.nome ?? 'Sem dados', descricao: pagamentoMaisRapido ? `${Math.abs(pagamentoMaisRapido.horasEmRelacaoVencimento)} horas ${pagamentoMaisRapido.horasEmRelacaoVencimento < 0 ? 'antes' : 'depois'} do vencimento.` : 'Ainda não há pagamentos registrados.' },
    { id: 'mes-dificil', titulo: 'Mês mais difícil', valor: dificuldade?.mesReferencia ?? 'Sem dados', descricao: dificuldade ? `${dificuldade.taxaRecebimento}% do previsto foi recebido.` : 'Ainda não há cobranças registradas.' },
    { id: 'economia', titulo: 'Economia compartilhada', valor: moeda(economia), descricao: `Sua parte estimada do plano no ano foi ${moeda(suaParte)}.` },
    { id: 'estilo', titulo: 'Seu estilo de cobrador', valor: estiloCobrador, descricao: 'Uma leitura divertida baseada no histórico do ano.' },
  ]
  return {
    ano: input.ano,
    totalArrecadado,
    mesesFechados,
    membroMaisPontual,
    pagamentoMaisRapido,
    mesMaisDificil: dificuldade,
    valorPlanoAnual,
    suaParte,
    economia,
    estiloCobrador,
    numerosParaCompartilhar: { totalArrecadado, mesesFechados, membros: input.membros.length, economia },
    cards,
  }
}
