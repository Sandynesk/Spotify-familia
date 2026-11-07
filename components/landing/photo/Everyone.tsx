'use client'

import { useMemo, useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { Section } from '../primitives/Section'
import { DashboardScreen } from '../screens/DashboardScreen'
import { PlayerScreen } from '../screens/PlayerScreen'
import { DeviceShot, type DeviceShotScreen } from './DeviceShot'
import { SHOTS } from './shots'

export function Everyone() {
  const shot = SHOTS.everyone

  const screens = useMemo<DeviceShotScreen[]>(() => {
    return shot.screens.map((corners, idx) => {
      if (idx === 0) {
        // Tela central (índice 0): painel do gestor
        return {
          corners,
          content: <DashboardScreen moment="completo" />,
        }
      }
      // Demais telas (1 a 4): players de música dos membros da família
      const variant = ((idx - 1) % 4) as 0 | 1 | 2 | 3
      return {
        corners,
        content: <PlayerScreen variant={variant} />,
      }
    })
  }, [shot])

  const sectionRef = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  // Parallax bem sutil de ±3%, desligado quando prefers-reduced-motion está ativo
  const y = useTransform(scrollYProgress, [0, 1], prefersReduced ? ['0%', '0%'] : ['-3%', '3%'])

  return (
    <Section width="wide" className="overflow-hidden">
      <div ref={sectionRef} className="relative">
        <div className="mx-auto max-w-3xl text-center mb-12 md:mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.035em] leading-[1.02] text-balance text-white">
            Cada um ouve no seu.
            <br />
            Você organiza num só.
          </h2>
          <p className="mt-5 text-lg md:text-xl text-[#A1A1A6] font-normal leading-relaxed text-balance">
            A família inteira no mesmo plano. O controle, só com você.
          </p>
        </div>

        <motion.div
          style={{ y }}
          className="mx-auto w-full max-w-[1200px] overflow-hidden rounded-[20px] md:rounded-[28px] border border-white/10 shadow-2xl"
        >
          <DeviceShot
            src={shot.src}
            alt={shot.alt}
            width={shot.width}
            height={shot.height}
            screens={screens}
            fit="contain-aspect"
            sizes="(max-width: 1280px) 100vw, 1200px"
            className="w-full"
          />
        </motion.div>
      </div>
    </Section>
  )
}
