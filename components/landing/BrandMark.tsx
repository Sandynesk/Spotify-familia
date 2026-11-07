// Marca do SpotiFamília (geometria em ./brand.ts). Dono: orquestrador.
import { cn } from '@/lib/utils'
import { BRAND_CAPSULES, BRAND_COLORS, BRAND_ROUND, BRAND_VIEW } from './brand'

/** Só o símbolo. */
export function BrandSymbol({
  size = 24,
  className,
  title,
}: {
  size?: number
  className?: string
  /** quando presente, o símbolo deixa de ser decorativo */
  title?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${BRAND_VIEW} ${BRAND_VIEW}`}
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      {BRAND_CAPSULES.map((d, i) => (
        <path
          key={i}
          d={d}
          fill={BRAND_COLORS.accent}
          stroke={BRAND_COLORS.accent}
          strokeWidth={BRAND_ROUND * 2}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
}

interface BrandMarkProps {
  /** tamanho do símbolo em px */
  size?: number
  /** mostrar o nome ao lado do símbolo */
  withName?: boolean
  className?: string
}

/** Símbolo + nome (o nome é texto real, na fonte da página). */
export function BrandMark({ size = 22, withName = true, className }: BrandMarkProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <BrandSymbol size={size} />
      {withName && <span className="font-semibold tracking-[-0.02em] text-white">SpotiFamília</span>}
    </span>
  )
}
