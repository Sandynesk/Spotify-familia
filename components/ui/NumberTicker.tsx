'use client'

import { useEffect, useState } from 'react'
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { springs } from '@/components/ui/motion'

export interface NumberTickerProps {
  value: number
  format?: (value: number) => string
  decimals?: number
  className?: string
  duration?: number
  prefix?: string
  suffix?: string
}

/** Animates a number toward its latest value over a short, reduced-motion aware transition. */
export function NumberTicker({ value, format, decimals = 0, className, duration = 0.6, prefix = '', suffix = '' }: NumberTickerProps) {
  const reducedMotion = useReducedMotion()
  const motionValue = useMotionValue(reducedMotion ? value : 0)
  const formatValue = (latest: number) => {
    const rounded = Number(latest.toFixed(decimals))
    return format ? format(rounded) : new Intl.NumberFormat('pt-BR', { maximumFractionDigits: decimals, minimumFractionDigits: decimals }).format(rounded)
  }
  const [displayed, setDisplayed] = useState(() => formatValue(reducedMotion ? value : 0))

  useMotionValueEvent(motionValue, 'change', (latest) => setDisplayed(formatValue(latest)))

  useEffect(() => {
    if (reducedMotion) {
      motionValue.set(value)
      return
    }
    const control = animate(motionValue, value, { ...springs.soft, duration })
    return () => control.stop()
  }, [duration, motionValue, reducedMotion, value])

  return <motion.span className={cn('tabular', className)}>{prefix}{displayed}{suffix}</motion.span>
}
