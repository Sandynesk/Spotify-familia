import { BRAND_CAPSULES, BRAND_ROUND, BRAND_VIEW } from '@/components/landing/brand'
import { cn } from '@/lib/utils'

export interface SlotsRingProps {
  occupied?: number
  paid?: number
  total?: number
  size?: number
  className?: string
  label?: string
}

/** Six-part family plan ring using the exact capsule geometry from the brand. */
export function SlotsRing({ occupied = 0, paid = 0, total = 6, size = 68, className, label }: SlotsRingProps) {
  const safeTotal = Math.max(1, Math.min(total, BRAND_CAPSULES.length))
  const safeOccupied = Math.max(0, Math.min(occupied, safeTotal))
  const safePaid = Math.max(0, Math.min(paid, safeOccupied))
  const description = label ?? `${safePaid} de ${safeOccupied} vagas pagas, ${safeOccupied} de ${safeTotal} ocupadas`

  return (
    <span className={cn('relative inline-grid shrink-0 place-items-center text-app-accent select-none', className)} style={{ width: size, height: size }} role="img" aria-label={description}>
      <svg aria-hidden="true" viewBox={`0 0 ${BRAND_VIEW} ${BRAND_VIEW}`} width={size} height={size}>
        {BRAND_CAPSULES.map((path, index) => {
          const fill = index < safePaid ? 'var(--color-app-accent)' : index < safeOccupied ? 'var(--color-app-warn)' : 'rgb(255 255 255 / 0.14)'
          return <path key={index} d={path} fill={fill} stroke={fill} strokeWidth={BRAND_ROUND * 2} strokeLinejoin="round" className="transition-[fill,stroke] duration-500 motion-reduce:transition-none" />
        })}
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold tabular text-app-text">{safePaid}/{safeTotal}</span>
    </span>
  )
}
