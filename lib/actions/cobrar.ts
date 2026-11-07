'use server'

import { createClient } from '@/lib/supabase/server'
import { garantirPagamentos } from '@/lib/utils/payments'
import { getCurrentMonthISO } from '@/lib/utils/date'

export interface PagamentoRecenteCobranca {
  id: string
  membroId: string
  nome: string
  corAvatar: string | null
  mesReferencia: string
  valor: number
  dataPagamento: string
}

export interface DadosAuxiliaresCobranca {
  pagamentoIdsPorMembro: Record<string, string[]>
  recentes: PagamentoRecenteCobranca[]
}

/** IDs das parcelas abertas por pessoa e os cinco pagamentos mais recentes. */
export async function getDadosAuxiliaresCobranca(): Promise<{ data: DadosAuxiliaresCobranca } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  await garantirPagamentos(supabase, user.id)

  const { data: membros, error: membrosError } = await supabase
    .from('membros')
    .select('id,nome,cor_avatar,ativo')
    .eq('user_id', user.id)
  if (membrosError) return { error: membrosError.message }

  const todosMembros = membros ?? []
  const membrosPorId = new Map(todosMembros.map(membro => [membro.id, membro]))
  const idsAtivos = todosMembros.filter(membro => membro.ativo).map(membro => membro.id)
  const todosIds = todosMembros.map(membro => membro.id)
  const pagamentoIdsPorMembro: Record<string, string[]> = {}

  if (idsAtivos.length) {
    const { data: abertos, error: abertosError } = await supabase
      .from('pagamentos')
      .select('id,membro_id,status')
      .in('membro_id', idsAtivos)
      .lte('mes_referencia', getCurrentMonthISO())
      .neq('status', 'pago')
    if (abertosError) return { error: abertosError.message }

    for (const pagamento of abertos ?? []) {
      pagamentoIdsPorMembro[pagamento.membro_id] ??= []
      pagamentoIdsPorMembro[pagamento.membro_id].push(pagamento.id)
    }
  }

  let recentes: PagamentoRecenteCobranca[] = []
  if (todosIds.length) {
    const { data: pagamentos, error: pagamentosError } = await supabase
      .from('pagamentos')
      .select('id,membro_id,mes_referencia,valor,data_pagamento')
      .in('membro_id', todosIds)
      .eq('status', 'pago')
      .order('data_pagamento', { ascending: false })
      .limit(5)
    if (pagamentosError) return { error: pagamentosError.message }

    recentes = (pagamentos ?? []).flatMap(pagamento => {
      const membro = membrosPorId.get(pagamento.membro_id)
      if (!membro || !pagamento.data_pagamento) return []
      return [{
        id: pagamento.id,
        membroId: pagamento.membro_id,
        nome: membro.nome,
        corAvatar: membro.cor_avatar,
        mesReferencia: pagamento.mes_referencia,
        valor: Number(pagamento.valor),
        dataPagamento: pagamento.data_pagamento,
      }]
    })
  }

  return { data: { pagamentoIdsPorMembro, recentes } }
}
