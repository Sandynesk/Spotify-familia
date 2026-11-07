import React from 'react'
import { cn } from '@/lib/utils'

export interface ProgressRingProps {
  value: number
  size?: number
  strokeWidth?: number
  label?: React.ReactNode
  caption?: React.ReactNode
  className?: string
  color?: string
}

/** Compact SVG progress ring with an optional centered value and caption. */
export function ProgressRing({ value, size = 88, strokeWidth = 7, label, caption, className, color = 'var(--color-app-accent)' }: ProgressRingProps) {
  const safeValue = Math.max(0, Math.min(value, 100))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - safeValue / 100)

  return (
    <div
      className={cn('relative inline-grid shrink-0 place-items-center', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Progresso: ${Math.round(safeValue)}%`}
    >
      <svg aria-hidden="true" width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-app-line)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-[stroke-dashoffset] duration-700 ease-app motion-reduce:transition-none"
        />
      </svg>
      {(label != null || caption != null) && (
        <span className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {label != null && <span className="font-semibold leading-none tracking-tight text-app-text tabular">{label}</span>}
          {caption != null && <span className="mt-1 text-[10px] leading-none text-app-muted">{caption}</span>}
        </span>
      )}
    </div>
  )
}
