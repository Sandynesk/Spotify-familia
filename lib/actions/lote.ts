'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentMonthISO, getEffectiveStatus } from '@/lib/utils/date'
import { garantirPagamentos } from '@/lib/utils/payments'

type SupabaseServer = Awaited<ReturnType<typeof createClient>>
type PagamentoSelecionado = { id: string; membro_id: string; mes_referencia: string }

async function idsDosMembrosDoUsuario(supabase: SupabaseServer, userId: string): Promise<{ ids: string[]; error?: string }> {
  const { data, error } = await supabase.from('membros').select('id').eq('user_id', userId)
  return error ? { ids: [], error: error.message } : { ids: (data ?? []).map(m => m.id) }
}

async function pagamentosSelecionados(
  supabase: SupabaseServer,
  membroIds: string[],
  pagamentoIds: string[],
): Promise<{ rows: PagamentoSelecionado[]; error?: string }> {
  if (!pagamentoIds.length || !membroIds.length) return { rows: [] }
  const { data, error } = await supabase.from('pagamentos').select('id,membro_id,mes_referencia').in('id', pagamentoIds).in('membro_id', membroIds)
  return error ? { rows: [], error: error.message } : { rows: (data ?? []) as PagamentoSelecionado[] }
}

/** Marca vários pagamentos como pagos depois de confirmar que pertencem ao usuário. */
export async function marcarVariosPagos(pagamentoIds: string[]) {
  if (!Array.isArray(pagamentoIds) || pagamentoIds.some(id => typeof id !== 'string')) return { error: 'Lista de pagamentos inválida' }
  const ids = [...new Set(pagamentoIds)]
  if (!ids.length) return { success: true, atualizados: 0 }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }
  const membros = await idsDosMembrosDoUsuario(supabase, user.id)
  if (membros.error) return { error: membros.error }
  const selecionados = await pagamentosSelecionados(supabase, membros.ids, ids)
  if (selecionados.error) return { error: selecionados.error }
  if (selecionados.rows.length !== ids.length) return { error: 'Um ou mais pagamentos não foram encontrados' }
  const { data, error } = await supabase.from('pagamentos').update({ status: 'pago', data_pagamento: new Date().toISOString() }).in('id', ids).in('membro_id', membros.ids).select('id')
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true, atualizados: data?.length ?? 0 }
}

/** Desfaz a seleção em lote e restaura o estado efetivo para o mês de cada cobrança. */
export async function desfazerVarios(pagamentoIds: string[]) {
  if (!Array.isArray(pagamentoIds) || pagamentoIds.some(id => typeof id !== 'string')) return { error: 'Lista de pagamentos inválida' }
  const ids = [...new Set(pagamentoIds)]
  if (!ids.length) return { success: true, atualizados: 0 }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }
  const membros = await idsDosMembrosDoUsuario(supabase, user.id)
  if (membros.error) return { error: membros.error }
  const selecionados = await pagamentosSelecionados(supabase, membros.ids, ids)
  if (selecionados.error) return { error: selecionados.error }
  if (selecionados.rows.length !== ids.length) return { error: 'Um ou mais pagamentos não foram encontrados' }
  const grupos = new Map<'pendente' | 'atrasado', string[]>()
  for (const pagamento of selecionados.rows) {
    const status = getEffectiveStatus(pagamento.mes_referencia, 'pendente')
    if (status === 'pago') continue
    grupos.set(status, [...(grupos.get(status) ?? []), pagamento.id])
  }
  for (const [status, grupo] of grupos) {
    const { error } = await supabase.from('pagamentos').update({ status, data_pagamento: null }).in('id', grupo).in('membro_id', membros.ids)
    if (error) return { error: error.message }
  }
  revalidatePath('/', 'layout')
  return { success: true, atualizados: selecionados.rows.length }
}

/** Define a data de recebimento de uma cobrança que pertence ao usuário. */
export async function marcarPagoEm(pagamentoId: string, dataISO: string) {
  if (typeof pagamentoId !== 'string' || typeof dataISO !== 'string') return { error: 'Data ou pagamento inválido' }
  const data = new Date(dataISO)
  const soData = /^\d{4}-\d{2}-\d{2}$/.test(dataISO)
  if (!pagamentoId || Number.isNaN(data.getTime()) || (soData && data.toISOString().slice(0, 10) !== dataISO)) return { error: 'Data ou pagamento inválido' }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }
  const membros = await idsDosMembrosDoUsuario(supabase, user.id)
  if (membros.error) return { error: membros.error }
  const selecionado = await pagamentosSelecionados(supabase, membros.ids, [pagamentoId])
  if (selecionado.error) return { error: selecionado.error }
  if (selecionado.rows.length !== 1) return { error: 'Pagamento não encontrado' }
  const { error } = await supabase.from('pagamentos').update({ status: 'pago', data_pagamento: data.toISOString() }).eq('id', pagamentoId).in('membro_id', membros.ids)
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

/** Salva uma observação de até 2.000 caracteres em uma cobrança do usuário. */
export async function salvarObservacao(pagamentoId: string, texto: string) {
  if (!pagamentoId || typeof texto !== 'string' || texto.length > 2000) return { error: 'Observação inválida' }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }
  const membros = await idsDosMembrosDoUsuario(supabase, user.id)
  if (membros.error) return { error: membros.error }
  const selecionado = await pagamentosSelecionados(supabase, membros.ids, [pagamentoId])
  if (selecionado.error) return { error: selecionado.error }
  if (selecionado.rows.length !== 1) return { error: 'Pagamento não encontrado' }
  const observacao = texto.trim() || null
  const { error } = await supabase.from('pagamentos').update({ observacao }).eq('id', pagamentoId).in('membro_id', membros.ids)
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

/**
 * Atualiza mensalidades e cobranças não pagas desde o mês indicado. A lista de
 * membros é validada contra o usuário autenticado antes de qualquer escrita.
 */
export async function reajustarValores(
  itens: { membroId: string; novoValor: number }[],
  opcoes: { aplicarDesde: 'mesAtual' | 'proximoMes' },
) {
  if (!Array.isArray(itens) || itens.some(item => !item || typeof item.membroId !== 'string' || !item.membroId || !Number.isFinite(item.novoValor) || item.novoValor < 0)) return { error: 'Valores de reajuste inválidos' }
  if (opcoes?.aplicarDesde !== 'mesAtual' && opcoes?.aplicarDesde !== 'proximoMes') return { error: 'Mês de aplicação inválido' }
  const unicos = new Map<string, number>()
  for (const item of itens) {
    if (unicos.has(item.membroId)) return { error: 'Há membros repetidos na lista' }
    unicos.set(item.membroId, Math.round(item.novoValor * 100) / 100)
  }
  if (!unicos.size) return { success: true, atualizados: 0 }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }
  await garantirPagamentos(supabase, user.id)
  revalidatePath('/', 'layout')
  const membros = await idsDosMembrosDoUsuario(supabase, user.id)
  if (membros.error) return { error: membros.error }
  const ids = [...unicos.keys()]
  if (ids.some(id => !membros.ids.includes(id))) return { error: 'Um ou mais membros não foram encontrados' }
  const hoje = new Date()
  const mesAtual = getCurrentMonthISO()
  const proximo = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1)
  const desde = opcoes.aplicarDesde === 'mesAtual' ? mesAtual : `${proximo.getFullYear()}-${String(proximo.getMonth() + 1).padStart(2, '0')}-01`
  let atualizados = 0
  for (const [membroId, novoValor] of unicos) {
    const { error: membroError } = await supabase.from('membros').update({ valor_mensal: novoValor }).eq('id', membroId).eq('user_id', user.id)
    if (membroError) {
      if (atualizados) revalidatePath('/', 'layout')
      return { error: membroError.message }
    }
    atualizados++
    const { error: pagamentosError } = await supabase.from('pagamentos').update({ valor: novoValor }).eq('membro_id', membroId).neq('status', 'pago').gte('mes_referencia', desde)
    if (pagamentosError) {
      revalidatePath('/', 'layout')
      return { error: `Membro atualizado, mas não foi possível atualizar cobranças: ${pagamentosError.message}` }
    }
  }
  revalidatePath('/', 'layout')
  return { success: true, atualizados, aplicadoDesde: desde }
}
