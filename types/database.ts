export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Membro {
  id: string
  user_id: string
  nome: string
  email: string | null
  telefone: string | null
  valor_mensal: number
  dia_vencimento: number
  cor_avatar: string | null
  ativo: boolean
  data_entrada: string
  created_at: string
  updated_at: string
}

export interface Pagamento {
  id: string
  membro_id: string
  mes_referencia: string // ISO date string: '2025-06-01'
  valor: number
  status: 'pendente' | 'pago' | 'atrasado'
  data_pagamento: string | null
  observacao: string | null
  created_at: string
}

export type PagamentoStatus = 'pendente' | 'pago' | 'atrasado'

export interface MembroComPagamento extends Membro {
  pagamento_atual: Pagamento | null
}

export interface DashboardSummary {
  totalMembros: number
  totalAReceber: number
  totalPago: number
  totalAtrasado: number
  progresso: number // 0-100
}
