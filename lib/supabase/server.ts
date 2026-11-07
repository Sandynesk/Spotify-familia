import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createDemoClient } from '@/lib/demo/client'
import { randomUUID } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function createRealServerClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — ignorar
          }
        },
      },
    }
  )
}

export async function createClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies()

  // Se o usuário tem cookie de autenticação do Supabase, NUNCA usar cliente de demonstração!
  const hasSupabaseAuth = cookieStore.getAll().some(
    (c) => (c.name.startsWith('sb-') && c.name.includes('-auth-token')) || c.name.includes('-auth-token')
  )

  // A demo request must never initialize the real Supabase client. A missing
  // SID still stays isolated in a temporary demo store instead of falling back.
  if (!hasSupabaseAuth && cookieStore.get('sf_demo')?.value === '1') {
    const sid = cookieStore.get('sf_demo_sid')?.value || `missing-${randomUUID()}`
    return createDemoClient(sid)
  }

  return createRealServerClient()
}
