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
      initial={reducedMotion ? undefined : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : { duration: 0.22, ease: [0.22, 1, 0.36, 1] }
      }
      className="min-h-full w-full max-w-full min-w-0"
    >
      {children}
    </motion.div>
  )
}
