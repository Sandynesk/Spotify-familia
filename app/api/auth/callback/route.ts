import { NextResponse } from 'next/server'
import { createRealServerClient } from '@/lib/supabase/server'
import { clearDemoCookies } from '@/lib/demo/cookies'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Só aceita caminhos internos (evita redirecionar para outro domínio via //host)
  const requested = searchParams.get('next')
  const next = requested?.startsWith('/') && !requested.startsWith('//') ? requested : '/dashboard'

  // Suporte a host forwarded (Vercel e proxies de produção)
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
  const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1')
  const baseOrigin = !isLocal && forwardedHost ? `${forwardedProto}://${forwardedHost}` : origin

  if (code) {
    const supabase = await createRealServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const response = NextResponse.redirect(`${baseOrigin}${next}`)
      clearDemoCookies(response)
      return response
    }
    console.error('Auth callback exchangeCodeForSession error:', error)
  }

  return NextResponse.redirect(`${baseOrigin}/login?error=auth_callback_error`)
}
