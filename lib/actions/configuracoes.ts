'use server'

import type { Configuracoes } from '@/types/database'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ConfiguracoesFormData {
  /** valor mensal da assinatura do Spotify; null limpa o valor */
  valor_plano: number | null
  /** chave PIX exibida no relatório do grupo; null/'' limpa */
  chave_pix: string | null
}

/** Configurações do usuário logado, ou null se ainda não salvou nenhuma. */
export async function getConfiguracoes(): Promise<Configuracoes | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase.from('configuracoes').select('*').eq('user_id', user.id).maybeSingle()
  return error ? null : data
}

/** Cria ou atualiza (upsert por user_id) as configurações do usuário logado. */
export async function salvarConfiguracoes(
  data: ConfiguracoesFormData,
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }
  const valor = data.valor_plano
  if (valor !== null && (!Number.isFinite(valor) || valor < 0 || valor > 10000)) return { error: 'Valor do plano inválido' }
  const chave = data.chave_pix?.trim() || null
  if (chave && chave.length > 140) return { error: 'Chave PIX deve ter no máximo 140 caracteres' }
  const { error } = await supabase.from('configuracoes').upsert({ user_id: user.id, valor_plano: valor === null ? null : Math.round(valor * 100) / 100, chave_pix: chave }, { onConflict: 'user_id' })
  if (error) return { error: error.code === '42P01' || error.code === 'PGRST205' ? 'Rode supabase-migration-2026-11-configuracoes.sql' : error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}
