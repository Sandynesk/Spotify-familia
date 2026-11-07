'use server'

import { createClient } from '@/lib/supabase/server'
import { garantirPagamentos } from '@/lib/utils/payments'
import { getCurrentMonthISO, getEffectiveStatus } from '@/lib/utils/date'

export interface MembroBusca {
  id: string
  nome: string
  cor_avatar: string | null
  valor_mensal: number
  dia_vencimento: number
  pagamento_id: string | null
  status_pagamento: 'pendente' | 'pago' | 'atrasado' | null
  mes_referencia: string
}

export type ResultadoBuscaMembros =
  | { membros: MembroBusca[] }
  | { error: string }

/** Carrega os dados mínimos para a busca, apenas quando a paleta precisa deles. */
export async function buscarMembrosPalette(): Promise<ResultadoBuscaMembros> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Não foi possível carregar os membros.' }

  await garantirPagamentos(supabase, user.id)

  const { data: membros, error: membrosError } = await supabase
    .from('membros')
    .select('id, nome, cor_avatar, valor_mensal, dia_vencimento')
    .eq('user_id', user.id)
    .eq('ativo', true)
    .order('nome')

  if (membrosError) return { error: 'Não foi possível carregar os membros.' }

  const lista = membros ?? []
  const mesReferencia = getCurrentMonthISO()
  if (lista.length === 0) return { membros: [] }

  const { data: pagamentos, error: pagamentosError } = await supabase
    .from('pagamentos')
    .select('id, membro_id, mes_referencia, status')
    .in('membro_id', lista.map((membro) => membro.id))
    .eq('mes_referencia', mesReferencia)

  if (pagamentosError) return { error: 'Não foi possível carregar os membros.' }

  const porMembro = new Map((pagamentos ?? []).map((pagamento) => [pagamento.membro_id, pagamento]))

  return {
    membros: lista.map((membro) => {
      const pagamento = porMembro.get(membro.id)
      return {
        id: membro.id,
        nome: membro.nome,
        cor_avatar: membro.cor_avatar,
        valor_mensal: Number(membro.valor_mensal),
        dia_vencimento: membro.dia_vencimento,
        pagamento_id: pagamento?.id ?? null,
        status_pagamento: pagamento ? getEffectiveStatus(pagamento.mes_referencia, pagamento.status) : null,
        mes_referencia: mesReferencia,
      }
    }),
  }
}
