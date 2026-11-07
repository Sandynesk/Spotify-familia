import test from 'node:test'
import assert from 'node:assert/strict'
// @ts-expect-error Node 24 executa TypeScript nativamente e precisa da extensão .ts.
import { previsaoProximosMeses, ranking, resumoDoAno, saldoDoPlano, serieMensal, taxaDeRecebimento, tempoMedioParaReceber } from '../insights.ts'
// @ts-expect-error Node 24 executa TypeScript nativamente e precisa da extensão .ts.
import { calcularRetrospectiva } from '../wrapped.ts'

const membros = [
  { id: 'a', nome: 'Ana', valor_mensal: 20, dia_vencimento: 10, ativo: true, data_entrada: '2026-01-01' },
  { id: 'b', nome: 'Bia', valor_mensal: 30, dia_vencimento: 10, ativo: true, data_entrada: '2026-01-01' },
]
const pagamentos = [
  { id: 'a-jan', membro_id: 'a', mes_referencia: '2026-01-01', valor: 20, status: 'pago' as const, data_pagamento: '2026-01-10T12:00:00Z' },
  { id: 'b-jan', membro_id: 'b', mes_referencia: '2026-01-01', valor: 30, status: 'pendente' as const, data_pagamento: null },
  { id: 'a-fev', membro_id: 'a', mes_referencia: '2026-02-01', valor: 20, status: 'pago' as const, data_pagamento: '2026-02-08T12:00:00Z' },
]

test('insights resumem previsto, recebido, saldo, previsão e pontualidade', () => {
  assert.deepEqual(serieMensal(pagamentos, ['2026-01-01', '2026-02-01']), [
    { mesReferencia: '2026-01-01', previsto: 50, arrecadado: 20 },
    { mesReferencia: '2026-02-01', previsto: 20, arrecadado: 20 },
  ])
  assert.deepEqual(saldoDoPlano({ valorPlano: 45, previstoMes: 50, arrecadadoMes: 20 }), { valorPlano: 45, previstoMes: 50, arrecadadoMes: 20, sobraPrevista: 5, sobraAtual: -25, faltaPrevista: 0, faltaAtual: 25 })
  assert.deepEqual(previsaoProximosMeses(membros, 2, new Date('2026-11-07T12:00:00Z')).map(m => m.mesReferencia), ['2026-12-01', '2027-01-01'])
  assert.equal(taxaDeRecebimento(pagamentos), 57)
  assert.equal(tempoMedioParaReceber(membros, pagamentos), -1)
  assert.equal(resumoDoAno(membros, pagamentos, 2026).arrecadado, 40)
  assert.equal(ranking(membros, pagamentos, new Date('2026-02-20T12:00:00Z'))[0].membroId, 'a')
})

test('retrospectiva traz os cards e números derivados do ano', () => {
  const dados = calcularRetrospectiva({ ano: 2026, membros: membros.slice(0, 1), pagamentos: [pagamentos[0]], valorPlano: 25 })
  assert.equal(dados.totalArrecadado, 20)
  assert.equal(dados.mesesFechados, 1)
  assert.equal(dados.economia, 20)
  assert.equal(dados.cards.length, 7)
  assert.equal(dados.membroMaisPontual?.nome, 'Ana')
})
