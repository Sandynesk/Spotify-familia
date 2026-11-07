import type { SupabaseClient } from '@supabase/supabase-js'
import type { Membro } from '@/types/database'
import { listMonths, toMonthISO } from './date'

export interface PaymentToCreate {
  membro_id: string
  mes_referencia: string
  valor: number
  status: 'pendente'
}

type MembroCobravel = Pick<Membro, 'id' | 'valor_mensal' | 'data_entrada' | 'created_at'>

/**
 * Cobranças que deveriam existir (do mês de entrada do membro até `ate`) e ainda não existem.
 * O status gravado é sempre 'pendente'; 'atrasado' é derivado na leitura por getEffectiveStatus.
 */
export function getMissingPayments(
  membros: MembroCobravel[],
  existentes: { membro_id: string; mes_referencia: string }[],
  ate: string,
): PaymentToCreate[] {
  const jaExiste = new Set(existentes.map(p => `${p.membro_id}|${p.mes_referencia}`))
  const faltando: PaymentToCreate[] = []

  for (const membro of membros) {
    const inicio = toMonthISO(membro.data_entrada || membro.created_at)
    for (const mes of listMonths(inicio, ate)) {
      if (jaExiste.has(`${membro.id}|${mes}`)) continue
      faltando.push({
        membro_id: membro.id,
        mes_referencia: mes,
        valor: Number(membro.valor_mensal),
        status: 'pendente',
      })
    }
  }
  return faltando
}

/**
 * Garante que todo membro ativo do usuário tenha cobranças do mês de entrada até dezembro
 * do ano atual. Idempotente: a constraint única (membro_id, mes_referencia) impede duplicatas
 * mesmo com requisições simultâneas. Falhas são registradas mas não quebram a página.
 */
export async function garantirPagamentos(supabase: SupabaseClient, userId: string) {
  const ate = `${new Date().getFullYear()}-12-01`

  const { data: membros, error: membrosError } = await supabase
    .from('membros')
    .select('id, valor_mensal, data_entrada, created_at')
    .eq('user_id', userId)
    .eq('ativo', true)

  if (membrosError || !membros?.length) {
    if (membrosError) console.error('garantirPagamentos (membros):', membrosError.message)
    return
  }

  const { data: existentes, error: existentesError } = await supabase
    .from('pagamentos')
    .select('membro_id, mes_referencia')
    .in('membro_id', membros.map(m => m.id))

  if (existentesError) {
    console.error('garantirPagamentos (pagamentos):', existentesError.message)
    return
  }

  const faltando = getMissingPayments(membros, existentes ?? [], ate)
  if (faltando.length === 0) return

  const { error } = await supabase
    .from('pagamentos')
    .upsert(faltando, { onConflict: 'membro_id,mes_referencia', ignoreDuplicates: true })

  if (error) console.error('garantirPagamentos (insert):', error.message)
}
