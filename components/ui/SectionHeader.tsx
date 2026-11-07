import Link from 'next/link'
import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SectionHeaderProps {
  title: string
  description?: string
  actionLabel?: string
  href?: string
  onAction?: () => void
  action?: ReactNode
  className?: string
}

/** Compact section title with an optional trailing action. */
export function SectionHeader({ title, description, actionLabel, href, onAction, action, className }: SectionHeaderProps) {
  const actionContent = action ?? (actionLabel ? <><span>{actionLabel}</span><ChevronRight aria-hidden className="h-4 w-4" /></> : null)
  const actionClass = 'inline-flex min-h-10 items-center gap-1 rounded-full px-3 text-sm font-medium text-app-accent transition-colors hover:bg-app-accent/10'

  return (
    <div className={cn('mb-3 flex min-h-10 items-center justify-between gap-3', className)}>
      <div className="min-w-0">
        <h2 className="text-[13px] font-medium uppercase tracking-[0.08em] text-app-subtle">{title}</h2>
        {description && <p className="mt-1 text-sm normal-case tracking-normal text-app-muted">{description}</p>}
      </div>
      {actionContent && href ? <Link href={href} className={actionClass}>{actionContent}</Link> : actionContent && onAction ? <button type="button" onClick={onAction} className={actionClass}>{actionContent}</button> : actionContent}
    </div>
  )
}
