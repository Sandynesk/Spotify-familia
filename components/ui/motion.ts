import type { Transition } from 'framer-motion'

/** Shared springs keep movement short, soft, and interruptible. */
export const springs: Record<'snappy' | 'soft' | 'bouncy', Transition> = {
  snappy: { type: 'spring', stiffness: 420, damping: 34, mass: 0.8 },
  soft: { type: 'spring', stiffness: 280, damping: 30, mass: 0.9 },
  bouncy: { type: 'spring', stiffness: 360, damping: 22, mass: 0.75 },
}
