import { ArrowUpRight, CheckCircle2, CircleDollarSign } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { SlotsRing } from '@/components/ui/SlotsRing'
import { StatusBadge } from '@/components/ui/Badge'

const previewMembers = [
  { name: 'Ana', amount: 'R$ 32,00', status: 'pago' as const, note: 'Pago em 04 nov.' },
  { name: 'Bruno', amount: 'R$ 32,00', status: 'pago' as const, note: 'Pago em 05 nov.' },
  { name: 'Carla', amount: 'R$ 32,00', status: 'pago' as const, note: 'Pago em 06 nov.' },
  { name: 'Diego', amount: 'R$ 32,00', status: 'pendente' as const, note: 'Vence dia 10' },
]

/** Static preview of the real app, shown beside the authentication forms on desktop. */
export function AuthPreview() {
  return (
    <section className="space-y-3" aria-label="Prévia do painel SpotiFamília">
      <Card variant="hero" padding="lg" className="rounded-[28px] border-white/[0.08] shadow-app-float">
        <div className="flex items-center justify-between gap-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-app-accent">Resumo do plano</p>
            <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-app-text">Novembro em ordem</h3>
            <p className="mt-1 text-sm text-app-muted">4 de 6 vagas ocupadas</p>
          </div>
          <SlotsRing occupied={4} paid={3} total={6} size={82} label="3 vagas pagas, 1 pendente e 2 vagas livres" />
        </div>

        <div className="mt-6 rounded-app-sm border border-app-line bg-app-bg/35 px-4 py-3.5">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-sm text-app-muted">
              <CircleDollarSign aria-hidden className="h-4 w-4 text-app-accent" /> Já recebido
            </span>
            <span className="tabular text-base font-semibold text-app-text">R$ 96,00</span>
          </div>
          <div
            className="mt-3 h-1.5 overflow-hidden rounded-full bg-app-raised"
            role="progressbar"
            aria-label="Arrecadação do mês"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={75}
          >
            <span aria-hidden="true" className="block h-full w-3/4 rounded-full bg-app-accent" />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-app-subtle">
            <span>3 de 4 pessoas pagaram</span>
            <span className="tabular">75%</span>
          </div>
        </div>
      </Card>

      <Card padding="sm" className="rounded-[24px] bg-app-surface/90">
        <div className="flex items-center justify-between px-1 pb-2">
          <div>
            <h3 className="text-[15px] font-semibold text-app-text">Membros</h3>
            <p className="text-xs text-app-subtle">Seu grupo, de relance</p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-app-muted">
            Ver painel <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
          </span>
        </div>

        <ul className="divide-y divide-app-line" aria-label="Membros fictícios do exemplo">
          {previewMembers.map((member) => (
            <li key={member.name} className="flex min-w-0 items-center gap-3 px-1 py-2.5">
              <Avatar nome={member.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-app-text">{member.name}</p>
                <p className="truncate text-xs text-app-subtle">{member.note}</p>
              </div>
              <span className="hidden tabular text-xs font-medium text-app-muted xl:inline">{member.amount}</span>
              <StatusBadge status={member.status} className="shrink-0 px-2 text-[11px]" />
            </li>
          ))}
        </ul>

        <p className="mt-2 flex items-center gap-2 px-1 text-xs text-app-muted">
          <CheckCircle2 aria-hidden className="h-4 w-4 text-app-accent" />
          Um resumo simples para fechar o mês tranquilo.
        </p>
      </Card>
    </section>
  )
}
