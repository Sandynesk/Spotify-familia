import { AlertCircle, Check, Clock3 } from 'lucide-react'
import type { PagamentoStatus } from '@/types/database'
import { cn } from '@/lib/utils'

export interface StatusBadgeProps {
  status: PagamentoStatus
  className?: string
  label?: string
}

const statusConfig: Record<PagamentoStatus, { label: string; className: string; icon: typeof Check }> = {
  pago: { label: 'Pago', className: 'bg-app-accent/12 text-app-accent', icon: Check },
  pendente: { label: 'Pendente', className: 'bg-app-warn/12 text-app-warn', icon: Clock3 },
  atrasado: { label: 'Atrasado', className: 'bg-app-danger/12 text-app-danger', icon: AlertCircle },
}

/** Payment state badge with both icon and text, so color is never the only cue. */
export function StatusBadge({ status, className, label }: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <span className={cn('inline-flex min-h-6 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium leading-none select-none whitespace-nowrap', config.className, className)}>
      <Icon aria-hidden className="h-3.5 w-3.5 shrink-0 stroke-[2]" />
      {label ?? config.label}
    </span>
  )
}

/** Backward-compatible payment badge name used by existing screens. */
export const Badge = StatusBadge
