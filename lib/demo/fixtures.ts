import { randomUUID } from 'node:crypto'

export const DEMO_USER_ID = '00000000-0000-4000-8000-000000000001'

export type DemoRow = Record<string, unknown>
export type DemoTables = Record<string, DemoRow[]>

function monthISO(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-01`
}

function shiftedMonth(now: Date, offset: number) {
  return new Date(now.getFullYear(), now.getMonth() + offset, 1)
}

function dateAtDay(month: Date, day: number, hour = 12) {
  return new Date(Date.UTC(month.getFullYear(), month.getMonth(), day, hour)).toISOString()
}

/** Builds a fresh, current-relative demo family and its payment history. */
export function createDemoTables(now = new Date()): DemoTables {
  const memberSpecs = [
    { nome: 'Ana Lima', email: 'ana@example.test', telefone: '+55 11 91234-5601', valor_mensal: 8.2, dia_vencimento: 5, pattern: 'early', entered: -14, active: true },
    { nome: 'Bruno Costa', email: 'bruno@example.test', telefone: '+55 11 91234-5602', valor_mensal: 8.2, dia_vencimento: 10, pattern: 'ontime', entered: -14, active: true },
    { nome: 'Carla Mendes', email: 'carla@example.test', telefone: '+55 11 91234-5603', valor_mensal: 8.1, dia_vencimento: 10, pattern: 'late', entered: -14, active: true },
    { nome: 'Diego Rocha', email: 'diego@example.test', telefone: '+55 11 91234-5604', valor_mensal: 8.2, dia_vencimento: 15, pattern: 'debtor', entered: -14, active: true },
    { nome: 'Eduarda Alves', email: 'eduarda@example.test', telefone: '+55 11 91234-5605', valor_mensal: 8.2, dia_vencimento: 20, pattern: 'new', entered: -4, active: true },
    { nome: 'Felipe Souza', email: 'felipe@example.test', telefone: '+55 11 91234-5606', valor_mensal: 7.5, dia_vencimento: 20, pattern: 'archived', entered: -14, active: false },
  ] as const

  const membros = memberSpecs.map((spec, index) => {
    const joined = shiftedMonth(now, spec.entered)
    const created = dateAtDay(joined, 1, 12)
    return {
      id: randomUUID(),
      user_id: DEMO_USER_ID,
      nome: spec.nome,
      email: spec.email,
      telefone: spec.telefone,
      valor_mensal: spec.valor_mensal,
      dia_vencimento: spec.dia_vencimento,
      cor_avatar: ['#48E5B2', '#64A8FF', '#FFB340', '#FF7E72', '#B69CFF', '#85D6A8'][index],
      ativo: spec.active,
      data_entrada: monthISO(joined.getFullYear(), joined.getMonth()),
      created_at: created,
      updated_at: created,
    }
  })

  const pagamentos: DemoRow[] = []
  memberSpecs.forEach((spec, memberIndex) => {
    const membro = membros[memberIndex]
    for (let offset: number = spec.entered; offset <= 0; offset += 1) {
      // The archived member stopped receiving new charges two months ago.
      if (!spec.active && offset >= -1) continue

      const month = shiftedMonth(now, offset)
      const mesReferencia = monthISO(month.getFullYear(), month.getMonth())
      const isDebtorOpenMonth = spec.pattern === 'debtor' && (offset === 0 || offset === -1)
      const status = isDebtorOpenMonth ? 'pendente' : 'pago'
      let paymentDay: number = spec.dia_vencimento
      if (spec.pattern === 'early') paymentDay = Math.max(1, spec.dia_vencimento - 3)
      if (spec.pattern === 'late') paymentDay = spec.dia_vencimento + 7

      pagamentos.push({
        id: randomUUID(),
        membro_id: membro.id,
        mes_referencia: mesReferencia,
        valor: spec.valor_mensal,
        status,
        data_pagamento: status === 'pago' ? dateAtDay(month, paymentDay) : null,
        observacao: null,
        created_at: dateAtDay(month, 1),
      })
    }
  })

  return {
    membros,
    pagamentos,
    configuracoes: [{
      user_id: DEMO_USER_ID,
      valor_plano: 40.9,
      chave_pix: 'demo@spotifamilia.app',
      updated_at: now.toISOString(),
    }],
  }
}

