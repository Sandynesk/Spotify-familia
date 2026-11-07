import type { EventoAtividade, MembroDominio, PagamentoDominio } from '../../types/domain'

function isoDia(ano: number, mes: number, dia: number): string {
  return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}T12:00:00.000Z`
}

/** Deriva uma linha do tempo de entradas, pagamentos, atrasos e arquivamentos. */
export function linhaDoTempo(membros: MembroDominio[], pagamentos: PagamentoDominio[], limite: number): EventoAtividade[] {
  const eventos: EventoAtividade[] = []
  const porId = new Map(membros.map(m => [m.id, m]))
  const hoje = new Date()
  const hojeDia = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
  for (const membro of membros) {
    const entrada = new Date(membro.data_entrada)
    if (!Number.isNaN(entrada.getTime())) eventos.push({ id: `entrou:${membro.id}`, tipo: 'entrou', data: entrada.toISOString(), membroId: membro.id, membro: membro.nome, valor: null })
    if (!membro.ativo && membro.updated_at) {
      const atualizado = new Date(membro.updated_at)
      if (!Number.isNaN(atualizado.getTime())) eventos.push({ id: `arquivado:${membro.id}`, tipo: 'arquivado', data: atualizado.toISOString(), membroId: membro.id, membro: membro.nome, valor: null })
    }
  }
  for (const pagamento of pagamentos) {
    const membro = porId.get(pagamento.membro_id)
    if (!membro) continue
    if (pagamento.status === 'pago' && pagamento.data_pagamento) {
      eventos.push({ id: `pagou:${pagamento.id}`, tipo: 'pagou', data: pagamento.data_pagamento, membroId: membro.id, membro: membro.nome, valor: Number(pagamento.valor), mesReferencia: pagamento.mes_referencia })
      continue
    }
    const [ano, mes] = pagamento.mes_referencia.slice(0, 7).split('-').map(Number)
    const dia = Math.min(membro.dia_vencimento, new Date(Date.UTC(ano, mes, 0)).getUTCDate())
    const vencimentoUTC = Date.UTC(ano, mes - 1, dia)
    if (pagamento.status === 'atrasado' || vencimentoUTC < hojeDia) {
      eventos.push({ id: `atrasou:${pagamento.id}`, tipo: 'atrasou', data: isoDia(ano, mes, dia), membroId: membro.id, membro: membro.nome, valor: Number(pagamento.valor), mesReferencia: pagamento.mes_referencia })
    }
  }
  return eventos.sort((a, b) => b.data.localeCompare(a.data) || a.membro.localeCompare(b.membro, 'pt-BR'))
    .slice(0, Math.max(0, Math.floor(limite)))
}
