import { randomUUID } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { getDemoDatabase } from '@/lib/demo/store'
import { setDemoCookies } from '@/lib/demo/cookies'

export function GET(request: NextRequest) {
  const sid = randomUUID()
  getDemoDatabase(sid)
  const response = NextResponse.redirect(new URL('/dashboard', request.url), 303)
  setDemoCookies(response, sid)
  return response
}
