import test from 'node:test'
import assert from 'node:assert/strict'
// @ts-expect-error Node 24 executa TypeScript nativamente e precisa da extensão .ts.
import { gerarIcs } from '../agenda.ts'

test('gera calendário mensal com alarmes, escape e dobra até 75 octetos', () => {
  const membro = { id: 'membro-1', nome: 'Família; São João, super comprida com vários caracteres acentuados', telefone: null, valor_mensal: 20, dia_vencimento: 10, ativo: true, data_entrada: '2025-01-01' }
  const ics = gerarIcs({ membros: [membro], ate: '2027-12-31', nomeCalendario: 'Agenda; Família, São Paulo' })
  assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\n'))
  assert.ok(ics.endsWith('END:VCALENDAR\r\n'))
  assert.match(ics, /BEGIN:VEVENT\r\n/)
  assert.match(ics, /RRULE:FREQ=MONTHLY;BYMONTHDAY=10;UNTIL=/)
  assert.match(ics, /BEGIN:VALARM\r\nACTION:DISPLAY\r\nTRIGGER:PT0S\r\n/)
  assert.match(ics, /SUMMARY:Vencimento de Família\\; São João\\,/)
  for (const linha of ics.split('\r\n').filter(Boolean)) assert.ok(new TextEncoder().encode(linha).length <= 75, `${linha.slice(0, 40)} não deve exceder 75 octetos`)
  assert.ok(ics.includes('\r\n '), 'linhas longas devem continuar com espaço')
})
