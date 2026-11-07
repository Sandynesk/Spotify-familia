import type { MembroDominio, PagamentoDominio, ResumoPontualidade, Selo } from '../../types/domain'

const DIA_MS = 86_400_000

function inicioDoDiaUTC(data: string | Date): number {
  const d = data instanceof Date ? data : new Date(data)
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}

function mesIndice(mes: string): number {
  const [ano, numero] = mes.slice(0, 7).split('-').map(Number)
  return ano * 12 + numero - 1
}

function chaveMes(indice: number): string {
  const ano = Math.floor(indice / 12)
  const mes = (indice % 12) + 1
  return `${ano}-${String(mes).padStart(2, '0')}-01`
}

function diasNoMes(mes: string): number {
  const [ano, numero] = mes.slice(0, 7).split('-').map(Number)
  return new Date(Date.UTC(ano, numero, 0)).getUTCDate()
}

/** Diferença em dias corridos entre o dia do pagamento e o vencimento do mês. */
export function diasDeAtraso(pagamento: PagamentoDominio, membro: Pick<MembroDominio, 'dia_vencimento'>): number | null {
  if (pagamento.status !== 'pago' || !pagamento.data_pagamento) return null
  const vencimentoDia = Math.min(Math.max(1, membro.dia_vencimento), diasNoMes(pagamento.mes_referencia))
  const vencimento = `${pagamento.mes_referencia.slice(0, 7)}-${String(vencimentoDia).padStart(2, '0')}`
  return Math.round((inicioDoDiaUTC(pagamento.data_pagamento) - inicioDoDiaUTC(vencimento)) / DIA_MS)
}

function mesesEntre(inicio: string, fim: Date): number {
  const inicioData = new Date(`${inicio.slice(0, 10)}T00:00:00Z`)
  return (fim.getUTCFullYear() - inicioData.getUTCFullYear()) * 12 + fim.getUTCMonth() - inicioData.getUTCMonth()
}

/**
 * Resume a pontualidade do membro. O score é a média ponderada dos pagamentos
 * dos últimos 12 meses: cada mês pontual vale 100 e cada dia de atraso desconta
 * 5 pontos (até zero); os meses recentes pesam mais (12 para o mês atual, até 1).
 */
export function calcularPontualidade(
  membro: MembroDominio,
  pagamentos: PagamentoDominio[],
  hoje: Date = new Date(),
): ResumoPontualidade {
  const hojeUTC = inicioDoDiaUTC(hoje)
  const mesAtual = `${hoje.getUTCFullYear()}-${String(hoje.getUTCMonth() + 1).padStart(2, '0')}-01`
  const pagos = pagamentos
    .filter(p => p.membro_id === membro.id && p.status === 'pago' && p.data_pagamento)
    .map(p => ({ pagamento: p, atraso: diasDeAtraso(p, membro) ?? 0 }))
    .sort((a, b) => a.pagamento.mes_referencia.localeCompare(b.pagamento.mes_referencia))

  const ponderados = pagos.filter(x => mesIndice(mesAtual) - mesIndice(x.pagamento.mes_referencia) < 12)
  const somaPesos = ponderados.reduce((soma, x) => soma + Math.max(1, 12 - Math.max(0, mesIndice(mesAtual) - mesIndice(x.pagamento.mes_referencia))), 0)
  const scorePontualidade = somaPesos === 0 ? 0 : Math.round(ponderados.reduce((soma, x) => {
    const peso = Math.max(1, 12 - Math.max(0, mesIndice(mesAtual) - mesIndice(x.pagamento.mes_referencia)))
    const pontos = x.atraso <= 0 ? 100 : Math.max(0, 100 - x.atraso * 5)
    return soma + pontos * peso
  }, 0) / somaPesos)
  const mediaDiasAtraso = pagos.length ? Number((pagos.reduce((soma, x) => soma + x.atraso, 0) / pagos.length).toFixed(1)) : null
  const percentualNoPrazo = pagos.length ? Math.round((pagos.filter(x => x.atraso <= 0).length / pagos.length) * 100) : 0

  const porMes = new Map(pagamentos.filter(p => p.membro_id === membro.id).map(p => [p.mes_referencia.slice(0, 7) + '-01', p]))
  let sequenciaAtual = 0
  for (let indice = mesIndice(mesAtual); ; indice--) {
    const pagamento = porMes.get(chaveMes(indice))
    if (!pagamento || pagamento.status !== 'pago' || (diasDeAtraso(pagamento, membro) ?? 1) > 0) break
    sequenciaAtual++
  }

  let maiorSequencia = 0
  let atual = 0
  let sequenciaRelampago = 0
  let maiorRelampago = 0
  let anterior: number | null = null
  for (const item of pagos) {
    const indice = mesIndice(item.pagamento.mes_referencia)
    if (anterior !== null && indice === anterior + 1 && item.atraso <= 0) atual++
    else atual = item.atraso <= 0 ? 1 : 0
    maiorSequencia = Math.max(maiorSequencia, atual)
    if (anterior !== null && indice === anterior + 1 && item.atraso < 0) sequenciaRelampago++
    else sequenciaRelampago = item.atraso < 0 ? 1 : 0
    maiorRelampago = Math.max(maiorRelampago, sequenciaRelampago)
    anterior = indice
  }

  const abertos = pagamentos.some(p => p.membro_id === membro.id && p.status !== 'pago' && p.mes_referencia <= mesAtual)
  const dataEntrada = new Date(`${membro.data_entrada.slice(0, 10)}T00:00:00Z`)
  const mesesNoPlano = Number.isNaN(dataEntrada.getTime()) ? 0 : mesesEntre(membro.data_entrada, hoje)
  const marcoRecente = hojeUTC - 30 * DIA_MS
  const recuperou = pagos.some(x => x.atraso > 0 && inicioDoDiaUTC(x.pagamento.data_pagamento!) >= marcoRecente)
  const selos: Selo[] = []
  if (maiorRelampago >= 3) selos.push({ id: 'relampago', titulo: 'Relâmpago', descricao: 'Pagou antes do vencimento por 3 meses seguidos.', icone: 'Zap' })
  if (maiorSequencia >= 6) selos.push({ id: 'pontual', titulo: 'Pontual', descricao: 'Manteve 6 meses seguidos de pagamentos no prazo.', icone: 'Target' })
  if (!abertos) selos.push({ id: 'em-dia', titulo: 'Em dia', descricao: 'Não tem cobranças em aberto até este mês.', icone: 'CircleCheck' })
  if (mesesNoPlano >= 12) selos.push({ id: 'fiel', titulo: 'Fiel', descricao: 'Está no plano há pelo menos 12 meses.', icone: 'Heart' })
  if (recuperou) selos.push({ id: 'recuperado', titulo: 'Recuperado', descricao: 'Quitou um pagamento atrasado nos últimos 30 dias.', icone: 'TrendingUp' })
  return { membroId: membro.id, scorePontualidade, mediaDiasAtraso, percentualNoPrazo, sequenciaAtual, maiorSequencia, selos, pagamentosAnalisados: pagos.length }
}
