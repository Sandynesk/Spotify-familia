import test from 'node:test'
import assert from 'node:assert/strict'
// @ts-expect-error Node 24 executa TypeScript nativamente e precisa da extensão .ts.
import { gerarQrSvg } from '../qrcode.ts'

test('renderiza um QR Code SVG válido', async () => {
  const svg = await gerarQrSvg('pix-exemplo', { margem: 1, cor: '#111111', fundo: '#ffffff' })
  assert.match(svg, /^<svg /)
  assert.match(svg, /<path/)
  assert.match(svg, /viewBox=/)
})
