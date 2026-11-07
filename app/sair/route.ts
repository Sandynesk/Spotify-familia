import { NextResponse, type NextRequest } from 'next/server'
import { clearDemoCookies } from '@/lib/demo/cookies'
import { createRealServerClient } from '@/lib/supabase/server'

async function sair(request: NextRequest) {
  const isDemo = request.cookies.get('sf_demo')?.value === '1'
  if (isDemo) {
    const response = NextResponse.redirect(new URL('/', request.url), 303)
    clearDemoCookies(response)
    return response
  }

  const supabase = await createRealServerClient()
  await supabase.auth.signOut()
  const response = NextResponse.redirect(new URL('/login', request.url), 303)
  clearDemoCookies(response)
  return response
}

export const GET = sair
export const POST = sair
