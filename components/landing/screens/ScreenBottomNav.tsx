import { LayoutDashboard, Users, Calendar, History } from 'lucide-react'

interface ScreenBottomNavProps {
  activeTab?: 'dashboard' | 'membros' | 'visao-geral' | 'historico'
}

/**
 * Barra inferior idêntica ao BottomNav do app, com o indicador de home
 * (pílula branca de 134 × 5px a 8px da base).
 */
export function ScreenBottomNav({ activeTab = 'dashboard' }: ScreenBottomNavProps) {
  const items = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'membros', label: 'Membros', icon: Users },
    { id: 'visao-geral', label: 'Visão Geral', icon: Calendar },
    { id: 'historico', label: 'Histórico', icon: History },
  ] as const

  return (
    <div className="w-full flex-shrink-0 bg-[#0a0a0a]/95 border-t border-white/5 pt-1.5 pb-2 flex flex-col items-center select-none z-30">
      <div className="w-full flex items-center justify-around px-2 mb-2">
        {items.map(({ id, label, icon: Icon }) => {
          const isActive = id === activeTab
          return (
            <div
              key={id}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl min-w-[56px] ${
                isActive ? 'text-[#1DB954]' : 'text-[#535353]'
              }`}
            >
              <Icon
                className="w-4 h-4"
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span className="text-[9px] font-medium leading-none">{label}</span>
            </div>
          )
        })}
      </div>

      {/* Indicador de home (pílula branca de 134 × 5px a 8px da base) */}
      <div className="w-[134px] h-[5px] rounded-full bg-white mb-2" />
    </div>
  )
}
