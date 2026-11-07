'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

export interface ConfettiProps {
  /** Increment this value to launch one burst. */
  trigger?: number
  className?: string
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  spin: number
  length: number
  width: number
  color: string
}

/** Lightweight capsule confetti canvas; each trigger plays a single short burst. */
export function Confetti({ trigger = 0, className }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || trigger <= 0) return
    return drawBurst(canvas)
  }, [trigger])

  return <canvas ref={canvasRef} aria-hidden="true" className={cn('pointer-events-none absolute inset-0 z-20 h-full w-full', className)} />
}

/** Imperative counterpart for callers that already own a canvas reference. */
export function fireConfetti(canvas: HTMLCanvasElement): void {
  drawBurst(canvas)
}

function drawBurst(canvas: HTMLCanvasElement): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => undefined
  const context = canvas.getContext('2d')
  if (!context) return () => undefined

  const parent = canvas.parentElement
  const width = parent?.clientWidth || window.innerWidth
  const height = parent?.clientHeight || 180
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = width * pixelRatio
  canvas.height = height * pixelRatio
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)

  const colors = ['#48E5B2', '#6CF0C4', '#64A8FF']
  const particles: Particle[] = Array.from({ length: 28 }, () => ({
    x: width * (0.35 + Math.random() * 0.3),
    y: height * 0.42,
    vx: (Math.random() - 0.5) * 7,
    vy: -2 - Math.random() * 6,
    rotation: Math.random() * Math.PI,
    spin: (Math.random() - 0.5) * 0.22,
    length: 7 + Math.random() * 5,
    width: 2.5 + Math.random() * 1.5,
    color: colors[Math.floor(Math.random() * colors.length)],
  }))
  let frame = 0
  let animationFrame = 0

  const render = () => {
    context.clearRect(0, 0, width, height)
    particles.forEach((particle) => {
      particle.x += particle.vx
      particle.y += particle.vy
      particle.vy += 0.16
      particle.vx *= 0.992
      particle.rotation += particle.spin
      context.save()
      context.translate(particle.x, particle.y)
      context.rotate(particle.rotation)
      context.fillStyle = particle.color
      context.beginPath()
      context.roundRect(-particle.length / 2, -particle.width / 2, particle.length, particle.width, particle.width / 2)
      context.fill()
      context.restore()
    })
    frame += 1
    if (frame < 48) animationFrame = window.requestAnimationFrame(render)
    else context.clearRect(0, 0, width, height)
  }

  animationFrame = window.requestAnimationFrame(render)
  return () => window.cancelAnimationFrame(animationFrame)
}
