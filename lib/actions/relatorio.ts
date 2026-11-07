'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentMonthISO } from '@/lib/utils/date'
import { gerarTextoRelatorio } from '@/lib/utils/relatorio'
import { getConfiguracoes } from '@/lib/actions/configuracoes'
import { garantirPagamentos } from '@/lib/utils/payments'

/** Monta o relatório do mês atual para o usuário logado (membros ativos). */
export async function getRelatorio(): Promise<{ texto: string } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }
  await garantirPagamentos(supabase, user.id)
  const mesReferencia = getCurrentMonthISO()
  const { data: membros, error: membrosError } = await supabase.from('membros').select('*').eq('user_id', user.id).eq('ativo', true)
  if (membrosError) return { error: membrosError.message }
  const ids = (membros ?? []).map(m => m.id)
  const { data: pagamentos, error: pagamentosError } = ids.length
    ? await supabase.from('pagamentos').select('*').in('membro_id', ids).lte('mes_referencia', mesReferencia)
    : { data: [], error: null }
  if (pagamentosError) return { error: pagamentosError.message }
  const abertos = new Map<string, { meses: string[]; total: number }>()
  for (const p of pagamentos ?? []) {
    if (p.status === 'pago') continue
    const atual = abertos.get(p.membro_id) ?? { meses: [], total: 0 }
    atual.meses.push(p.mes_referencia)
    atual.total += Number(p.valor)
    abertos.set(p.membro_id, atual)
  }
  const configuracoes = await getConfiguracoes()
  const texto = gerarTextoRelatorio({
    mesReferencia,
    linhas: (membros ?? []).map(m => ({ nome: m.nome, meses: abertos.get(m.id)?.meses ?? [], total: abertos.get(m.id)?.total ?? 0 })),
    chavePix: configuracoes?.chave_pix ?? null,
  })
  return { texto }
}
