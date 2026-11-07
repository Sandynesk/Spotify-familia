import React from 'react'
import { cn } from '@/lib/utils'

export type CardVariant = 'default' | 'interactive' | 'hero'
export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  padding?: CardPadding
}

/** Shared rounded surface for dashboard content and interactive cards. */
export function Card({ variant = 'default', padding = 'md', className, children, ...props }: CardProps) {
  const variants: Record<CardVariant, string> = {
    default: 'border border-app-line bg-app-surface',
    interactive: 'cursor-pointer border border-app-line bg-app-surface transition-[background-color,border-color,transform] duration-200 hover:border-app-line-strong hover:bg-app-elevated active:scale-[0.99]',
    hero: 'app-aurora app-noise border border-white/[0.08]',
  }
  const paddings: Record<CardPadding, string> = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4 sm:p-5',
    lg: 'p-5 sm:p-7',
  }

  return (
    <div className={cn('relative rounded-app', variants[variant], paddings[padding], className)} {...props}>
      {children}
    </div>
  )
}
