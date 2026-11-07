import type { NextResponse } from 'next/server'

export const DEMO_COOKIE_MAX_AGE = 2 * 60 * 60

export function isValidDemoSid(value: string | undefined): value is string {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value))
}

export function setDemoCookies(response: NextResponse, sid: string) {
  const options = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.VERCEL === '1',
    path: '/',
    maxAge: DEMO_COOKIE_MAX_AGE,
  }
  response.cookies.set('sf_demo', '1', options)
  response.cookies.set('sf_demo_sid', sid, options)
  // Client-side hint only; server authorization always relies on sf_demo.
  response.cookies.set('sf_demo_client', '1', { ...options, httpOnly: false })
}

export function clearDemoCookies(response: NextResponse) {
  const options = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.VERCEL === '1',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  }
  response.cookies.set('sf_demo', '', options)
  response.cookies.set('sf_demo_sid', '', options)
  response.cookies.set('sf_demo_client', '', { ...options, httpOnly: false })
}
