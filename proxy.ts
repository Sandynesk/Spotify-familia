import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { isDemoProtectedRoute } from '@/lib/demo/routes'
import { clearDemoCookies } from '@/lib/demo/cookies'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rotas de autenticação e rotas de callback do OAuth
  const isAuthRoute = pathname === '/login' || pathname === '/cadastro' || pathname === '/recuperar-senha'
  const isAuthCallback = pathname === '/api/auth/callback'

  // Verifica se o request já possui cookies de autenticação do Supabase
  const hasSupabaseAuth = request.cookies.getAll().some(
    (c) => (c.name.startsWith('sb-') && c.name.includes('-auth-token')) || c.name.includes('-auth-token')
  )

  const hasDemoCookie = request.cookies.get('sf_demo')?.value === '1'

  // Se o usuário estiver acessando rotas de login/cadastro/recuperação
  if (isAuthRoute) {
    const isPrefetch = request.headers.get('next-router-prefetch') === '1' ||
                       request.headers.get('purpose') === 'prefetch' ||
                       request.nextUrl.searchParams.has('_rsc')
    if (isPrefetch) {
      return NextResponse.next()
    }
    // Ao navegar para login ou cadastro, limpar cookies de demonstração imediatamente
    if (hasDemoCookie) {
      request.cookies.delete('sf_demo')
      request.cookies.delete('sf_demo_sid')
      request.cookies.delete('sf_demo_client')
    }
  }

  // Se o usuário possui sessão do Supabase, qualquer resquício de cookies demo deve ser removido
  if (hasSupabaseAuth && hasDemoCookie) {
    request.cookies.delete('sf_demo')
    request.cookies.delete('sf_demo_sid')
    request.cookies.delete('sf_demo_client')
  }

  // Demo requests são tratadas SEM consultar o Supabase APENAS se:
  // 1. O usuário NÃO tiver sessão de auth do Supabase
  // 2. NÃO for uma rota de autenticação (/login, /cadastro, /recuperar-senha)
  // 3. NÃO for callback do OAuth (/api/auth/callback)
  if (!hasSupabaseAuth && !isAuthRoute && !isAuthCallback && request.cookies.get('sf_demo')?.value === '1') {
    if (pathname === '/api/keep-alive') return NextResponse.json({ ok: true, demo: true })
    if (isDemoProtectedRoute(pathname)) return NextResponse.next()
    return NextResponse.next()
  }

  // Entrar ou resetar a demo não requer lookup de auth
  if (pathname === '/demo' || pathname === '/demo/reset') return NextResponse.next()

  let supabaseResponse = NextResponse.next({ request })

  // Se o usuário tinha cookie de demo mas acessou rota de auth ou já está logado, garante que a resposta limpe os cookies do browser
  if ((isAuthRoute || hasSupabaseAuth) && hasDemoCookie) {
    clearDemoCookies(supabaseResponse)
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            if ((isAuthRoute || hasSupabaseAuth) && hasDemoCookie) {
              clearDemoCookies(supabaseResponse)
            }
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    const isProtectedRoute = isDemoProtectedRoute(pathname)

    // Se tentar acessar rota protegida sem estar logado
    if (isProtectedRoute && !user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Se estiver logado e tentar ir para o login ou cadastro, manda para o dashboard
    if (user && isAuthRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      const response = NextResponse.redirect(url)
      if (hasDemoCookie) {
        clearDemoCookies(response)
      }
      return response
    }

    return supabaseResponse
  } catch (error) {
    console.error('Proxy error:', error)
    return supabaseResponse
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
