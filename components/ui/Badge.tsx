import type { PagamentoStatus } from '@/types/database'

interface BadgeProps {
  status: PagamentoStatus
  className?: string
}

const statusConfig: Record<PagamentoStatus, { label: string; className: string }> = {
  pago:     { label: 'Pago',     className: 'bg-app-accent/15 text-app-accent' },
  pendente: { label: 'Pendente', className: 'bg-app-warn/15 text-app-warn' },
  atrasado: { label: 'Atrasado', className: 'bg-app-danger/15 text-app-danger' },
}

export function Badge({ status, className = '' }: BadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.className} ${className}`}
    >
      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current" aria-hidden />
      {config.label}
    </span>
  )
}
