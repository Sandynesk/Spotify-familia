import type { MemberStatus } from '../data'

interface ScreenBadgeProps {
  status: MemberStatus
  className?: string
}

const statusConfig: Record<MemberStatus, { label: string; bg: string; color: string }> = {
  pago: { label: 'Pago', bg: 'rgba(29,185,84,0.15)', color: '#1DB954' },
  pendente: { label: 'Pendente', bg: 'rgba(245,155,35,0.15)', color: '#F59B23' },
  atrasado: { label: 'Atrasado', bg: 'rgba(226,33,52,0.15)', color: '#E22134' },
}

/**
 * Badge autocontido idêntico ao components/ui/Badge.tsx do app real.
 */
export function ScreenBadge({ status, className = '' }: ScreenBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 select-none ${className}`}
      style={{ backgroundColor: config.bg, color: config.color }}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: config.color }}
      />
      {config.label}
    </span>
  )
}
