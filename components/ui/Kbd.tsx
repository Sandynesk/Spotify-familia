import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
}

/** Small visual keycap for keyboard shortcuts. */
export function Kbd({ className, children, ...props }: KbdProps) {
  return <kbd className={cn('inline-flex min-h-6 min-w-6 items-center justify-center rounded-md border border-app-line-strong bg-app-raised px-1.5 font-mono text-[11px] text-app-muted shadow-[inset_0_-1px_0_rgb(255_255_255/0.08)]', className)} {...props}>{children}</kbd>
}
