import { cookies } from 'next/headers'

export async function isDemo(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get('sf_demo')?.value === '1'
}
