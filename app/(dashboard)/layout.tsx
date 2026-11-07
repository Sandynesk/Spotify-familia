import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { FAB } from '@/components/layout/FAB'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Geist } from 'next/font/google'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' })

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  // If no session, redirect to login
  if (!session) {
    redirect('/login')
  }

  return (
    <div className={`${geist.variable} font-app min-h-dvh bg-app-bg text-app-text antialiased`}>
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen pb-24 lg:pb-8">
        {children}
      </main>

      {/* Mobile nav + FAB */}
      <BottomNav />
      <FAB />
    </div>
  )
}
