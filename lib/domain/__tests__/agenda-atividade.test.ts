import test from 'node:test'
import assert from 'node:assert/strict'
// @ts-expect-error Node 24 executa TypeScript nativamente e precisa da extensão .ts.
import { proximosVencimentos } from '../agenda.ts'
// @ts-expect-error Node 24 executa TypeScript nativamente e precisa da extensão .ts.
import { linhaDoTempo } from '../atividade.ts'

test('agenda ordena vencimentos e sinaliza cobrança vencida no mês atual', () => {
  const membros = [
    { id: 'atrasada', nome: 'Ana', valor_mensal: 20, dia_vencimento: 10, telefone: null, ativo: true, data_entrada: '2026-01-01' },
    { id: 'proxima', nome: 'Bia', valor_mensal: 30, dia_vencimento: 28, telefone: '11999991234', ativo: true, data_entrada: '2026-01-01' },
  ]
  const vencimentos = proximosVencimentos(membros, [], new Date('2026-11-27T12:00:00'), 3)
  assert.equal(vencimentos.length, 2)
  assert.equal(vencimentos[0].status, 'atrasado')
  assert.equal(vencimentos[1].status, 'pendente')
  assert.equal(vencimentos[1].dataVencimento, '2026-11-28')
})

test('linha do tempo deriva entrada, pagamento e atraso, ordenados do mais recente', () => {
  const membro = { id: 'm1', nome: 'Ana', valor_mensal: 20, dia_vencimento: 10, ativo: true, data_entrada: '2026-01-01T00:00:00Z' }
  const pagamentos = [
    { id: 'pago', membro_id: 'm1', mes_referencia: '2026-10-01', valor: 20, status: 'pago' as const, data_pagamento: '2026-10-09T12:00:00Z' },
    { id: 'aberto', membro_id: 'm1', mes_referencia: '2026-09-01', valor: 20, status: 'pendente' as const, data_pagamento: null },
  ]
  const eventos = linhaDoTempo([membro], pagamentos, 10)
  assert.deepEqual(eventos.map(evento => evento.tipo), ['pagou', 'atrasou', 'entrou'])
})
