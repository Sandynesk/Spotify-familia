'use server'

import { createClient } from '@/lib/supabase/server'
import { garantirPagamentos } from '@/lib/utils/payments'
import { getEffectiveStatus } from '@/lib/utils/date'
import type { Membro, Pagamento } from '@/types/database'

/** Dados da lista com o histórico necessário para calcular pontualidade. */
export async function getMembrosComPagamentos(): Promise<{ error: string } | { membros: Membro[]; pagamentos: Pagamento[] }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não foi possível carregar sua sessão.' }

  await garantirPagamentos(supabase, user.id)

  const { data: membrosData, error: membrosError } = await supabase
    .from('membros')
    .select('*')
    .eq('user_id', user.id)
    .eq('ativo', true)
    .order('nome')

  if (membrosError) return { error: 'Não foi possível carregar seus membros.' }
  if (!membrosData?.length) return { membros: [], pagamentos: [] }

  const membros = membrosData as Membro[]
  const { data: pagamentosData, error: pagamentosError } = await supabase
    .from('pagamentos')
    .select('*')
    .in('membro_id', membros.map((membro) => membro.id))

  if (pagamentosError) return { error: 'Não foi possível carregar o histórico de pagamentos.' }

  const pagamentos = (pagamentosData ?? []) as Pagamento[]
  return {
    membros,
    pagamentos: pagamentos.map((pagamento) => ({
      ...pagamento,
      status: getEffectiveStatus(pagamento.mes_referencia, pagamento.status),
    })),
  }
}
