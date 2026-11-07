// @ts-expect-error Node 24's native TypeScript runner requires explicit source extensions.
import { createDemoTables, type DemoTables } from './fixtures.ts'

const DEMO_SESSION_TTL_MS = 2 * 60 * 60 * 1000

export interface DemoDatabase {
  tables: DemoTables
  expiresAt: number
}

type DemoGlobal = typeof globalThis & {
  __spotifamiliaDemoSessions?: Map<string, DemoDatabase>
}

function sessions() {
  const root = globalThis as DemoGlobal
  root.__spotifamiliaDemoSessions ??= new Map<string, DemoDatabase>()
  return root.__spotifamiliaDemoSessions
}

/**
 * Demo data lives in this process's global Map for at most two hours. In a
 * serverless deployment, requests routed to another instance may not see a
 * mutation made in this instance; persistent storage is intentionally unused.
 */
export function getDemoDatabase(sid: string): DemoDatabase {
  const allSessions = sessions()
  const now = Date.now()
  for (const [key, value] of allSessions) {
    if (value.expiresAt <= now) allSessions.delete(key)
  }

  const existing = allSessions.get(sid)
  if (existing && existing.expiresAt > now) return existing

  const database = { tables: createDemoTables(), expiresAt: now + DEMO_SESSION_TTL_MS }
  allSessions.set(sid, database)
  return database
}

export function resetDemoDatabase(sid: string): DemoDatabase {
  const database = { tables: createDemoTables(), expiresAt: Date.now() + DEMO_SESSION_TTL_MS }
  sessions().set(sid, database)
  return database
}
