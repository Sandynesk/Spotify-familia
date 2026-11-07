// Marca do SpotiFamília (símbolo + nome). Dono: orquestrador.
// PROVISÓRIO: o símbolo definitivo vem da logo gerada (em produção, será um SVG vetorial redesenhado).
import { cn } from '@/lib/utils'

interface BrandMarkProps {
  /** tamanho do símbolo em px */
  size?: number
  /** mostrar o nome ao lado do símbolo */
  withName?: boolean
  className?: string
}

export function BrandMark({ size = 20, withName = true, className }: BrandMarkProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => {
          const a = (i / 6) * Math.PI * 2 - Math.PI / 2
          return <circle key={i} cx={12 + Math.cos(a) * 7} cy={12 + Math.sin(a) * 7} r={3.2} fill="var(--landing-accent)" />
        })}
      </svg>
      {withName && <span className="font-semibold tracking-[-0.02em] text-white">SpotiFamília</span>}
    </span>
  )
}
