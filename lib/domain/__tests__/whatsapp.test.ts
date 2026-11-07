import test from 'node:test'
import assert from 'node:assert/strict'
// @ts-expect-error Node 24 executa TypeScript nativamente e precisa da extensão .ts.
import { gerarMensagemCobranca, linkWhatsApp, normalizarTelefoneBR } from '../whatsapp.ts'

test('normaliza telefones brasileiros para wa.me e rejeita formatos incompletos', () => {
  assert.equal(normalizarTelefoneBR('(11) 99999-1234'), '5511999991234')
  assert.equal(normalizarTelefoneBR('+55 11 3333-1234'), '551133331234')
  assert.equal(normalizarTelefoneBR('11999'), null)
  assert.equal(linkWhatsApp(null, 'Olá, Ana!'), 'https://wa.me/?text=Ol%C3%A1%2C%20Ana!')
  assert.equal(linkWhatsApp('(11) 99999-1234', 'Oi'), 'https://wa.me/5511999991234?text=Oi')
})

test('mensagem de cobrança escreve os meses por extenso e deixa PIX no fim', () => {
  const mensagem = gerarMensagemCobranca({ nome: 'Ana', meses: ['2026-10-01', '2026-11-01'], total: 13, chavePix: 'ana@email.com', tom: 'gentil' })
  assert.match(mensagem, /outubro e novembro/)
  assert.match(mensagem, /R\$\s?13,00/)
  assert.ok(mensagem.endsWith('Chave PIX: ana@email.com'))
  assert.ok(mensagem.indexOf('Obrigado!') < mensagem.indexOf('Chave PIX:'))
})
