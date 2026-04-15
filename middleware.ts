import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Define protected routes
  const isProtectedRoute = pathname.startsWith('/dashboard') || 
                          pathname.startsWith('/membros') ||
                          pathname.startsWith('/historico')

  // Define public routes that don't require auth
  const isPublicRoute = pathname === '/' || 
                       pathname.startsWith('/login') ||
                       pathname.startsWith('/cadastro') ||
                       pathname.startsWith('/api/')

  // If it's a protected route, check for session
  if (isProtectedRoute && !isPublicRoute) {
    // Try to get the session from cookies
    const supabaseUrl = request.cookies.get('sb-zlobxenwxnaalzfloxkx-auth-token')?.value || ''
    
    // For simplicity, we'll check if there's any auth cookie
    // In a real app, you might want to validate this with Supabase
    const hasAuthCookie = request.cookies.has('sb-zlobxenwxnaalzfloxkx-auth-token')
    
    if (!hasAuthCookie) {
      // Redirect to login if no auth cookie
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}