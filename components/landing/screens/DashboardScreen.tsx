'use client'

import type { PanelMoment } from '../data'
import { SCREEN_H, SCREEN_RADIUS, SCREEN_W } from './size'
import { ScreenStatusBar } from './ScreenStatusBar'
import { ScreenBottomNav } from './ScreenBottomNav'
import { DashboardView } from './DashboardView'

export interface DashboardScreenProps {
  moment: PanelMoment
}

/**
 * DashboardScreen: o painel do mês num momento fixo (usado nas fotos).
 * Renderiza o painel real em estado estático para o momento fornecido.
 */
export function DashboardScreen({ moment }: DashboardScreenProps) {
  return (
    <div
      style={{
        width: SCREEN_W,
        height: SCREEN_H,
        borderRadius: SCREEN_RADIUS,
        fontFamily: '"Outfit", sans-serif',
        backgroundColor: '#121212',
      }}
      className="relative flex flex-col justify-between overflow-hidden text-white pointer-events-none select-none"
    >
      <ScreenStatusBar />
      <div className="flex-1 min-h-0 relative px-4 flex flex-col overflow-hidden">
        <DashboardView moment={moment} isStatic />
      </div>
      <ScreenBottomNav activeTab="dashboard" />
    </div>
  )
}
