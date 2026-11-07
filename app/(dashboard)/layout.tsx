import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { DemoBanner } from '@/components/demo/DemoBanner'
import { SmartMobileInstallBanner } from '@/components/pwa/SmartMobileInstallBanner'
import { CommandPaletteProvider } from '@/components/command/CommandPaletteProvider'
import { MobileCommandTrigger } from '@/components/command/MobileCommandTrigger'
import { PageTransition } from '@/components/layout/PageTransition'
import { getSession } from '@/lib/auth'
import { isDemo } from '@/lib/demo/session'
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

  const [membros, configuracoes, demo] = await Promise.all([getMembros(), getConfiguracoes(), isDemo()])
  const occupiedSlots = Math.min(membros.length + 1, 6)

  return (
    <div className={`${geist.variable} font-app flex min-h-dvh flex-col bg-app-bg text-app-text antialiased selection:bg-app-accent/25 selection:text-app-accent`}>
      {/* Demo mode banner */}
      <DemoBanner />

      <CommandPaletteProvider>
        <div className="flex flex-1 min-h-0 relative">
          {/* Desktop sidebar */}
          <Sidebar occupiedSlots={occupiedSlots} monthlyValue={configuracoes?.valor_plano ?? null} demo={demo} />

          {/* Main content */}
          <main className="flex-1 min-w-0 pb-[calc(7.5rem+env(safe-area-inset-bottom))] lg:pb-12">
            <div className="relative mx-auto w-full max-w-5xl px-5 sm:px-8">
              <div className="absolute right-5 top-[max(env(safe-area-inset-top),12px)] z-40 lg:hidden sm:right-8">
                <MobileCommandTrigger />
              </div>
              <div className="pt-[calc(max(env(safe-area-inset-top),16px)+3.5rem)] lg:pt-6">
                <SmartMobileInstallBanner />
                <PageTransition>{children}</PageTransition>
              </div>
            </div>
          </main>
        </div>

        {/* Mobile navigation */}
        <BottomNav />
      </CommandPaletteProvider>
    </div>
  )
}
