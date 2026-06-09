'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { generatePayments } from '@/lib/utils/payments'
import { getAvatarColor } from '@/lib/utils/avatar'

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

  // Gerar 12 meses de pagamentos
  const payments = generatePayments(membro.id, formData.valor_mensal)

  const { error: payError } = await supabase
    .from('pagamentos')
    .insert(payments)

  if (payError) {
    // Rollback — deletar membro criado
    await supabase.from('membros').delete().eq('id', membro.id)
    return { error: 'Erro ao gerar pagamentos: ' + payError.message }
  }

  revalidatePath('/')
  revalidatePath('/dashboard')
  revalidatePath('/historico')
  revalidatePath('/visao-geral')
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

  // Atualiza as parcelas futuras/não pagas do membro com o novo valor
  const { error: payUpdateError } = await supabase
    .from('pagamentos')
    .update({ valor: formData.valor_mensal })
    .eq('membro_id', id)
    .neq('status', 'pago')

  if (payUpdateError) {
    console.error('Erro ao atualizar parcelas futuras:', payUpdateError.message)
  }

  revalidatePath('/')
  revalidatePath(`/membros/${id}`)
  revalidatePath('/dashboard')
  revalidatePath('/historico')
  revalidatePath('/visao-geral')
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

  revalidatePath('/')
  revalidatePath('/dashboard')
  revalidatePath('/historico')
  revalidatePath('/visao-geral')
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
