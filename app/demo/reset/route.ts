import { randomUUID } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { isValidDemoSid, setDemoCookies } from '@/lib/demo/cookies'
import { resetDemoDatabase } from '@/lib/demo/store'

export function GET(request: NextRequest) {
  const existingSid = request.cookies.get('sf_demo_sid')?.value
  const sid = request.cookies.get('sf_demo')?.value === '1' && isValidDemoSid(existingSid)
    ? existingSid
    : randomUUID()

  resetDemoDatabase(sid)
  const response = NextResponse.redirect(new URL('/dashboard', request.url), 303)
  setDemoCookies(response, sid)
  return response
}
