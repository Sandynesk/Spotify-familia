'use server'

import { createClient } from '@/lib/supabase/server'
import { garantirPagamentos } from '@/lib/utils/payments'
import { getCurrentMonthISO, getEffectiveStatus } from '@/lib/utils/date'
import { calcularPontualidade } from '@/lib/domain/pontualidade'
import { calcularRetrospectiva } from '@/lib/domain/wrapped'
import { proximosVencimentos, gerarIcs } from '@/lib/domain/agenda'
import { linhaDoTempo } from '@/lib/domain/atividade'
import { resumoDoAno, saldoDoPlano, serieMensal } from '@/lib/domain/insights'
import type { Membro, Pagamento } from '@/types/database'

/** Dados agregados para gráficos, saldo e ranking anual da tela de Insights. */
export async function getInsightsData(ano: number = new Date().getFullYear()) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }
  await garantirPagamentos(supabase, user.id)

  const { data: membros, error: membrosError } = await supabase.from('membros').select('*').eq('user_id', user.id).eq('ativo', true).order('nome')
  if (membrosError) return { error: membrosError.message }
  const membrosLista = (membros ?? []) as Membro[]
  const ids = membrosLista.map(m => m.id)
  const { data: pagamentos, error: pagamentosError } = ids.length
    ? await supabase.from('pagamentos').select('*').in('membro_id', ids).gte('mes_referencia', `${ano}-01-01`).lt('mes_referencia', `${ano + 1}-01-01`).order('mes_referencia')
    : { data: [], error: null }
  if (pagamentosError) return { error: pagamentosError.message }
  const pagamentosLista = ((pagamentos ?? []) as Pagamento[]).map(p => ({ ...p, status: getEffectiveStatus(p.mes_referencia, p.status) as Pagamento['status'] }))
  const { data: configuracoes } = await supabase.from('configuracoes').select('valor_plano').eq('user_id', user.id).maybeSingle()
  const valorPlano = Number(configuracoes?.valor_plano ?? 0)
  const mesAtual = getCurrentMonthISO()
  const doMesAtual = pagamentosLista.filter(p => p.mes_referencia === mesAtual)
  const serie = serieMensal(pagamentosLista, Array.from({ length: 12 }, (_, i) => `${ano}-${String(i + 1).padStart(2, '0')}-01`))
  return {
    ano,
    membros: membrosLista,
    pagamentos: pagamentosLista,
    serie,
    resumo: resumoDoAno(membrosLista, pagamentosLista, ano),
    saldo: saldoDoPlano({ valorPlano, previstoMes: doMesAtual.reduce((s, p) => s + Number(p.valor), 0), arrecadadoMes: doMesAtual.filter(p => p.status === 'pago').reduce((s, p) => s + Number(p.valor), 0) }),
  }
}

/** Retrospectiva anual completa com configuração do valor do plano. */
export async function getRetrospectivaData(ano: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }
  await garantirPagamentos(supabase, user.id)
  const { data: membros, error: membrosError } = await supabase.from('membros').select('*').eq('user_id', user.id).order('nome')
  if (membrosError) return { error: membrosError.message }
  const membrosLista = (membros ?? []) as Membro[]
  const ids = membrosLista.map(m => m.id)
  const { data: pagamentos, error: pagamentosError } = ids.length
    ? await supabase.from('pagamentos').select('*').in('membro_id', ids).gte('mes_referencia', `${ano}-01-01`).lt('mes_referencia', `${ano + 1}-01-01`)
    : { data: [], error: null }
  if (pagamentosError) return { error: pagamentosError.message }
  const { data: configuracoes } = await supabase.from('configuracoes').select('valor_plano').eq('user_id', user.id).maybeSingle()
  return calcularRetrospectiva({ ano, membros: membrosLista, pagamentos: (pagamentos ?? []) as Pagamento[], valorPlano: Number(configuracoes?.valor_plano ?? 0) })
}

/** Vencimentos próximos e um calendário mensal com lembrete local às 9h. */
export async function getAgendaData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }
  await garantirPagamentos(supabase, user.id)
  const { data: membros, error } = await supabase.from('membros').select('*').eq('user_id', user.id).eq('ativo', true).order('nome')
  if (error) return { error: error.message }
  const membrosLista = (membros ?? []) as Membro[]
  const ids = membrosLista.map(m => m.id)
  const hoje = new Date()
  const ateData = new Date(hoje)
  ateData.setMonth(ateData.getMonth() + 12)
  const { data: pagamentos, error: pagamentosError } = ids.length
    ? await supabase.from('pagamentos').select('*').in('membro_id', ids).gte('mes_referencia', getCurrentMonthISO()).lt('mes_referencia', `${ateData.getFullYear()}-${String(ateData.getMonth() + 1).padStart(2, '0')}-01`)
    : { data: [], error: null }
  if (pagamentosError) return { error: pagamentosError.message }
  return {
    vencimentos: proximosVencimentos(membrosLista, (pagamentos ?? []) as Pagamento[], hoje, 60),
    calendario: gerarIcs({ membros: membrosLista, ate: ateData, nomeCalendario: 'SpotiFamília — vencimentos' }),
  }
}

/** Atividade recente derivada do histórico do usuário. */
export async function getAtividadeData(limite = 30) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }
  await garantirPagamentos(supabase, user.id)
  const { data: membros, error } = await supabase.from('membros').select('*').eq('user_id', user.id)
  if (error) return { error: error.message }
  const membrosLista = (membros ?? []) as Membro[]
  const ids = membrosLista.map(m => m.id)
  const { data: pagamentos, error: pagamentosError } = ids.length
    ? await supabase.from('pagamentos').select('*').in('membro_id', ids)
    : { data: [], error: null }
  if (pagamentosError) return { error: pagamentosError.message }
  return linhaDoTempo(membrosLista, (pagamentos ?? []) as Pagamento[], limite)
}

/** Pontualidade de um membro somente se ele pertence ao usuário autenticado. */
export async function getPontualidadeMembro(membroId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }
  const { data: membro, error } = await supabase.from('membros').select('*').eq('id', membroId).eq('user_id', user.id).maybeSingle()
  if (error) return { error: error.message }
  if (!membro) return { error: 'Membro não encontrado' }
  await garantirPagamentos(supabase, user.id)
  const { data: pagamentos, error: pagamentosError } = await supabase.from('pagamentos').select('*').eq('membro_id', membroId).order('mes_referencia')
  if (pagamentosError) return { error: pagamentosError.message }
  return calcularPontualidade(membro as Membro, (pagamentos ?? []) as Pagamento[])
}
