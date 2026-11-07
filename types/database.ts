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

export interface Configuracoes {
  user_id: string
  valor_plano: number | null
  chave_pix: string | null
  updated_at: string
}

/** Membro com cobranças em aberto até o mês atual (inclusive). */
export interface Devedor {
  membro: Membro
  /** mes_referencia ('YYYY-MM-01') de cada cobrança não paga, em ordem crescente */
  meses: string[]
  total: number
  /** true se alguma cobrança é de mês anterior ao atual */
  temAtraso: boolean
}

/** Comparação entre o que o plano custa e o que os membros pagam no mês atual. */
export interface ResumoCusto {
  /** null quando o usuário ainda não configurou o valor do plano */
  valorPlano: number | null
  /** soma das cobranças do mês atual de todos os membros ativos */
  previstoMes: number
  /** soma das cobranças do mês atual já pagas */
  arrecadadoMes: number
  /** previstoMes - valorPlano (positivo = sobra, negativo = você cobre a diferença); null sem valorPlano */
  diferenca: number | null
}
