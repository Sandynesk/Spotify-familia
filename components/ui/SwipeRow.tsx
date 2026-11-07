'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Check, MoreHorizontal } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { springs } from '@/components/ui/motion'

export interface SwipeRowProps {
  children: ReactNode
  actionLabel: string
  onAction: () => void
  actionIcon?: ReactNode
  className?: string
  actionClassName?: string
}

/** Reveals a trailing action on swipe and keeps the same action available to keyboard users. */
export function SwipeRow({ children, actionLabel, onAction, actionIcon = <Check />, className, actionClassName }: SwipeRowProps) {
  const [revealed, setRevealed] = useState(false)
  const reducedMotion = useReducedMotion()
  const actionWidth = 112

  const invoke = () => {
    onAction()
    setRevealed(false)
  }

  return (
    <div className={cn('relative overflow-hidden rounded-app', className)}>
      <button
        type="button"
        tabIndex={revealed ? 0 : -1}
        onClick={invoke}
        className={cn('absolute inset-y-0 right-0 flex w-28 items-center justify-center gap-2 bg-app-accent px-3 text-sm font-semibold text-app-accent-ink focus-visible:z-10', actionClassName)}
        aria-label={actionLabel}
      >
        <span className="flex [&>svg]:h-4 [&>svg]:w-4">{actionIcon}</span>
        <span className="truncate">{actionLabel}</span>
      </button>
      <motion.div
        drag="x"
        dragConstraints={{ left: -actionWidth, right: 0 }}
        dragElastic={0.06}
        dragMomentum={false}
        animate={{ x: revealed ? -actionWidth : 0 }}
        transition={reducedMotion ? { duration: 0 } : springs.snappy}
        onDragEnd={(_, info) => setRevealed(info.offset.x < -42)}
        className="relative z-[1] touch-pan-y"
      >
        {children}
        <button
          type="button"
          onClick={() => setRevealed((current) => !current)}
          className="sr-only focus:not-sr-only focus:absolute focus:right-2 focus:top-2 focus:z-10 focus:flex focus:min-h-11 focus:items-center focus:gap-2 focus:rounded-full focus:bg-app-raised focus:px-4 focus:text-sm focus:text-app-text"
          aria-label={`Mostrar ação: ${actionLabel}`}
          aria-expanded={revealed}
        >
          <MoreHorizontal aria-hidden className="h-4 w-4" />
          {actionLabel}
        </button>
      </motion.div>
    </div>
  )
}
