'use client'

import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { usePathname } from 'next/navigation'

/** Fades each incoming route without delaying its streamed loading boundary. */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const reducedMotion = useReducedMotion()

  return (
    <motion.div
      key={pathname}
      initial={reducedMotion ? undefined : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.15, ease: 'easeOut' }}
      className="min-h-full"
    >
      {children}
    </motion.div>
  )
}
