import type { ReactNode } from 'react'
import { BrandSymbol } from '@/components/landing/BrandMark'
import { cn } from '@/lib/utils'

export interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
  className?: string
  icon?: ReactNode
}

/** Calm, branded empty result with a clear next step. */
export function EmptyState({ title, description, action, className, icon }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-app border border-dashed border-app-line-strong bg-app-surface/70 px-6 py-10 text-center sm:py-12', className)}>
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-app-line bg-app-elevated text-app-accent">
        {icon ?? <BrandSymbol size={28} />}
      </span>
      <h3 className="text-base font-semibold tracking-tight text-app-text">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-app-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
