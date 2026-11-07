import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils/currency'
import type { Membro, Pagamento } from '@/types/database'
import type { ResumoPontualidade } from '@/types/domain'
import { MemberSeals } from '@/components/members/MemberSeals'

interface MemberCardProps {
  membro: Membro
  pagamento: Pagamento | null
  pontualidade: ResumoPontualidade
}

export function MemberCard({ membro, pagamento, pontualidade }: MemberCardProps) {
  const status = pagamento?.status ?? 'pendente'
  const avatarStatus = status === 'pago' ? 'paid' : status === 'atrasado' ? 'overdue' : 'pending'
  const score = pontualidade.scorePontualidade
  const scoreLabel = pontualidade.pagamentosAnalisados === 0
    ? 'Sem histórico'
    : score >= 85
      ? 'Pontual'
      : score >= 60
        ? 'Às vezes atrasa'
        : 'Costuma atrasar'
  const scoreTone = pontualidade.pagamentosAnalisados === 0
    ? 'bg-app-line-strong'
    : score >= 85
      ? 'bg-app-accent'
      : score >= 60
        ? 'bg-app-warn'
        : 'bg-app-danger'

  return (
    <Link href={`/membros/${membro.id}`} className="block h-full rounded-app focus-visible:outline-none">
      <Card variant="interactive" className="flex h-full min-h-52 flex-col gap-4 p-4 sm:p-5">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar nome={membro.nome} cor={membro.cor_avatar} size="md" status={avatarStatus} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[17px] font-semibold tracking-[-0.01em] text-app-text">{membro.nome}</p>
            <p className="mt-1 text-sm text-app-muted">Vencimento dia {membro.dia_vencimento}</p>
          </div>
          <ChevronRight aria-hidden className="mt-1 h-5 w-5 shrink-0 text-app-subtle" />
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-app-subtle">Mensalidade</p>
            <p className="mt-0.5 text-base font-semibold tabular text-app-text">
              {formatCurrency(Number(pagamento?.valor ?? membro.valor_mensal))}
            </p>
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="text-app-muted">Pontualidade</span>
            <span className="font-medium text-app-text" aria-label={`Score ${score} de 100: ${scoreLabel}`}>
              {scoreLabel} <span className="tabular text-app-muted">· {score}/100</span>
            </span>
          </div>
          <div
            className="h-1.5 overflow-hidden rounded-full bg-app-elevated"
            role="meter"
            aria-label={`Pontualidade de ${membro.nome}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={score}
            aria-valuetext={`${scoreLabel}, ${score} de 100`}
          >
            <span className={`block h-full rounded-full transition-[width] duration-500 ${scoreTone}`} style={{ width: `${score}%` }} />
          </div>
          {pontualidade.selos.length > 0 && <MemberSeals selos={pontualidade.selos} compact />}
        </div>
      </Card>
    </Link>
  )
}
