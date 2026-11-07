import { createBrowserClient } from '@supabase/ssr'

function isDemoBrowserRequest() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false
  if (window.location.pathname === '/login' || window.location.pathname === '/cadastro' || window.location.pathname === '/recuperar-senha') return false

  // Se o cookie do navegador possui o token de sessão do Supabase, NUNCA usar cliente de demonstração!
  const hasSupabaseCookie = document.cookie.split(';').some(cookie => {
    const trimmed = cookie.trim()
    return (trimmed.startsWith('sb-') && trimmed.includes('-auth-token')) || trimmed.includes('-auth-token=')
  })
  if (hasSupabaseCookie) return false

  return document.cookie.split(';').some(cookie => cookie.trim() === 'sf_demo_client=1')
}

function createDemoBrowserClient() {
  return {
    auth: {
      async getUser() {
        return { data: { user: { id: '00000000-0000-4000-8000-000000000001', email: 'voce@demo.spotifamilia.app' } }, error: null }
      },
      async getSession() {
        return { data: { session: null }, error: null }
      },
      async signOut() {
        const response = await fetch('/sair', { method: 'POST', credentials: 'same-origin' })
        return { error: response.ok ? null : new Error('Não foi possível encerrar a demonstração') }
      },
    },
  } as unknown as ReturnType<typeof createBrowserClient>
}

export function createClient() {
  if (isDemoBrowserRequest()) return createDemoBrowserClient()

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
