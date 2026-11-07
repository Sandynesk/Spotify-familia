'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { garantirPagamentos } from '@/lib/utils/payments'
import { getCurrentMonthISO } from '@/lib/utils/date'
import { getAvatarColor } from '@/lib/utils/avatar'
import type { Membro } from '@/types/database'

export interface MembroFormData {
  nome: string
  email?: string
  telefone?: string
  valor_mensal: number
  dia_vencimento: number
  cor_avatar?: string
}

export async function criarMembro(formData: MembroFormData) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect('/login')

  // Usar cor auto se não escolhida
  const cor = formData.cor_avatar || getAvatarColor(formData.nome)

  const { data: membro, error } = await supabase
    .from('membros')
    .insert({
      user_id: user.id,
      nome: formData.nome,
      email: formData.email || null,
      telefone: formData.telefone || null,
      valor_mensal: formData.valor_mensal,
      dia_vencimento: formData.dia_vencimento,
      cor_avatar: cor,
    })
    .select()
    .single()

  if (error || !membro) {
    return { error: error?.message || 'Erro ao criar membro' }
  }

  await garantirPagamentos(supabase, user.id)

  revalidatePath('/', 'layout')
  return { success: true, id: membro.id }
}

export async function editarMembro(id: string, formData: MembroFormData) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect('/login')

  const { error } = await supabase
    .from('membros')
    .update({
      nome: formData.nome,
      email: formData.email || null,
      telefone: formData.telefone || null,
      valor_mensal: formData.valor_mensal,
      dia_vencimento: formData.dia_vencimento,
      cor_avatar: formData.cor_avatar,
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  // Cobranças em aberto a partir do mês atual passam a usar o novo valor.
  // Meses anteriores não pagos mantêm o valor que era devido na época.
  const { error: payError } = await supabase
    .from('pagamentos')
    .update({ valor: formData.valor_mensal })
    .eq('membro_id', id)
    .neq('status', 'pago')
    .gte('mes_referencia', getCurrentMonthISO())

  if (payError) return { error: 'Membro salvo, mas erro ao atualizar cobranças: ' + payError.message }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function deletarMembro(id: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect('/login')

  const { error } = await supabase
    .from('membros')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function getMembros() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('membros')
    .select('*')
    .eq('user_id', user.id)
    .eq('ativo', true)
    .order('nome')

  if (error) return []
  return data || []
}

export async function getMembro(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('membros')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) return null
  return data
}

/**
 * Tira o membro do plano sem apagar o histórico: ativo = false e remove as cobranças
 * NÃO pagas de meses posteriores ao atual (as do mês atual e anteriores continuam devidas).
 */
export async function arquivarMembro(id: string): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }
  const { data: membro, error: findError } = await supabase.from('membros').select('id').eq('id', id).eq('user_id', user.id).maybeSingle()
  if (findError) return { error: findError.message }
  if (!membro) return { error: 'Membro não encontrado' }
  const { error } = await supabase.from('membros').update({ ativo: false }).eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }
  const { error: deleteError } = await supabase.from('pagamentos').delete().eq('membro_id', id).neq('status', 'pago').gt('mes_referencia', getCurrentMonthISO())
  if (deleteError) return { error: deleteError.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

/**
 * Volta o membro ao plano: ativo = true e data_entrada = hoje, para que a geração automática
 * de cobranças recomece no mês atual e não cobre os meses em que ele esteve arquivado.
 */
export async function reativarMembro(id: string): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }
  const { error } = await supabase.from('membros').update({ ativo: true, data_entrada: new Date().toISOString().slice(0, 10) }).eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }
  await garantirPagamentos(supabase, user.id)
  revalidatePath('/', 'layout')
  return { success: true }
}

/** Membros arquivados (ativo = false) do usuário logado, ordenados por nome. */
export async function getMembrosArquivados(): Promise<Membro[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase.from('membros').select('*').eq('user_id', user.id).eq('ativo', false).order('nome')
  return error ? [] : data ?? []
}
