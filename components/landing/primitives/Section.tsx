import { cn } from '@/lib/utils'

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** largura do conteúdo: wide = 1200px, narrow = 880px */
  width?: 'wide' | 'narrow'
}

/** Container padrão das seções da landing: gutter lateral e ritmo vertical consistentes. */
export function Section({ width = 'wide', className, children, ...rest }: SectionProps) {
  return (
    <section className={cn('relative px-6 py-28 md:py-40', className)} {...rest}>
      <div className={cn('mx-auto w-full', width === 'wide' ? 'max-w-[1200px]' : 'max-w-[880px]')}>
        {children}
      </div>
    </section>
  )
}
