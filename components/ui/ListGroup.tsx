import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface ListGroupProps {
  children: ReactNode
  title?: string
  footer?: ReactNode
  className?: string
}

/** Settings-style group that keeps related rows inside one hairline surface. */
export function ListGroup({ children, title, footer, className }: ListGroupProps) {
  return (
    <section className={className}>
      {title && <h2 className="mb-2 px-1 text-[13px] font-medium uppercase tracking-[0.08em] text-app-subtle">{title}</h2>}
      <div className="overflow-hidden rounded-app border border-app-line bg-app-surface divide-y divide-app-line">{children}</div>
      {footer && <p className="mt-2 px-1 text-xs text-app-subtle">{footer}</p>}
    </section>
  )
}

export interface ListRowProps {
  title: ReactNode
  description?: ReactNode
  icon?: ReactNode
  value?: ReactNode
  href?: string
  onClick?: () => void
  trailing?: ReactNode
  chevron?: boolean
  className?: string
  disabled?: boolean
}

/** Single settings row with optional leading icon, value, and navigation cue. */
export function ListRow({ title, description, icon, value, href, onClick, trailing, chevron, className, disabled }: ListRowProps) {
  const content = (
    <>
      {icon && <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-app-xs bg-app-elevated text-app-muted [&>svg]:h-[18px] [&>svg]:w-[18px] [&>svg]:stroke-[1.75]">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium text-app-text">{title}</span>
        {description && <span className="mt-0.5 block truncate text-xs text-app-muted">{description}</span>}
      </span>
      {value != null && <span className="shrink-0 text-sm text-app-muted">{value}</span>}
      {trailing}
      {(chevron || href) && <ChevronRight aria-hidden className="h-4 w-4 shrink-0 text-app-subtle" strokeWidth={1.75} />}
    </>
  )
  const baseClass = cn('flex min-h-[64px] w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-app-elevated/70 focus-visible:relative disabled:cursor-not-allowed disabled:opacity-45', className)

  if (href) return <Link href={href} className={baseClass}>{content}</Link>
  if (onClick) return <button type="button" disabled={disabled} onClick={onClick} className={baseClass}>{content}</button>
  return <div className={baseClass}>{content}</div>
}
