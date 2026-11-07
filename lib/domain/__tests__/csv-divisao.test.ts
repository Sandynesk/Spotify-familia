import test from 'node:test'
import assert from 'node:assert/strict'
// @ts-expect-error Node 24 executa TypeScript nativamente e precisa da extensão .ts.
import { gerarCsv } from '../csv.ts'
// @ts-expect-error Node 24 executa TypeScript nativamente e precisa da extensão .ts.
import { dividirPlano, reajuste } from '../divisao.ts'

test('CSV inclui BOM, usa ponto e vírgula, vírgula decimal e escapa aspas, separadores e quebras', () => {
  const csv = gerarCsv([{ nome: 'Ana; "A"', nota: 'linha 1\nlinha 2', valor: 6.5 }], [{ chave: 'nome', titulo: 'Nome' }, { chave: 'nota', titulo: 'Observação' }, { chave: 'valor', titulo: 'Valor' }])
  assert.ok(csv.startsWith('\uFEFF'))
  assert.equal(csv, '\uFEFFNome;Observação;Valor\r\n"Ana; ""A""";"linha 1\nlinha 2";6,5')
})

test('divisão e reajuste somam exatamente o valor em centavos', () => {
  const divisao = dividirPlano(100, 3)
  assert.deepEqual(divisao.valores, [33.34, 33.33, 33.33])
  assert.equal(divisao.totalCobrado, 100)
  const membros = [
    { id: 'a', nome: 'Ana', valor_mensal: 10, dia_vencimento: 1, ativo: true, data_entrada: '2025-01-01' },
    { id: 'b', nome: 'Bia', valor_mensal: 20, dia_vencimento: 1, ativo: true, data_entrada: '2025-01-01' },
    { id: 'c', nome: 'Caio', valor_mensal: 30, dia_vencimento: 1, ativo: true, data_entrada: '2025-01-01' },
  ]
  const itens = reajuste(membros, 100, 'proporcional')
  assert.equal(itens.reduce((soma, item) => soma + item.novoValor, 0), 100)
  assert.deepEqual(itens.map(item => item.novoValor), [16.67, 33.33, 50])
})
