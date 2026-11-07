import test from 'node:test'
import assert from 'node:assert/strict'
// @ts-expect-error Node 24 executa TypeScript nativamente e precisa da extensão .ts.
import { calcularPontualidade, diasDeAtraso } from '../pontualidade.ts'

const membro = { id: 'm1', nome: 'Ana', valor_mensal: 20, dia_vencimento: 10, ativo: true, data_entrada: '2025-01-01' }
const pagamento = (mes_referencia: string, data_pagamento: string) => ({ id: mes_referencia, membro_id: 'm1', mes_referencia, valor: 20, status: 'pago' as const, data_pagamento })

test('mede pagamento adiantado, atraso e sequência de meses no prazo', () => {
  const jan = pagamento('2026-01-01', '2026-01-08T14:00:00Z')
  const abr = pagamento('2026-04-01', '2026-04-15T09:00:00Z')
  assert.equal(diasDeAtraso(jan, membro), -2)
  assert.equal(diasDeAtraso(abr, membro), 5)
  const pagamentos = [jan, pagamento('2026-02-01', '2026-02-09T09:00:00Z'), pagamento('2026-03-01', '2026-03-09T09:00:00Z'), abr, pagamento('2026-05-01', '2026-05-10T09:00:00Z'), pagamento('2026-06-01', '2026-06-10T09:00:00Z')]
  const resultado = calcularPontualidade(membro, pagamentos, new Date('2026-06-15T12:00:00Z'))
  assert.equal(resultado.sequenciaAtual, 2)
  assert.equal(resultado.maiorSequencia, 3)
  assert.equal(resultado.percentualNoPrazo, 83)
  assert.ok(resultado.scorePontualidade > 0 && resultado.scorePontualidade < 100)
  assert.ok(resultado.selos.some(selo => selo.id === 'relampago'))
})
