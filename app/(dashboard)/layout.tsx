import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { getSession } from '@/lib/auth'
import { getMembros } from '@/lib/actions/membros'
import { getConfiguracoes } from '@/lib/actions/configuracoes'
import { redirect } from 'next/navigation'
import { Geist } from 'next/font/google'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' })

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  // If no session, redirect to login
  if (!session) {
    redirect('/login')
  }

  const [membros, configuracoes] = await Promise.all([getMembros(), getConfiguracoes()])
  const occupiedSlots = Math.min(membros.length + 1, 6)

  return (
    <div className={`${geist.variable} font-app min-h-dvh overflow-x-clip bg-app-bg text-app-text antialiased`}>
      {/* Desktop sidebar */}
      <Sidebar occupiedSlots={occupiedSlots} monthlyValue={configuracoes?.valor_plano ?? null} />

      {/* Main content */}
      <main className="min-h-dvh pb-32 lg:ml-[264px] lg:pb-12">
        <div className="mx-auto w-full max-w-5xl px-5 pt-[max(env(safe-area-inset-top),16px)] sm:px-8">
          {children}
        </div>
      </main>

      {/* Mobile navigation */}
      <BottomNav />
    </div>
  )
}
