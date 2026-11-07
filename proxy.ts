import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { isDemoProtectedRoute } from '@/lib/demo/routes'
import { clearDemoCookies } from '@/lib/demo/cookies'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Demo requests are handled without constructing or contacting Supabase.
  if (request.cookies.get('sf_demo')?.value === '1') {
    if (pathname === '/api/keep-alive') return NextResponse.json({ ok: true, demo: true })
    if (pathname === '/api/auth/callback') return NextResponse.redirect(new URL('/dashboard', request.url))
    if (pathname === '/cadastro') {
      request.cookies.delete('sf_demo')
      request.cookies.delete('sf_demo_sid')
      const response = NextResponse.next({ request })
      clearDemoCookies(response)
      return response
    }
    if (pathname === '/login') return NextResponse.redirect(new URL('/dashboard', request.url))
    if (isDemoProtectedRoute(pathname)) return NextResponse.next()
    return NextResponse.next()
  }

  // Entering or resetting the demo does not require an auth lookup either.
  if (pathname === '/demo' || pathname === '/demo/reset') return NextResponse.next()

  let supabaseResponse = NextResponse.next({ request })

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

    // Se estiver logado e tentar ir para o login, manda para o dashboard
    if (user && pathname === '/login') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
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
