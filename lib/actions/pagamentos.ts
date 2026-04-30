'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getEffectiveStatus, getCurrentMonthISO } from '@/lib/utils/date'
import type { Pagamento } from '@/types/database'

export async function getPagamentosMembro(membroId: string): Promise<Pagamento[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('pagamentos')
    .select('*')
    .eq('membro_id', membroId)
    .order('mes_referencia', { ascending: false })

  if (error) return []

  // Aplicar status efetivo (pendente → atrasado se mês já passou)
  return (data || []).map(p => ({
    ...p,
    status: getEffectiveStatus(p.mes_referencia, p.status) as 'pendente' | 'pago' | 'atrasado',
  }))
}

export async function getPagamentosMesAtual() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const mesAtual = getCurrentMonthISO()

  const { data, error } = await supabase
    .from('pagamentos')
    .select(`
      *,
      membros!inner(user_id, nome, email, cor_avatar, valor_mensal)
    `)
    .eq('mes_referencia', mesAtual)
    .eq('membros.user_id', user.id)

  if (error) return []

  return (data || []).map(p => ({
    ...p,
    status: getEffectiveStatus(p.mes_referencia, p.status) as 'pendente' | 'pago' | 'atrasado',
  }))
}

export async function marcarPago(pagamentoId: string, membroId: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect('/login')

  const { error } = await supabase
    .from('pagamentos')
    .update({
      status: 'pago',
      data_pagamento: new Date().toISOString(),
    })
    .eq('id', pagamentoId)

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath(`/membros/${membroId}`)
  return { success: true }
}

export async function desfazerPagamento(pagamentoId: string, membroId: string, mesReferencia: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect('/login')

  const newStatus = getEffectiveStatus(mesReferencia, 'pendente')

  const { error } = await supabase
    .from('pagamentos')
    .update({
      status: newStatus,
      data_pagamento: null,
    })
    .eq('id', pagamentoId)

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath(`/membros/${membroId}`)
  return { success: true }
}

export async function getDashboardData() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Buscar membros ativos + seus pagamentos do mês atual
    const mesAtual = getCurrentMonthISO()

    const { data: membros } = await supabase
      .from('membros')
      .select('*')
      .eq('user_id', user.id)
      .eq('ativo', true)

    if (!membros || membros.length === 0) {
      return {
        membros: [],
        pagamentosMes: [],
        summary: { totalMembros: 0, totalAReceber: 0, totalPago: 0, totalAtrasado: 0, progresso: 0 },
      }
    }

    const membroIds = membros.map(m => m.id)

    const { data: pagamentos } = await supabase
      .from('pagamentos')
      .select('*')
      .in('membro_id', membroIds)
      .eq('mes_referencia', mesAtual)

    const pagamentosComStatus = (pagamentos || []).map(p => ({
      ...p,
      status: getEffectiveStatus(p.mes_referencia, p.status) as 'pendente' | 'pago' | 'atrasado',
    }))

    const totalAReceber = membros.reduce((acc, m) => acc + Number(m.valor_mensal), 0)
    const totalPago = pagamentosComStatus
      .filter(p => p.status === 'pago')
      .reduce((acc, p) => acc + Number(p.valor), 0)
    const totalAtrasado = pagamentosComStatus
      .filter(p => p.status === 'atrasado')
      .reduce((acc, p) => acc + Number(p.valor), 0)
    const progresso = totalAReceber > 0 ? Math.round((totalPago / totalAReceber) * 100) : 0

    return {
      membros,
      pagamentosMes: pagamentosComStatus,
      summary: {
        totalMembros: membros.length,
        totalAReceber,
        totalPago,
        totalAtrasado,
        progresso,
      },
    }
  } catch (error) {
    console.error('Error in getDashboardData:', error)
    return null
  }
}

export async function getVisaoGeralData(ano: number = new Date().getFullYear()) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Buscar membros ativos
  const { data: membros } = await supabase
    .from('membros')
    .select('*')
    .eq('user_id', user.id)
    .eq('ativo', true)
    .order('nome')

  if (!membros || membros.length === 0) {
    return {
      membros: [],
      pagamentos: [],
      ano,
    }
  }

  // Buscar todos os pagamentos do ano
  const dataInicio = `${ano}-01-01`
  const dataFim = `${ano}-12-31`

  const membroIds = membros.map(m => m.id)

  const { data: pagamentos } = await supabase
    .from('pagamentos')
    .select('*')
    .in('membro_id', membroIds)
    .gte('mes_referencia', dataInicio)
    .lte('mes_referencia', dataFim)
    .order('mes_referencia', { ascending: true })

  const pagamentosComStatus = (pagamentos || []).map(p => ({
    ...p,
    status: getEffectiveStatus(p.mes_referencia, p.status) as 'pendente' | 'pago' | 'atrasado',
  }))

  return {
    membros,
    pagamentos: pagamentosComStatus,
    ano,
  }
}
