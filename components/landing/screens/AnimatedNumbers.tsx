'use client'

import { useEffect, useRef } from 'react'
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useReducedMotion,
} from 'framer-motion'
import { formatBRL } from '../data'

interface AnimatedCurrencyProps {
  value: number
  className?: string
  isStatic?: boolean
}

/**
 * Anima contagem de moeda (BRL) usando useMotionValue + animate() do framer-motion e tabular-nums.
 * Com prefers-reduced-motion ou isStatic, exibe o valor formatado diretamente sem hooks de animação.
 */
export function AnimatedCurrency({
  value,
  className = '',
  isStatic = false,
}: AnimatedCurrencyProps) {
  const shouldReduce = useReducedMotion()

  if (isStatic || shouldReduce) {
    return (
      <span className={`tabular-nums ${className}`}>
        {formatBRL(value)}
      </span>
    )
  }

  return <AnimatedCurrencyDynamic value={value} className={className} />
}

function AnimatedCurrencyDynamic({
  value,
  className = '',
}: {
  value: number
  className?: string
}) {
  const motionVal = useMotionValue(value)
  const prevValue = useRef(value)

  useEffect(() => {
    const from = prevValue.current
    prevValue.current = value

    if (from !== value) {
      const controls = animate(motionVal, value, {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      })
      return () => controls.stop()
    }
  }, [value, motionVal])

  const display = useTransform(motionVal, (latest) =>
    formatBRL(Math.round(latest)),
  )

  return (
    <motion.span className={`tabular-nums ${className}`}>
      {display}
    </motion.span>
  )
}

interface AnimatedPercentProps {
  value: number
  className?: string
  isStatic?: boolean
}

/**
 * Anima porcentagem (ex: 65% → 83% → 100%) usando useMotionValue + animate() do framer-motion.
 * Com prefers-reduced-motion ou isStatic, exibe o valor diretamente sem hooks de animação.
 */
export function AnimatedPercent({
  value,
  className = '',
  isStatic = false,
}: AnimatedPercentProps) {
  const shouldReduce = useReducedMotion()

  if (isStatic || shouldReduce) {
    return (
      <span className={`tabular-nums ${className}`}>
        {value}%
      </span>
    )
  }

  return <AnimatedPercentDynamic value={value} className={className} />
}

function AnimatedPercentDynamic({
  value,
  className = '',
}: {
  value: number
  className?: string
}) {
  const motionVal = useMotionValue(value)
  const prevValue = useRef(value)

  useEffect(() => {
    const from = prevValue.current
    prevValue.current = value

    if (from !== value) {
      const controls = animate(motionVal, value, {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      })
      return () => controls.stop()
    }
  }, [value, motionVal])

  const display = useTransform(motionVal, (latest) => `${Math.round(latest)}%`)

  return (
    <motion.span className={`tabular-nums ${className}`}>
      {display}
    </motion.span>
  )
}
