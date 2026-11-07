'use client'

import { useId } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { springs } from '@/components/ui/motion'

export interface SegmentedOption<Value extends string = string> {
  value: Value
  label: ReactNode
  icon?: ReactNode
  disabled?: boolean
}

export interface SegmentedControlProps<Value extends string = string> {
  options: readonly SegmentedOption<Value>[]
  value: Value
  onChange: (value: Value) => void
  'aria-label': string
  className?: string
}

/** iOS-style single choice control with a shared sliding thumb. */
export function SegmentedControl<Value extends string>({ options, value, onChange, className, 'aria-label': ariaLabel }: SegmentedControlProps<Value>) {
  const layoutId = useId()
  const reducedMotion = useReducedMotion()

  return (
    <div role="radiogroup" aria-label={ariaLabel} className={cn('relative grid min-h-11 rounded-full bg-app-elevated p-1', className)} style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            className={cn('relative z-10 inline-flex min-h-9 min-w-0 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40', active ? 'text-app-text' : 'text-app-muted hover:text-app-text')}
          >
            {active && (
              <motion.span
                layoutId={`segment-${layoutId}`}
                className="absolute inset-0 -z-10 rounded-full border border-app-line-strong bg-app-raised shadow-[0_1px_4px_rgb(0_0_0/0.25)]"
                transition={reducedMotion ? { duration: 0 } : springs.snappy}
              />
            )}
            {option.icon && <span className="flex [&>svg]:h-4 [&>svg]:w-4">{option.icon}</span>}
            <span className="truncate">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
