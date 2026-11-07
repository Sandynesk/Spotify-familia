'use client'

import { useEffect, useRef, useState } from 'react'
import { animate, useReducedMotion } from 'framer-motion'
import { formatBRL } from '../data'

interface AnimatedCurrencyProps {
  value: number
  className?: string
  isStatic?: boolean
}

/**
 * Anima contagem de moeda (BRL) usando animate() do framer-motion e tabular-nums.
 * Com prefers-reduced-motion ou isStatic, exibe o valor imediatamente sem animação.
 */
export function AnimatedCurrency({
  value,
  className = '',
  isStatic = false,
}: AnimatedCurrencyProps) {
  const shouldReduce = useReducedMotion()
  const prevValue = useRef(value)
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    if (isStatic || shouldReduce) {
      setDisplayValue(value)
      prevValue.current = value
      return
    }

    const start = prevValue.current
    prevValue.current = value

    if (start === value) {
      setDisplayValue(value)
      return
    }

    const controls = animate(start, value, {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        setDisplayValue(Math.round(latest))
      },
    })

    return () => controls.stop()
  }, [value, isStatic, shouldReduce])

  return (
    <span className={`tabular-nums ${className}`}>
      {formatBRL(isStatic || shouldReduce ? value : displayValue)}
    </span>
  )
}

interface AnimatedPercentProps {
  value: number
  className?: string
  isStatic?: boolean
}

/**
 * Anima porcentagem (ex: 65% → 83% → 100%) usando animate() do framer-motion e tabular-nums.
 */
export function AnimatedPercent({
  value,
  className = '',
  isStatic = false,
}: AnimatedPercentProps) {
  const shouldReduce = useReducedMotion()
  const prevValue = useRef(value)
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    if (isStatic || shouldReduce) {
      setDisplayValue(value)
      prevValue.current = value
      return
    }

    const start = prevValue.current
    prevValue.current = value

    if (start === value) {
      setDisplayValue(value)
      return
    }

    const controls = animate(start, value, {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        setDisplayValue(Math.round(latest))
      },
    })

    return () => controls.stop()
  }, [value, isStatic, shouldReduce])

  return (
    <span className={`tabular-nums ${className}`}>
      {isStatic || shouldReduce ? value : displayValue}%
    </span>
  )
}
