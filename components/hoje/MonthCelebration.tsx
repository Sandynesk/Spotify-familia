'use client'

import { useEffect, useRef } from 'react'
import { fireConfetti } from '@/components/ui/Confetti'
import { haptic } from '@/components/ui/haptics'

export function MonthCelebration({ monthISO, complete }: { monthISO: string; complete: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const firedRef = useRef(false)

  useEffect(() => {
    if (!complete || firedRef.current) return

    const key = `spotifamilia:celebrated:${monthISO.slice(0, 7)}`
    try {
      if (window.localStorage.getItem(key)) return
      window.localStorage.setItem(key, '1')
    } catch {
      // Keep the month celebration available when browser storage is blocked.
    }

    firedRef.current = true
    if (canvasRef.current) fireConfetti(canvasRef.current)
    haptic('success')
  }, [complete, monthISO])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 h-full w-full"
    />
  )
}
