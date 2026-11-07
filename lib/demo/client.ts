import { randomUUID } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
// @ts-expect-error Node 24's native TypeScript runner requires explicit source extensions.
import { DEMO_USER_ID, type DemoRow } from './fixtures.ts'
// @ts-expect-error Node 24's native TypeScript runner requires explicit source extensions.
import { getDemoDatabase } from './store.ts'

type DemoError = {
  code: string
  message: string
  details: string | null
  hint: string | null
}

type DemoResult = {
  data: unknown
  error: DemoError | null
  count: number | null
}

type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'is'
type Filter = { column: string; operator: FilterOperator; value: unknown }
type Order = { column: string; ascending: boolean; nullsFirst?: boolean }
type Mutation = 'select' | 'insert' | 'update' | 'upsert' | 'delete'

const demoUser = {
  id: DEMO_USER_ID,
  aud: 'authenticated',
  role: 'authenticated',
  email: 'voce@demo.spotifamilia.app',
  created_at: '2026-01-01T12:00:00.000Z',
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: { name: 'Você (demo)' },
  identities: [],
}

function asRows(value: unknown): DemoRow[] {
  if (Array.isArray(value)) return value as DemoRow[]
  if (value && typeof value === 'object') return [value as DemoRow]
  return []
}

function isEqual(left: unknown, right: unknown) {
  return left === right || (left instanceof Date && right instanceof Date && left.getTime() === right.getTime())
}

function compareValues(left: unknown, right: unknown) {
  if (left === right) return 0
  if (left == null) return -1
  if (right == null) return 1
  if (typeof left === 'number' && typeof right === 'number') return left - right
  if (typeof left === 'boolean' && typeof right === 'boolean') return Number(left) - Number(right)
  return String(left).localeCompare(String(right))
}

function defaultRow(table: string, input: DemoRow): DemoRow {
  const now = new Date().toISOString()
  if (table === 'membros') {
    return {
      id: randomUUID(), email: null, telefone: null, cor_avatar: null, ativo: true,
      data_entrada: now.slice(0, 10), created_at: now, updated_at: now, ...input,
    }
  }
  if (table === 'pagamentos') {
    return {
      id: randomUUID(), status: 'pendente', data_pagamento: null, observacao: null,
      created_at: now, ...input,
    }
  }
  if (table === 'configuracoes') return { valor_plano: null, chave_pix: null, updated_at: now, ...input }
  return { id: randomUUID(), created_at: now, ...input }
}

class DemoQueryBuilder implements PromiseLike<DemoResult> {
  private readonly table: string
  private readonly tables: Record<string, DemoRow[]>
  private mutation: Mutation = 'select'
  private input: DemoRow[] = []
  private filters: Filter[] = []
  private orders: Order[] = []
  private columns = '*'
  private countRequested = false
  private headOnly = false
  private returning = false
  private singleMode: 'single' | 'maybeSingle' | null = null
  private pageOffset = 0
  private pageLimit: number | null = null
  private onConflict: string[] = []
  private ignoreDuplicates = false
  private cachedExecution: Promise<DemoResult> | null = null

  constructor(table: string, tables: Record<string, DemoRow[]>) {
    this.table = table
    this.tables = tables
  }

  select(columns = '*', options: { count?: string; head?: boolean } = {}) {
    this.columns = columns
    this.countRequested = Boolean(options.count)
    this.headOnly = Boolean(options.head)
    this.returning = this.mutation !== 'select' || this.returning
    return this
  }

  insert(values: DemoRow | DemoRow[]) {
    this.mutation = 'insert'
    this.input = asRows(values)
    return this
  }

  update(values: DemoRow) {
    this.mutation = 'update'
    this.input = [values]
    return this
  }

  upsert(values: DemoRow | DemoRow[], options: { onConflict?: string; ignoreDuplicates?: boolean } = {}) {
    this.mutation = 'upsert'
    this.input = asRows(values)
    this.onConflict = (options.onConflict || 'id').split(',').map(column => column.trim()).filter(Boolean)
    this.ignoreDuplicates = Boolean(options.ignoreDuplicates)
    return this
  }

  delete() {
    this.mutation = 'delete'
    return this
  }

  eq(column: string, value: unknown) { return this.addFilter('eq', column, value) }
  neq(column: string, value: unknown) { return this.addFilter('neq', column, value) }
  gt(column: string, value: unknown) { return this.addFilter('gt', column, value) }
  gte(column: string, value: unknown) { return this.addFilter('gte', column, value) }
  lt(column: string, value: unknown) { return this.addFilter('lt', column, value) }
  lte(column: string, value: unknown) { return this.addFilter('lte', column, value) }
  is(column: string, value: unknown) { return this.addFilter('is', column, value) }

  in(column: string, values: unknown[]) {
    return this.addFilter('in', column, values)
  }

  order(column: string, options: { ascending?: boolean; nullsFirst?: boolean } = {}) {
    this.orders.push({ column, ascending: options.ascending !== false, nullsFirst: options.nullsFirst })
    return this
  }

  limit(count: number) {
    this.pageLimit = Math.max(0, count)
    return this
  }

  range(from: number, to: number) {
    this.pageOffset = Math.max(0, from)
    this.pageLimit = Math.max(0, to - from + 1)
    return this
  }

  single() {
    this.singleMode = 'single'
    return this
  }

  maybeSingle() {
    this.singleMode = 'maybeSingle'
    return this
  }

  then<TResult1 = DemoResult, TResult2 = never>(
    onfulfilled?: ((value: DemoResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected)
  }

  private addFilter(operator: FilterOperator, column: string, value: unknown) {
    this.filters.push({ operator, column, value })
    return this
  }

  private relatedMember(row: DemoRow) {
    const memberId = row.membro_id
    return this.tables.membros?.find(member => member.id === memberId) ?? null
  }

  private valueAt(row: DemoRow, column: string) {
    if (column.startsWith('membros.')) return this.relatedMember(row)?.[column.slice('membros.'.length)]
    return row[column]
  }

  private matches(row: DemoRow) {
    return this.filters.every(({ column, operator, value }) => {
      const actual = this.valueAt(row, column)
      switch (operator) {
        case 'eq': return isEqual(actual, value)
        case 'neq': return !isEqual(actual, value)
        case 'gt': return actual != null && compareValues(actual, value) > 0
        case 'gte': return actual != null && compareValues(actual, value) >= 0
        case 'lt': return actual != null && compareValues(actual, value) < 0
        case 'lte': return actual != null && compareValues(actual, value) <= 0
        case 'in': return Array.isArray(value) && value.some(candidate => isEqual(actual, candidate))
        case 'is': return isEqual(actual, value)
      }
    })
  }

  private ordered(rows: DemoRow[]) {
    if (this.orders.length === 0) return rows
    return [...rows].sort((left, right) => {
      for (const order of this.orders) {
        const a = this.valueAt(left, order.column)
        const b = this.valueAt(right, order.column)
        let comparison = compareValues(a, b)
        if (a == null || b == null) {
          const nullsFirst = order.nullsFirst ?? !order.ascending
          comparison = a == null ? (nullsFirst ? -1 : 1) : (nullsFirst ? 1 : -1)
        }
        if (comparison !== 0) return order.ascending ? comparison : -comparison
      }
      return 0
    })
  }

  private hasInnerMemberJoin() {
    return /\bmembros\s*!inner\s*\(/.test(this.columns)
  }

  private project(row: DemoRow): DemoRow {
    const relation = this.columns.match(/\bmembros(?:!inner)?\s*\(([^)]*)\)/)
    const selectedColumns = this.columns.split(',').map(value => value.trim()).filter(Boolean)
    const includeAll = selectedColumns.includes('*')
    const result: DemoRow = includeAll ? { ...row } : {}

    if (!includeAll) {
      for (const selection of selectedColumns) {
        if (selection === '*' || /^membros(?:!inner)?\s*\(/.test(selection)) continue
        const [alias, rawColumn] = selection.includes(':') ? selection.split(':', 2) : [null, selection]
        const column = rawColumn.trim().split('.').pop() || rawColumn.trim()
        if (column in row) result[alias?.trim() || column] = row[column]
      }
    }

    if (relation) {
      const member = this.relatedMember(row)
      if (member) {
        const fields = relation[1].split(',').map(field => field.trim()).filter(Boolean)
        const memberData: DemoRow = fields.includes('*') ? { ...member } : {}
        for (const field of fields) {
          if (field === '*') continue
          const [alias, rawColumn] = field.includes(':') ? field.split(':', 2) : [null, field]
          const column = rawColumn.trim().split('.').pop() || rawColumn.trim()
          if (column in member) memberData[alias?.trim() || column] = member[column]
        }
        result.membros = memberData
      } else if (this.hasInnerMemberJoin()) {
        result.membros = null
      }
    }

    return result
  }

  private execute(): Promise<DemoResult> {
    this.cachedExecution ??= Promise.resolve().then(() => this.run())
    return this.cachedExecution
  }

  private run(): DemoResult {
    const rows = this.tables[this.table] ?? (this.tables[this.table] = [])
    let affected: DemoRow[] = []

    if (this.mutation === 'select') {
      affected = rows.filter(row => this.matches(row))
    } else if (this.mutation === 'insert') {
      affected = this.input.map(input => defaultRow(this.table, input))
      rows.push(...affected)
    } else if (this.mutation === 'upsert') {
      for (const input of this.input) {
        const existing = rows.find(row => this.onConflict.every(column => isEqual(row[column], input[column])))
        if (existing) {
          if (this.ignoreDuplicates) continue
          Object.assign(existing, input)
          if (this.table === 'membros' || this.table === 'configuracoes') existing.updated_at = new Date().toISOString()
          affected.push(existing)
        } else {
          const inserted = defaultRow(this.table, input)
          rows.push(inserted)
          affected.push(inserted)
        }
      }
    } else if (this.mutation === 'update') {
      affected = rows.filter(row => this.matches(row))
      for (const row of affected) {
        Object.assign(row, this.input[0])
        if (this.table === 'membros' || this.table === 'configuracoes') row.updated_at = new Date().toISOString()
      }
    } else if (this.mutation === 'delete') {
      affected = rows.filter(row => this.matches(row))
      const deletedIds = new Set(affected.map(row => row.id))
      this.tables[this.table] = rows.filter(row => !deletedIds.has(row.id))
      if (this.table === 'membros' && this.tables.pagamentos) {
        const deletedMemberIds = new Set(affected.map(row => row.id))
        this.tables.pagamentos = this.tables.pagamentos.filter(row => !deletedMemberIds.has(row.membro_id))
      }
    }

    const count = affected.length
    let selected = this.ordered(affected)
    if (this.pageOffset > 0 || this.pageLimit !== null) {
      selected = selected.slice(this.pageOffset, this.pageLimit === null ? undefined : this.pageOffset + this.pageLimit)
    }

    let data: unknown = null
    if (this.returning || this.mutation === 'select') {
      data = this.headOnly ? null : selected.map(row => this.project(row))
      if (Array.isArray(data) && this.singleMode) {
        if (data.length === 1) data = data[0]
        else if (data.length === 0 && this.singleMode === 'maybeSingle') data = null
        else {
          return {
            data: null,
            error: {
              code: 'PGRST116',
              message: `JSON object requested, ${data.length === 0 ? 'no' : 'multiple'} rows returned`,
              details: null,
              hint: null,
            },
            count: this.countRequested ? count : null,
          }
        }
      }
    }

    return { data, error: null, count: this.countRequested ? count : null }
  }
}

/**
 * Supabase-compatible in-memory subset used only by demo requests. The cast
 * keeps existing server actions typed as SupabaseClient without changing them.
 */
export function createDemoClient(sid: string): SupabaseClient {
  const database = getDemoDatabase(sid)
  const expiresAt = Math.floor(database.expiresAt / 1000)
  const session = {
    access_token: `demo-${sid}`,
    token_type: 'bearer',
    expires_in: Math.max(0, expiresAt - Math.floor(Date.now() / 1000)),
    expires_at: expiresAt,
    refresh_token: `demo-refresh-${sid}`,
    user: demoUser,
  }

  return {
    auth: {
      async getUser() { return { data: { user: demoUser }, error: null } },
      async getSession() { return { data: { session }, error: null } },
      async signOut() { return { error: null } },
    },
    from(table: string) { return new DemoQueryBuilder(table, database.tables) },
  } as unknown as SupabaseClient
}
