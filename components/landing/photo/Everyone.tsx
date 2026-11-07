'use client'

import { useMemo, useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { Section } from '../primitives/Section'
import type { Quad } from '../primitives/homography'
import { DashboardScreen } from '../screens/DashboardScreen'
import { PlayerScreen } from '../screens/PlayerScreen'
import { DeviceShot, type DeviceShotScreen } from './DeviceShot'
import { SHOTS, type Shot } from './shots'

/**
 * Área de um quadrilátero qualquer pelos 4 vértices (Shoelace formula).
 */
function quadArea(q: Quad): number {
  const [p0, p1, p2, p3] = q
  return (
    0.5 *
    Math.abs(
      p0[0] * p1[1] +
        p1[0] * p2[1] +
        p2[0] * p3[1] +
        p3[0] * p0[1] -
        (p0[1] * p1[0] + p1[1] * p2[0] + p2[1] * p3[0] + p3[1] * p0[0]),
    )
  )
}

export function Everyone() {
  // TODO everyone: o orquestrador adicionará SHOTS.everyone com 5 telas ao shots.ts.
  // Enquanto ela não existir, usamos SHOTS.pocket como substituto.
  const shot = ('everyone' in SHOTS ? (SHOTS as Record<string, Shot>)['everyone'] : SHOTS.pocket) as Shot

  const screens = useMemo<DeviceShotScreen[]>(() => {
    const quads = shot.screens
    if (!quads || quads.length === 0) return []

    // Identifica o índice da tela de maior área (painel principal do gestor)
    let maxIdx = 0
    let maxArea = -1
    quads.forEach((corners, idx) => {
      const area = quadArea(corners)
      if (area > maxArea) {
        maxArea = area
        maxIdx = idx
      }
    })

    let playerVariant = 0
    return quads.map((corners, idx) => {
      if (idx === maxIdx) {
        return {
          corners,
          content: <DashboardScreen moment="completo" />,
        }
      }
      const variant = (playerVariant % 4) as 0 | 1 | 2 | 3
      playerVariant++
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

  // Parallax sutil de -4% a 4%, desligado quando prefers-reduced-motion está ativo
  const y = useTransform(scrollYProgress, [0, 1], prefersReduced ? ['0%', '0%'] : ['-4%', '4%'])

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
          className="mx-auto w-full max-w-[1200px] overflow-hidden rounded-[28px] border border-white/10 shadow-2xl"
        >
          <DeviceShot
            src={shot.src}
            alt={shot.alt}
            width={shot.width}
            height={shot.height}
            screens={screens}
            sizes="(max-width: 1280px) 100vw, 1200px"
            className="h-full w-full"
          />
        </motion.div>
      </div>
    </Section>
  )
}
