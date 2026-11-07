'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { quadToMatrix3d, type Quad } from '../primitives/homography'
import { SCREEN_H, SCREEN_RADIUS, SCREEN_W } from '../screens/size'

export interface DeviceShotScreen {
  /** cantos da tela magenta medidos na imagem ORIGINAL (px), ordem TL, TR, BR, BL */
  corners: Quad
  /** conteúdo HTML de SCREEN_W × SCREEN_H */
  content: React.ReactNode
}

export interface DeviceShotProps {
  src: string
  alt: string
  /** dimensões da imagem original em px */
  width: number
  height: number
  screens: DeviceShotScreen[]
  priority?: boolean
  sizes?: string
  className?: string
}

/**
 * Infle os 4 cantos ~1,5px para fora do centro geométrico do quadrilátero,
 * cobrindo qualquer franja subpixel magenta da máscara.
 */
function inflateQuad(corners: Quad, delta = 1.5): Quad {
  const cx = (corners[0][0] + corners[1][0] + corners[2][0] + corners[3][0]) / 4
  const cy = (corners[0][1] + corners[1][1] + corners[2][1] + corners[3][1]) / 4

  return corners.map(([x, y]) => {
    const dx = x - cx
    const dy = y - cy
    const dist = Math.hypot(dx, dy)
    if (dist === 0) return [x, y] as const
    return [x + (dx / dist) * delta, y + (dy / dist) * delta] as const
  }) as unknown as Quad
}

export function DeviceShot({
  src,
  alt,
  width,
  height,
  screens,
  priority = false,
  sizes,
  className,
}: DeviceShotProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState<number | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el || screens.length === 0) return

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const w = entry.contentRect.width
      if (w > 0) {
        setScale(w / width)
      }
    })

    ro.observe(el)
    return () => ro.disconnect()
  }, [width, screens.length])

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes ?? '100vw'}
        className="h-full w-full object-cover"
      />

      {/* Camada das telas: escalada do tamanho original para o tamanho renderizado */}
      {scale !== null && screens.length > 0 && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 select-none"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            transform: `scale(${scale})`,
            transformOrigin: '0 0',
          }}
        >
          {screens.map((screen, idx) => {
            const inflated = inflateQuad(screen.corners, 1.5)
            const matrix = quadToMatrix3d(SCREEN_W, SCREEN_H, inflated)

            return (
              <div
                key={idx}
                className="absolute left-0 top-0 overflow-hidden"
                style={{
                  width: `${SCREEN_W}px`,
                  height: `${SCREEN_H}px`,
                  borderRadius: `${SCREEN_RADIUS}px`,
                  transformOrigin: '0 0',
                  transform: matrix,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                {/* 1. Conteúdo da tela */}
                {screen.content}

                {/* 2. Ilha frontal: pílula preta de 126 × 37px centralizada a 11px do topo */}
                <div
                  className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-full bg-black"
                  style={{
                    top: 11,
                    width: 126,
                    height: 37,
                  }}
                  aria-hidden="true"
                />

                {/* 3. Reflexo de vidro: gradiente linear branco 7% → 0% em diagonal, mix-blend-mode: screen */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0) 100%)',
                    mixBlendMode: 'screen',
                  }}
                  aria-hidden="true"
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
