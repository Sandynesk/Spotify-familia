'use server'

import { createClient } from '@/lib/supabase/server'
import { linhaDoTempo } from '@/lib/domain/atividade'
import { proximosVencimentos } from '@/lib/domain/agenda'
import { getEffectiveStatus } from '@/lib/utils/date'
import { garantirPagamentos } from '@/lib/utils/payments'
import type { Membro, Pagamento } from '@/types/database'

export interface AgendaMember {
  id: string
  nome: string
  cor_avatar: string | null
  dia_vencimento: number
  valor_mensal: number
}

export interface AgendaPayment {
  id: string
  membro_id: string
  mes_referencia: string
  valor: number
  status: Pagamento['status']
  data_pagamento: string | null
}

export interface AgendaDue {
  membroId: string
  nome: string
  telefone: string | null
  mesReferencia: string
  dataVencimento: string
  valor: number
  status: Pagamento['status']
  pagamentoId: string | null
  cor_avatar: string | null
}

export interface HistoricoMember {
  id: string
  nome: string
  cor_avatar: string | null
  dia_vencimento: number
}

async function getUserAndClient() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  return { supabase, user, error }
}

/** Dados da agenda, com vencimentos calculados pela regra de domínio existente. */
export async function getAgendaPageData() {
  const { supabase, user, error: authError } = await getUserAndClient()
  if (authError || !user) return { error: 'Não foi possível confirmar sua sessão.' } as const

  await garantirPagamentos(supabase, user.id)

  const { data: membros, error: membrosError } = await supabase
    .from('membros')
    .select('*')
    .eq('user_id', user.id)
    .eq('ativo', true)
    .order('nome')
  if (membrosError) return { error: membrosError.message } as const

  const listaMembros = (membros ?? []) as Membro[]
  const ids = listaMembros.map((membro) => membro.id)
  const { data: pagamentos, error: pagamentosError } = ids.length
    ? await supabase.from('pagamentos').select('*').in('membro_id', ids).order('mes_referencia')
    : { data: [], error: null }
  if (pagamentosError) return { error: pagamentosError.message } as const

  const listaPagamentos = ((pagamentos ?? []) as Pagamento[]).map((pagamento) => ({
    ...pagamento,
    status: getEffectiveStatus(pagamento.mes_referencia, pagamento.status),
  }))
  const hoje = new Date()
  const vencimentos = proximosVencimentos(listaMembros, listaPagamentos, hoje, 30)

  return {
    members: listaMembros.map(({ id, nome, cor_avatar, dia_vencimento, valor_mensal }) => ({
      id,
      nome,
      cor_avatar,
      dia_vencimento,
      valor_mensal: Number(valor_mensal),
    } satisfies AgendaMember)),
    payments: listaPagamentos.map(({ id, membro_id, mes_referencia, valor, status, data_pagamento }) => ({
      id,
      membro_id,
      mes_referencia,
      valor: Number(valor),
      status,
      data_pagamento,
    } satisfies AgendaPayment)),
    upcoming: vencimentos.map((vencimento) => {
      const pagamento = listaPagamentos.find((item) => item.membro_id === vencimento.membroId && item.mes_referencia.slice(0, 7) === vencimento.mesReferencia.slice(0, 7))
      const membro = listaMembros.find((item) => item.id === vencimento.membroId)
      return {
        ...vencimento,
        pagamentoId: pagamento?.id ?? null,
        cor_avatar: membro?.cor_avatar ?? null,
      } satisfies AgendaDue
    }),
    today: `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`,
  }
}

/** Atividade cronológica derivada dos pagamentos e membros do usuário. */
export async function getHistoricoPageData() {
  const { supabase, user, error: authError } = await getUserAndClient()
  if (authError || !user) return { error: 'Não foi possível confirmar sua sessão.' } as const

  await garantirPagamentos(supabase, user.id)

  const { data: membros, error: membrosError } = await supabase
    .from('membros')
    .select('*')
    .eq('user_id', user.id)
    .order('nome')
  if (membrosError) return { error: membrosError.message } as const

  const listaMembros = (membros ?? []) as Membro[]
  const ids = listaMembros.map((membro) => membro.id)
  const { data: pagamentos, error: pagamentosError } = ids.length
    ? await supabase.from('pagamentos').select('*').in('membro_id', ids).order('mes_referencia', { ascending: false })
    : { data: [], error: null }
  if (pagamentosError) return { error: pagamentosError.message } as const

  const listaPagamentos = ((pagamentos ?? []) as Pagamento[]).map((pagamento) => ({
    ...pagamento,
    status: getEffectiveStatus(pagamento.mes_referencia, pagamento.status),
  }))

  return {
    members: listaMembros.map(({ id, nome, cor_avatar, dia_vencimento }) => ({
      id,
      nome,
      cor_avatar,
      dia_vencimento,
    } satisfies HistoricoMember)),
    events: linhaDoTempo(listaMembros, listaPagamentos, Number.MAX_SAFE_INTEGER),
    today: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`,
  }
}
