/** Formato mínimo de membro consumido pelo motor puro de domínio. */
export interface MembroDominio {
  id: string
  nome: string
  email?: string | null
  telefone?: string | null
  valor_mensal: number
  dia_vencimento: number
  cor_avatar?: string | null
  ativo: boolean
  data_entrada: string
  user_id?: string
  created_at?: string
  updated_at?: string
}

/** Formato mínimo de pagamento consumido pelo motor puro de domínio. */
export interface PagamentoDominio {
  id: string
  membro_id: string
  mes_referencia: string
  valor: number
  status: 'pendente' | 'pago' | 'atrasado'
  data_pagamento: string | null
  observacao?: string | null
  created_at?: string
}

/** Chaves exportáveis de uma linha do CSV; `titulo` define o cabeçalho. */
export type ColunaCsv<T extends object> = keyof T | { chave: keyof T; titulo: string }

/** Identificador, conteúdo e rótulo de um selo mostrado na interface. */
export interface Selo {
  id: 'relampago' | 'pontual' | 'em-dia' | 'fiel' | 'recuperado'
  titulo: string
  descricao: string
  icone: string
}

/** Indicadores de regularidade de um membro. */
export interface ResumoPontualidade {
  membroId: string
  scorePontualidade: number
  mediaDiasAtraso: number | null
  percentualNoPrazo: number
  sequenciaAtual: number
  maiorSequencia: number
  selos: Selo[]
  pagamentosAnalisados: number
}

/** Resultado da divisão simulada de um plano. Valores estão em reais. */
export interface DivisaoPlano {
  valorPlano: number
  quantidadePagantes: number
  donoPaga: boolean
  valores: number[]
  totalCobrado: number
  parteDono: number
  sobra: number
}

/** Resultado individual de um reajuste, incluindo a diferença em reais. */
export interface ItemReajuste {
  membroId: string
  nome: string
  valorAnterior: number
  novoValor: number
  diferenca: number
}

/** Evento calculado a partir do histórico de membros e pagamentos. */
export interface EventoAtividade {
  id: string
  tipo: 'pagou' | 'entrou' | 'atrasou' | 'arquivado'
  data: string
  membroId: string
  membro: string
  valor: number | null
  mesReferencia?: string
}
