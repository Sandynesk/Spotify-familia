'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { Beat } from '../story/beats'
import { momentOf, viewOf } from '../story/beats'
import { SCREEN_H, SCREEN_RADIUS, SCREEN_W } from './size'
import { ScreenStatusBar } from './ScreenStatusBar'
import { ScreenBottomNav } from './ScreenBottomNav'
import { DashboardView } from './DashboardView'
import { SlotsView } from './SlotsView'
import { ValuesView } from './ValuesView'
import { BillsView } from './BillsView'

export interface PhoneScreenProps {
  beat: Beat
}

/**
 * A tela do celular 3D e da imagem de reserva, controlada pelo beat.
 * - Dimensões exatas: SCREEN_W × SCREEN_H (390 × 844 px)
 * - Raio de canto: SCREEN_RADIUS (54 px)
 * - Fundo: #121212
 * - Fonte do app: Outfit
 * - Transição entre views: crossfade + deslocamento de 12px (300 ms)
 */
export function PhoneScreen({ beat }: PhoneScreenProps) {
  const shouldReduce = useReducedMotion()
  const view = viewOf(beat)
  const moment = momentOf(beat)

  const activeTab =
    view === 'vagas' || view === 'valores' ? 'membros' : 'dashboard'

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
      {/* 1. Barra de status (54px) com centro livre para a ilha frontal */}
      <ScreenStatusBar />

      {/* 2. Conteúdo central com crossfade + deslocamento de 12px (300 ms) */}
      <div className="flex-1 min-h-0 relative px-4 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={view}
            initial={shouldReduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduce ? undefined : { opacity: 0, y: -12 }}
            transition={{
              duration: shouldReduce ? 0 : 0.3,
              ease: 'easeOut',
            }}
            className="w-full h-full flex flex-col justify-between"
          >
            {view === 'painel' && <DashboardView moment={moment} />}
            {view === 'vagas' && <SlotsView />}
            {view === 'valores' && <ValuesView />}
            {view === 'lista' && <BillsView />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3. Barra inferior com abas e indicador de home */}
      <ScreenBottomNav activeTab={activeTab} />
    </div>
  )
}
