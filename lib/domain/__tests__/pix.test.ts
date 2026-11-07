import test from 'node:test'
import assert from 'node:assert/strict'
// @ts-expect-error Node 24 executa TypeScript nativamente e precisa da extensão .ts.
import { crc16CcittFalse, detectarTipoChave, gerarPixCopiaECola } from '../pix.ts'

function crcReferencia(texto: string): string {
  let crc = 0xffff
  for (const byte of new TextEncoder().encode(texto)) {
    crc ^= byte << 8
    for (let bit = 0; bit < 8; bit++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

function tlv(payload: string): Map<string, string> {
  const campos = new Map<string, string>()
  let cursor = 0
  while (cursor < payload.length) {
    const id = payload.slice(cursor, cursor + 2)
    const tamanho = Number(payload.slice(cursor + 2, cursor + 4))
    assert.equal(Number.isInteger(tamanho), true, `tamanho TLV válido para ${id}`)
    const valor = payload.slice(cursor + 4, cursor + 4 + tamanho)
    assert.equal(valor.length, tamanho, `valor TLV completo para ${id}`)
    campos.set(id, valor)
    cursor += 4 + tamanho
  }
  assert.equal(cursor, payload.length)
  return campos
}

test('CRC-16/CCITT-FALSE bate com o vetor público e referência independente', () => {
  assert.equal(crc16CcittFalse('123456789'), '29B1')
  const pix = gerarPixCopiaECola({ chave: 'ana@example.com', valor: 12.5, nome: 'Ana Família', cidade: 'São Paulo', txid: 'ABC123', descricao: 'mensalidade' })
  const entradaCRC = pix.slice(0, -4)
  assert.equal(pix.slice(-4), crcReferencia(entradaCRC))
  assert.equal(pix.slice(-4), crc16CcittFalse(entradaCRC))
})

test('BR Code contém TLV aninhado, campos principais e chave normalizada', () => {
  const pix = gerarPixCopiaECola({ chave: '(11) 99999-1234', valor: 29.9, nome: 'Família do João', cidade: 'São Paulo' })
  assert.equal(pix.slice(-8, -4), '6304')
  const principais = tlv(pix.slice(0, -8))
  assert.equal(principais.get('00'), '01')
  assert.equal(principais.get('52'), '0000')
  assert.equal(principais.get('53'), '986')
  assert.equal(principais.get('54'), '29.90')
  assert.equal(principais.get('58'), 'BR')
  assert.equal(principais.get('59'), 'Familia do Joao')
  assert.equal(principais.get('60'), 'Sao Paulo')
  const conta = tlv(principais.get('26')!)
  assert.equal(conta.get('00'), 'br.gov.bcb.pix')
  assert.equal(conta.get('01'), '+5511999991234')
  assert.equal(conta.get('02'), undefined)
  assert.equal(tlv(principais.get('62')!).get('05'), '***')
})

test('detecta e normaliza chaves de telefone, documento e e-mail', () => {
  assert.equal(detectarTipoChave('+55 11 99999-1234'), 'telefone')
  assert.equal(detectarTipoChave('ana@exemplo.com'), 'email')
  assert.equal(detectarTipoChave('123.456.789-09'), 'cpf')
  assert.equal(detectarTipoChave('12.345.678/0001-90'), 'cnpj')
  const pixEmail = gerarPixCopiaECola({ chave: 'ANA@EXEMPLO.COM', valor: 1, nome: 'A', cidade: 'B' })
  assert.equal(tlv(tlv(pixEmail.slice(0, -8)).get('26')!).get('01'), 'ana@exemplo.com')
})
