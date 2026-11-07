'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { IconButton } from '@/components/ui/IconButton'
import { cn } from '@/lib/utils'

export interface PageHeaderProps {
  title: string
  subtitle?: string
  eyebrow?: string
  actions?: ReactNode
  showBack?: boolean
  onBack?: () => void
  compact?: boolean
  className?: string
}

/** Large page title that condenses into a glass header while the page scrolls. */
export function PageHeader({ title, subtitle, eyebrow, actions, showBack = false, onBack, compact = false, className }: PageHeaderProps) {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  const isCondensed = compact || scrolled

  return (
    <header className={cn('sticky top-[max(env(safe-area-inset-top),12px)] z-30 mb-5 sm:mb-7 lg:static lg:top-auto', className)}>
      <div className={cn(
        'flex items-center gap-3 rounded-app transition-[padding,background-color,border-color,box-shadow] duration-300 ease-app',
        isCondensed ? 'app-glass px-3 py-2.5 shadow-app-float' : 'px-0 py-3 sm:py-4 lg:py-6',
        'lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-0',
      )}>
        {showBack && (
          <IconButton
            aria-label="Voltar"
            icon={<ArrowLeft />}
            variant={isCondensed ? 'ghost' : 'default'}
            onClick={onBack ?? (() => router.back())}
          />
        )}
        <div className="min-w-0 flex-1">
          {eyebrow && <p className={cn('mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-app-accent', isCondensed && 'hidden lg:block')}>{eyebrow}</p>}
          <h1 className={cn('truncate font-semibold tracking-[-0.03em] text-app-text transition-[font-size,line-height] duration-300', isCondensed ? 'text-lg leading-6 lg:text-[34px] lg:leading-[1.1]' : 'text-[34px] leading-[1.1]')}>
            {title}
          </h1>
          {subtitle && <p className={cn('mt-2 max-w-2xl text-sm text-app-muted sm:text-[15px]', isCondensed && 'hidden lg:block')}>{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}
