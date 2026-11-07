import test from 'node:test'
import assert from 'node:assert/strict'
import { gerarTextoRelatorio } from './relatorio'

test('agrupa e ordena linhas e formata valores com centavos', () => {
  const texto = gerarTextoRelatorio({ mesReferencia: '2026-11-01', chavePix: 'pix@x', linhas: [
    { nome: 'Zeca', meses: ['2026-10-01', '2026-11-01'], total: 13 },
    { nome: 'Bia', meses: ['2026-11-01'], total: 6.5 },
    { nome: 'Ana', meses: [], total: 0 },
    { nome: 'Alice', meses: [], total: 0 },
  ] })
  assert.match(texto, /🎵 \*Spotify Família — Novembro\*/)
  assert.ok(texto.indexOf('✅ Alice') < texto.indexOf('✅ Ana'))
  assert.match(texto, /⏳ Bia — R\$ 6,50 \(nov\)/)
  assert.match(texto, /⚠️ Zeca — R\$ 13,00 \(out, nov\)/)
  assert.match(texto, /PIX: pix@x/)
})

test('inclui ano curto para meses fora do ano do relatório e omite PIX vazio', () => {
  const texto = gerarTextoRelatorio({ mesReferencia: '2026-01-01', chavePix: null, linhas: [{ nome: 'Duda', meses: ['2025-12-01'], total: 1.2 }] })
  assert.match(texto, /dez\/25/)
  assert.doesNotMatch(texto, /PIX:/)
  assert.match(texto, /R\$ 1,20/)
})

test('mensagem especial quando todos estão em dia', () => {
  const texto = gerarTextoRelatorio({ mesReferencia: '2026-11-01', chavePix: null, linhas: [{ nome: 'Ana', meses: [], total: 0 }] })
  assert.match(texto, /Todo mundo em dia este mês! 🎉 Valeu, pessoal 💚/)
  assert.equal(texto.split('\n').length, 3)
})
