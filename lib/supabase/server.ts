import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createDemoClient } from '@/lib/demo/client'
import { randomUUID } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function createClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies()

  // A demo request must never initialize the real Supabase client. A missing
  // SID still stays isolated in a temporary demo store instead of falling back.
  if (cookieStore.get('sf_demo')?.value === '1') {
    const sid = cookieStore.get('sf_demo_sid')?.value || `missing-${randomUUID()}`
    return createDemoClient(sid)
  }

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
