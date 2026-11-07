import type { CSSProperties } from 'react'
import { getInitials } from '@/lib/utils/avatar'
import { cn } from '@/lib/utils'

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'
export type AvatarStatus = 'paid' | 'pending' | 'overdue'

export interface AvatarProps {
  nome: string
  cor?: string | null
  size?: AvatarSize
  className?: string
  status?: AvatarStatus
}

const sizes: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-16 w-16 text-xl',
}

/** Initials avatar with optional payment status ring. */
export function Avatar({ nome, cor, size = 'md', className, status }: AvatarProps) {
  const background = safeColor(cor) ? cor! : '#48E5B2'

  return (
    <span
      role="img"
      aria-label={`Avatar de ${nome}`}
      className={cn('relative inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold tracking-[-0.03em]', sizes[size], status ? 'ring-2 ring-offset-2 ring-offset-app-bg' : '', className)}
      style={{ backgroundColor: background, color: isLightColor(background) ? '#04261b' : '#ffffff', ...(status ? { '--tw-ring-color': statusColor(status) } as CSSProperties : {}) }}
    >
      {getInitials(nome || '?')}
    </span>
  )
}

export interface AvatarStackItem {
  nome: string
  cor?: string | null
  status?: AvatarStatus
}

export interface AvatarStackProps {
  avatars: AvatarStackItem[]
  max?: number
  size?: Exclude<AvatarSize, 'xl'>
  className?: string
}

/** Overlapping avatars for a small family group. */
export function AvatarStack({ avatars, max = 4, size = 'md', className }: AvatarStackProps) {
  const visible = avatars.slice(0, max)
  const extra = Math.max(avatars.length - visible.length, 0)

  return (
    <div className={cn('flex items-center pl-1', className)} role="group" aria-label={`${avatars.length} membros`}>
      {visible.map((avatar, index) => (
        <Avatar
          key={`${avatar.nome}-${index}`}
          {...avatar}
          size={size}
          className={cn('-ml-1 border-2 border-app-bg', size === 'sm' ? 'h-8 w-8' : 'h-10 w-10')}
        />
      ))}
      {extra > 0 && (
        <span className={cn('-ml-1 inline-flex items-center justify-center rounded-full border-2 border-app-bg bg-app-raised font-medium text-app-muted', size === 'sm' ? 'h-8 w-8 text-[10px]' : 'h-10 w-10 text-xs')}>
          +{extra}
        </span>
      )}
    </div>
  )
}

function safeColor(color?: string | null): color is string {
  return Boolean(color && /^#[\da-f]{3}(?:[\da-f]{3})?$/i.test(color))
}

function isLightColor(hex: string): boolean {
  const normalized = hex.length === 4 ? hex.slice(1).split('').map((value) => value + value).join('') : hex.slice(1)
  const [r, g, b] = [0, 2, 4].map((offset) => Number.parseInt(normalized.slice(offset, offset + 2), 16))
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.58
}

function statusColor(status: AvatarStatus): string {
  return { paid: '#48E5B2', pending: '#FFB340', overdue: '#FF5A4E' }[status]
}
