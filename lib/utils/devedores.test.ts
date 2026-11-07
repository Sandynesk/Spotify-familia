import test from 'node:test'
import assert from 'node:assert/strict'
import type { Membro, Pagamento } from '@/types/database'
import { calcularDevedores, calcularResumoCusto } from './devedores'

const membro = (id: string, nome: string): Membro => ({ id, user_id: 'u', nome, email: null, telefone: null, valor_mensal: 6.5, dia_vencimento: 1, cor_avatar: null, ativo: true, data_entrada: '2026-01-01', created_at: '', updated_at: '' })
const pagamento = (membro_id: string, mes_referencia: string, valor: number, status: Pagamento['status'] = 'pendente'): Pagamento => ({ id: `${membro_id}-${mes_referencia}`, membro_id, mes_referencia, valor, status, data_pagamento: null, observacao: null, created_at: '' })

test('calcula devedores ativos, meses crescentes, atraso e ordenação', () => {
  const a = membro('a', 'Ana'), b = membro('b', 'Bia'), c = membro('c', 'Caio'), off = { ...membro('off', 'Desativado'), ativo: false }
  const result = calcularDevedores([a, b, c, off], [
    pagamento('a', '2026-10-01', 5), pagamento('a', '2026-11-01', 6.5),
    pagamento('b', '2026-11-01', 9), pagamento('c', '2026-11-01', 9),
    pagamento('b', '2026-12-01', 99), pagamento('off', '2026-09-01', 8), pagamento('c', '2026-10-01', 4, 'pago'),
  ], '2026-11-01')
  assert.deepEqual(result.map(d => d.membro.id), ['a', 'b', 'c'])
  assert.deepEqual(result[0].meses, ['2026-10-01', '2026-11-01'])
  assert.equal(result[0].total, 11.5)
  assert.equal(result[0].temAtraso, true)
  assert.equal(result[1].temAtraso, false)
})

test('calcula resumo de custo somente para mês atual', () => {
  const resumo = calcularResumoCusto([pagamento('a', '2026-10-01', 6), pagamento('a', '2026-11-01', 6.5, 'pago'), pagamento('b', '2026-11-01', 6.5)], '2026-11-01', 20)
  assert.deepEqual(resumo, { valorPlano: 20, previstoMes: 13, arrecadadoMes: 6.5, diferenca: -7 })
  assert.equal(calcularResumoCusto([], '2026-11-01', null).diferenca, null)
})
