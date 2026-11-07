import React from 'react'
import { cn } from '@/lib/utils'

interface BentoCardProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  headerPosition?: 'top' | 'bottom'
}

/**
 * Card padrão bento estilo Apple:
 * Fundo preto-acinzentado (#0b0b0c), borda sutil white/[0.06], raio de 28px,
 * padding de 28–36px e leve scale no hover sem alteração de layout.
 */
export function BentoCard({
  title,
  description,
  children,
  className,
  headerPosition = 'top',
}: BentoCardProps) {
  const header = (title || description) && (
    <div className={headerPosition === 'top' ? 'mb-4 md:mb-6' : 'mt-4 md:mt-6'}>
      {title && (
        <h3 className="text-white font-semibold text-xl md:text-2xl tracking-[-0.025em] leading-[1.15] text-balance">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-[#A1A1A6] text-sm md:text-base leading-relaxed mt-2 text-pretty">
          {description}
        </p>
      )}
    </div>
  )

  return (
    <div
      className={cn(
        'relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#0b0b0c] p-7 md:p-9 h-full w-full',
        'transition-transform duration-300 motion-safe:hover:scale-[1.01]',
        className,
      )}
    >
      {headerPosition === 'top' && header}
      <div className="relative flex-1 flex flex-col justify-center">{children}</div>
      {headerPosition === 'bottom' && header}
    </div>
  )
}
