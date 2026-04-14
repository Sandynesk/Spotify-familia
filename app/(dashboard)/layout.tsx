import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { FAB } from '@/components/layout/FAB'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#121212]">
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
