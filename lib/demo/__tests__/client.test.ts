import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { test } from 'node:test'
// @ts-expect-error Node 24's native TypeScript runner requires explicit source extensions.
import { createDemoClient } from '../client.ts'
// @ts-expect-error Node 24's native TypeScript runner requires explicit source extensions.
import { DEMO_USER_ID } from '../fixtures.ts'

function client() {
  return createDemoClient(randomUUID())
}

test('combines filters and projects selected columns', async () => {
  const supabase = client()
  const { data, error } = await supabase
    .from('membros')
    .select('id, nome, valor_mensal')
    .eq('ativo', true)
    .in('dia_vencimento', [5, 10])
    .gte('valor_mensal', 8)

  assert.equal(error, null)
  assert.ok(Array.isArray(data))
  assert.deepEqual(data.map(member => member.nome).sort(), ['Ana Lima', 'Bruno Costa', 'Carla Mendes'])
  assert.deepEqual(Object.keys(data[0]).sort(), ['id', 'nome', 'valor_mensal'])
})

test('supports stable multi-column ordering and pagination', async () => {
  const supabase = client()
  const { data, error } = await supabase
    .from('membros')
    .select('nome, ativo')
    .order('ativo', { ascending: true })
    .order('nome', { ascending: false })
    .range(0, 1)

  assert.equal(error, null)
  assert.deepEqual(data, [
    { nome: 'Felipe Souza', ativo: false },
    { nome: 'Eduarda Alves', ativo: true },
  ])
})

test('upsert ignoreDuplicates preserves an existing row', async () => {
  const supabase = client()
  const { error: upsertError } = await supabase
    .from('configuracoes')
    .upsert({ user_id: DEMO_USER_ID, valor_plano: 99 }, { onConflict: 'user_id', ignoreDuplicates: true })

  const { data, error } = await supabase
    .from('configuracoes')
    .select('valor_plano')
    .eq('user_id', DEMO_USER_ID)
    .single()

  assert.equal(upsertError, null)
  assert.equal(error, null)
  assert.equal(data.valor_plano, 40.9)
})

test('update only changes rows matching its filters', async () => {
  const supabase = client()
  const { data: ana } = await supabase.from('membros').select('id').eq('nome', 'Ana Lima').single()
  assert.ok(ana)
  const { data, error } = await supabase
    .from('membros')
    .update({ telefone: '+55 11 90000-0000' })
    .eq('id', ana.id)
    .eq('ativo', true)
    .select('id, telefone')

  assert.equal(error, null)
  assert.deepEqual(data, [{ id: ana.id, telefone: '+55 11 90000-0000' }])

  const { data: bruno } = await supabase.from('membros').select('telefone').eq('nome', 'Bruno Costa').single()
  assert.ok(bruno)
  assert.notEqual(bruno.telefone, '+55 11 90000-0000')
})

test('marking a payment paid persists in the demo session', async () => {
  const supabase = client()
  const { data: pending } = await supabase
    .from('pagamentos')
    .select('id')
    .eq('status', 'pendente')
    .order('mes_referencia', { ascending: false })
    .limit(1)
    .single()
  assert.ok(pending)

  const paidAt = new Date().toISOString()
  const { error: updateError } = await supabase
    .from('pagamentos')
    .update({ status: 'pago', data_pagamento: paidAt })
    .eq('id', pending.id)
  const { data: updated, error: readError } = await supabase
    .from('pagamentos')
    .select('status, data_pagamento')
    .eq('id', pending.id)
    .single()

  assert.equal(updateError, null)
  assert.equal(readError, null)
  assert.equal(updated.status, 'pago')
  assert.equal(updated.data_pagamento, paidAt)
})

test('single and maybeSingle have the expected empty and unique behavior', async () => {
  const supabase = client()
  const { data: optional, error: optionalError } = await supabase
    .from('membros')
    .select('id')
    .eq('nome', 'Pessoa inexistente')
    .maybeSingle()
  const { data: strict, error: strictError } = await supabase
    .from('membros')
    .select('id')
    .eq('nome', 'Pessoa inexistente')
    .single()
  const { data: unique, error: uniqueError } = await supabase
    .from('membros')
    .select('nome')
    .eq('nome', 'Ana Lima')
    .single()

  assert.equal(optional, null)
  assert.equal(optionalError, null)
  assert.equal(strict, null)
  assert.equal(strictError?.code, 'PGRST116')
  assert.deepEqual(unique, { nome: 'Ana Lima' })
  assert.equal(uniqueError, null)
})
