import { NextResponse } from 'next/server'
import { clearDemoCookies } from '@/lib/demo/cookies'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  clearDemoCookies(response)
  return response
}
