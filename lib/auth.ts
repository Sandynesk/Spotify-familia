import { createClient } from '@/lib/supabase/client'

export async function getSession() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

export async function isAuthenticated() {
  const session = await getSession()
  return !!session
}