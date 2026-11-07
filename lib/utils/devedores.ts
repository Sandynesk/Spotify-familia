import type { Devedor, Membro, Pagamento, ResumoCusto } from '@/types/database'

export function calcularDevedores(membros: Membro[], pagamentos: Pagamento[], mesAtual: string): Devedor[] {
  const ativos = new Map(membros.filter(m => m.ativo).map(m => [m.id, m]))
  const agrupado = new Map<string, Pagamento[]>()
  for (const p of pagamentos) {
    if (p.status === 'pago' || p.mes_referencia > mesAtual || !ativos.has(p.membro_id)) continue
    agrupado.set(p.membro_id, [...(agrupado.get(p.membro_id) ?? []), p])
  }
  return [...agrupado].map(([id, ps]) => {
    const membro = ativos.get(id)!
    const meses = ps.map(p => p.mes_referencia).sort()
    return { membro, meses, total: ps.reduce((s, p) => s + Number(p.valor), 0), temAtraso: meses.some(m => m < mesAtual) }
  }).sort((a, b) => Number(b.temAtraso) - Number(a.temAtraso) || b.total - a.total || a.membro.nome.localeCompare(b.membro.nome, 'pt-BR'))
}

export function calcularResumoCusto(pagamentos: Pagamento[], mesAtual: string, valorPlano: number | null): ResumoCusto {
  const doMes = pagamentos.filter(p => p.mes_referencia === mesAtual)
  const previstoMes = doMes.reduce((s, p) => s + Number(p.valor), 0)
  const arrecadadoMes = doMes.filter(p => p.status === 'pago').reduce((s, p) => s + Number(p.valor), 0)
  return { valorPlano, previstoMes, arrecadadoMes, diferenca: valorPlano === null ? null : previstoMes - Number(valorPlano) }
}
