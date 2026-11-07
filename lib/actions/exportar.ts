'use server'

import { createClient } from '@/lib/supabase/server'
import { garantirPagamentos } from '@/lib/utils/payments'
import { getEffectiveStatus } from '@/lib/utils/date'
import { gerarCsv } from '@/lib/domain/csv'
import type { Membro, Pagamento } from '@/types/database'

/** Exporta os dados do usuário em CSV UTF-8 compatível com Excel pt-BR. */
export async function exportarCsv(tipo: 'pagamentos' | 'membros', ano: number = new Date().getFullYear()): Promise<{ nome: string; conteudo: string } | { error: string }> {
  if (tipo !== 'pagamentos' && tipo !== 'membros') return { error: 'Tipo de exportação inválido' }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }
  await garantirPagamentos(supabase, user.id)
  const { data: membros, error } = await supabase.from('membros').select('*').eq('user_id', user.id).order('nome')
  if (error) return { error: error.message }
  const membrosLista = (membros ?? []) as Membro[]
  if (tipo === 'membros') {
    const linhas = membrosLista.map(m => ({ id: m.id, nome: m.nome, email: m.email ?? '', telefone: m.telefone ?? '', valor_mensal: Number(m.valor_mensal), dia_vencimento: m.dia_vencimento, ativo: m.ativo ? 'Sim' : 'Não', data_entrada: m.data_entrada }))
    return {
      nome: 'spotifamilia-membros.csv',
      conteudo: gerarCsv(linhas, [
        { chave: 'id', titulo: 'ID' }, { chave: 'nome', titulo: 'Nome' }, { chave: 'email', titulo: 'E-mail' },
        { chave: 'telefone', titulo: 'Telefone' }, { chave: 'valor_mensal', titulo: 'Valor mensal' },
        { chave: 'dia_vencimento', titulo: 'Dia de vencimento' }, { chave: 'ativo', titulo: 'Ativo' }, { chave: 'data_entrada', titulo: 'Data de entrada' },
      ]),
    }
  }
  const ids = membrosLista.map(m => m.id)
  const { data: pagamentos, error: pagamentosError } = ids.length
    ? await supabase.from('pagamentos').select('*').in('membro_id', ids).gte('mes_referencia', `${ano}-01-01`).lt('mes_referencia', `${ano + 1}-01-01`).order('mes_referencia')
    : { data: [], error: null }
  if (pagamentosError) return { error: pagamentosError.message }
  const nomes = new Map(membrosLista.map(m => [m.id, m.nome]))
  const linhas = ((pagamentos ?? []) as Pagamento[]).map(p => ({
    id: p.id,
    membro: nomes.get(p.membro_id) ?? '',
    mes_referencia: p.mes_referencia,
    valor: Number(p.valor),
    status: getEffectiveStatus(p.mes_referencia, p.status),
    data_pagamento: p.data_pagamento ?? '',
    observacao: p.observacao ?? '',
  }))
  return {
    nome: `spotifamilia-pagamentos-${ano}.csv`,
    conteudo: gerarCsv(linhas, [
      { chave: 'id', titulo: 'ID' }, { chave: 'membro', titulo: 'Membro' }, { chave: 'mes_referencia', titulo: 'Mês de referência' },
      { chave: 'valor', titulo: 'Valor' }, { chave: 'status', titulo: 'Status' }, { chave: 'data_pagamento', titulo: 'Data do pagamento' },
      { chave: 'observacao', titulo: 'Observação' },
    ]),
  }
}
