import { cookies } from 'next/headers'

export async function isDemo(): Promise<boolean> {
  const cookieStore = await cookies()
  const hasSupabaseAuth = cookieStore.getAll().some(
    (c) => (c.name.startsWith('sb-') && c.name.includes('-auth-token')) || c.name.includes('-auth-token')
  )
  if (hasSupabaseAuth) return false
  return cookieStore.get('sf_demo')?.value === '1'
}
