'use server'

import { getRetrospectivaData } from '@/lib/actions/insights'
import { createClient } from '@/lib/supabase/server'
import type { Retrospectiva } from '@/lib/domain/wrapped'

export interface RetrospectivaPessoa {
  id: string
  nome: string
  corAvatar: string | null
  ativo: boolean
}

export interface RetrospectivaPageData {
  retrospectiva: Retrospectiva
  pessoas: RetrospectivaPessoa[]
  mesesComDados: number
}

/** Combina o resumo anual de domínio com os dados visuais da família. */
export async function getRetrospectivaPageData(ano: number): Promise<RetrospectivaPageData | { error: string }> {
  const retrospectiva = await getRetrospectivaData(ano)
  if ('error' in retrospectiva) return retrospectiva

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Não foi possível identificar sua conta.' }

  const { data: membros, error: membrosError } = await supabase
    .from('membros')
    .select('id, nome, cor_avatar, ativo')
    .eq('user_id', user.id)
    .order('nome')

  if (membrosError) return { error: membrosError.message }

  const membrosLista = membros ?? []
  const ids = membrosLista.map(membro => membro.id)
  const { data: pagamentos, error: pagamentosError } = ids.length
    ? await supabase
      .from('pagamentos')
      .select('mes_referencia')
      .in('membro_id', ids)
      .gte('mes_referencia', `${ano}-01-01`)
      .lt('mes_referencia', `${ano + 1}-01-01`)
    : { data: [], error: null }

  if (pagamentosError) return { error: pagamentosError.message }

  return {
    retrospectiva,
    pessoas: membrosLista.map(membro => ({
      id: membro.id,
      nome: membro.nome,
      corAvatar: membro.cor_avatar,
      ativo: membro.ativo,
    })),
    mesesComDados: new Set((pagamentos ?? []).map(pagamento => pagamento.mes_referencia.slice(0, 7))).size,
  }
}
