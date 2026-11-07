import React from 'react'
import { cn } from '@/lib/utils'

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible name for the icon-only action. */
  'aria-label': string
  icon: React.ReactNode
  variant?: 'default' | 'ghost' | 'glass' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

/** Square 44px icon action; always requires an accessible label. */
export function IconButton({ icon, variant = 'default', size = 'md', className, ...props }: IconButtonProps) {
  const variants = {
    default: 'bg-app-elevated text-app-text hover:bg-app-raised border border-app-line',
    ghost: 'bg-transparent text-app-muted hover:bg-app-elevated hover:text-app-text',
    glass: 'app-glass text-app-text hover:bg-white/10',
    danger: 'bg-app-danger/10 text-app-danger hover:bg-app-danger/20',
  }
  const sizes = { sm: 'h-9 w-9', md: 'h-11 w-11', lg: 'h-[52px] w-[52px]' }

  return (
    <button
      type="button"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full transition-[background-color,color,transform] duration-200 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-45 [&>svg]:h-5 [&>svg]:w-5 [&>svg]:stroke-[1.75]',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  )
}
