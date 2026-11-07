import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Pencil, Mail, Phone, Calendar, DollarSign, ArrowLeft, AlertTriangle, Archive } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { PaymentHistory } from '@/components/members/PaymentHistory'
import { MemberStats } from '@/components/members/MemberStats'
import { getMembro } from '@/lib/actions/membros'
import { getPagamentosMembro } from '@/lib/actions/pagamentos'
import { formatCurrency } from '@/lib/utils/currency'
import { getCurrentMonthISO, getEffectiveStatus } from '@/lib/utils/date'
import type { PagamentoStatus } from '@/types/database'
import DeleteButton from './DeleteButton'
import { ArchiveButton } from './ArchiveButton'
import { QuitarTudoButton } from './QuitarTudoButton'

interface Params {
  params: Promise<{ id: string }>
}

export default async function MembroDetailPage({ params }: Params) {
  const { id } = await params
  const [membro, pagamentos] = await Promise.all([
    getMembro(id),
    getPagamentosMembro(id),
  ])

  if (!membro) notFound()

  const mesAtual = getCurrentMonthISO()
  const pagamentoAtual = pagamentos.find(p => p.mes_referencia === mesAtual) ?? null
  const statusAtual: PagamentoStatus = pagamentoAtual
    ? getEffectiveStatus(pagamentoAtual.mes_referencia, pagamentoAtual.status)
    : 'pendente'

  // Dívida até o mês atual (inclusive)
  const pagamentosDevidos = pagamentos
    .filter(p => p.mes_referencia <= mesAtual && p.status !== 'pago')
    .sort((a, b) => a.mes_referencia.localeCompare(b.mes_referencia))

  const totalDivida = pagamentosDevidos.reduce((acc, p) => acc + Number(p.valor), 0)

  const mesesFormatados = pagamentosDevidos
    .map(p => {
      const d = new Date(p.mes_referencia + 'T12:00:00')
      return d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
    })
    .join(', ')

  const infoItems = [
    membro.email    && { icon: Mail,       label: 'Email',         value: membro.email },
    membro.telefone && { icon: Phone,      label: 'Telefone',      value: membro.telefone },
    { icon: DollarSign, label: 'Valor mensal',  value: formatCurrency(Number(membro.valor_mensal)) },
    { icon: Calendar,   label: 'Vencimento',    value: `Todo dia ${membro.dia_vencimento}` },
  ].filter(Boolean) as { icon: React.ElementType; label: string; value: string }[]

  return (
    <>
      <Header title={membro.nome} showBack />

      <div className="px-4 py-5 lg:px-8 lg:py-8 max-w-2xl mx-auto lg:mx-0 space-y-6">
        {/* Desktop link: "← Dashboard" do desktop vai para /dashboard */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-app-muted hover:text-app-text text-sm flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <span className="text-app-line">•</span>
          <Link
            href="/membros"
            className="text-app-muted hover:text-app-text text-sm transition-colors"
          >
            Ver todos os membros
          </Link>
        </div>

        {/* Topo do membro */}
        <div className="rounded-[var(--radius-app)] border border-app-line bg-app-surface p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <Avatar nome={membro.nome} cor={membro.cor_avatar} size="lg" className="w-16 h-16 text-xl" />
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-app-text truncate">
                  {membro.nome}
                </h1>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {!membro.ativo ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-app-elevated border border-app-line text-app-subtle">
                      <Archive className="w-3.5 h-3.5" />
                      Arquivado
                    </span>
                  ) : (
                    <>
                      <Badge status={statusAtual} />
                      <span className="text-app-subtle text-xs">mês atual</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Ações principais */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap pt-2 sm:pt-0 border-t border-app-line sm:border-t-0">
              <Link
                href={`/membros/${id}/editar`}
                className="min-h-[44px] px-4 rounded-full border border-app-line bg-app-elevated hover:bg-app-surface text-app-text font-medium text-sm transition-colors flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
              >
                <Pencil className="w-4 h-4 text-app-subtle" />
                <span>Editar</span>
              </Link>

              <ArchiveButton
                membroId={id}
                nome={membro.nome}
                ativo={membro.ativo}
                className="flex-1 sm:flex-initial"
              />

              <DeleteButton membroId={id} nome={membro.nome} />
            </div>
          </div>

          {/* Destaque de Dívida até o mês atual */}
          {totalDivida > 0 && (
            <div className="mt-5 rounded-[var(--radius-app-sm)] border border-app-warn/30 bg-app-warn/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-app-warn flex-shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <p className="text-sm font-semibold text-app-warn">
                    Deve {formatCurrency(totalDivida)} ({mesesFormatados})
                  </p>
                  <p className="text-xs text-app-muted mt-0.5">
                    {pagamentosDevidos.length === 1 ? '1 mês pendente' : `${pagamentosDevidos.length} meses pendentes`} até o mês atual
                  </p>
                </div>
              </div>
              <QuitarTudoButton
                membroId={id}
                nome={membro.nome}
                totalDivida={totalDivida}
                mesesFormatados={mesesFormatados}
                qtdPendencias={pagamentosDevidos.length}
              />
            </div>
          )}
        </div>

        {/* Informações cadastrais */}
        <div className="rounded-[var(--radius-app)] border border-app-line bg-app-surface p-5">
          <h2 className="text-app-text font-semibold text-sm mb-3">Informações</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {infoItems.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 p-3 rounded-[var(--radius-app-sm)] bg-app-elevated/50 border border-app-line">
                <div className="w-9 h-9 rounded-full bg-app-elevated flex items-center justify-center flex-shrink-0 text-app-subtle">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-app-subtle text-xs">{label}</p>
                  <p className="text-app-text text-sm font-medium truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Faixa compacta de estatísticas */}
        <div>
          <MemberStats pagamentos={pagamentos} />
        </div>

        {/* Histórico de pagamentos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-app-text font-semibold text-base">Histórico de pagamentos</h2>
            <span className="text-xs text-app-subtle">
              {pagamentos.length} {pagamentos.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>
          <PaymentHistory pagamentos={pagamentos} />
        </div>
      </div>
    </>
  )
}
