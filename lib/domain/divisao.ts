import type { DivisaoPlano, ItemReajuste, MembroDominio } from '../../types/domain'

function centavos(valor: number): number {
  return Math.round(valor * 100)
}

function repartir(totalCentavos: number, pesos: number[]): number[] {
  if (!pesos.length) return []
  const somaPesos = pesos.reduce((soma, p) => soma + p, 0)
  const normalizados = somaPesos > 0 ? pesos : pesos.map(() => 1)
  const totalNormalizado = somaPesos > 0 ? somaPesos : pesos.length
  const fatias = normalizados.map((peso, indice) => {
    const preciso = totalCentavos * peso / totalNormalizado
    return { indice, base: Math.floor(preciso), resto: preciso - Math.floor(preciso) }
  })
  let centavosRestantes = totalCentavos - fatias.reduce((soma, f) => soma + f.base, 0)
  for (const fatia of [...fatias].sort((a, b) => b.resto - a.resto || a.indice - b.indice)) {
    if (centavosRestantes <= 0) break
    fatia.base++
    centavosRestantes--
  }
  return fatias.sort((a, b) => a.indice - b.indice).map(f => f.base)
}

/**
 * Simula a divisão igualitária. `pessoas` conta os participantes além do dono;
 * com `donoPaga`, o dono entra como participante adicional. `cima10` arredonda
 * cada cota para cima ao próximo múltiplo de R$ 10.
 */
export function dividirPlano(
  valorPlano: number,
  pessoas: number | MembroDominio[],
  opcoes: { donoPaga?: boolean; arredondar?: 'centavo' | 'cima10' } = {},
): DivisaoPlano {
  if (!Number.isFinite(valorPlano) || valorPlano < 0) throw new Error('Valor do plano inválido')
  const quantidade = Math.max(0, Math.floor(typeof pessoas === 'number' ? pessoas : pessoas.length))
  const donoPaga = opcoes.donoPaga ?? false
  const quantidadePagantes = quantidade + (donoPaga ? 1 : 0)
  const totalCentavos = centavos(valorPlano)
  if (!quantidadePagantes) return { valorPlano, quantidadePagantes: 0, donoPaga, valores: [], totalCobrado: 0, parteDono: 0, sobra: 0 }
  let valoresCentavos: number[]
  if (opcoes.arredondar === 'cima10') {
    const cota = Math.ceil((valorPlano / quantidadePagantes) / 10) * 1000
    valoresCentavos = Array.from({ length: quantidadePagantes }, () => cota)
  } else {
    valoresCentavos = repartir(totalCentavos, Array.from({ length: quantidadePagantes }, () => 1))
  }
  const valores = valoresCentavos.map(c => c / 100)
  const totalCobrado = valores.reduce((soma, valor) => soma + valor, 0)
  return { valorPlano, quantidadePagantes, donoPaga, valores, totalCobrado: Number(totalCobrado.toFixed(2)), parteDono: donoPaga ? valores[0] : 0, sobra: Number((totalCobrado - valorPlano).toFixed(2)) }
}

/**
 * Reparte um novo valor entre membros ativos. A estratégia proporcional mantém
 * a relação atual entre as mensalidades; centavos restantes vão aos maiores restos.
 */
export function reajuste(
  membros: MembroDominio[],
  novoValorPlano: number,
  estrategia: 'igual' | 'proporcional',
): ItemReajuste[] {
  if (!Number.isFinite(novoValorPlano) || novoValorPlano < 0) throw new Error('Novo valor inválido')
  const ativos = membros.filter(m => m.ativo)
  if (!ativos.length) return []
  const pesos = estrategia === 'igual' ? ativos.map(() => 1) : ativos.map(m => Math.max(0, Number(m.valor_mensal)))
  const valores = repartir(centavos(novoValorPlano), pesos)
  return ativos.map((membro, indice) => {
    const novoValor = valores[indice] / 100
    return { membroId: membro.id, nome: membro.nome, valorAnterior: Number(membro.valor_mensal), novoValor, diferenca: Number((novoValor - Number(membro.valor_mensal)).toFixed(2)) }
  })
}
