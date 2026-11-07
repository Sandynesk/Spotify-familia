import React from 'react'
import { LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'glass'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: React.ReactNode
  children?: React.ReactNode
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-app-accent text-app-accent-ink hover:bg-app-accent-hover border border-transparent',
  secondary: 'bg-app-elevated text-app-text hover:bg-app-raised border border-app-line',
  ghost: 'bg-transparent text-app-muted hover:bg-app-elevated hover:text-app-text border border-transparent',
  danger: 'bg-app-danger/12 text-app-danger hover:bg-app-danger hover:text-app-bg border border-app-danger/20',
  glass: 'app-glass text-app-text hover:bg-white/10 border border-app-line-strong',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-4 text-sm',
  md: 'min-h-11 px-5 text-sm',
  lg: 'min-h-[52px] px-6 text-base',
}

/** Pill action button with consistent loading, focus, and press states. */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold tracking-[-0.01em] transition-[background-color,color,transform,opacity] duration-200 ease-app active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <LoaderCircle aria-hidden className="h-[18px] w-[18px] animate-spin" />
      ) : icon ? (
        <span aria-hidden className="flex shrink-0 items-center [&>svg]:h-5 [&>svg]:w-5 [&>svg]:stroke-[1.75]">
          {icon}
        </span>
      ) : null}
      {children != null && <span>{children}</span>}
    </button>
  )
}
