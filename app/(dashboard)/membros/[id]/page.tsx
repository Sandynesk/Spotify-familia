import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Archive, CalendarDays, Mail, Pencil, Phone, Wallet } from 'lucide-react'
import { PaymentHeatmap } from '@/components/members/PaymentHeatmap'
import { MemberSeals } from '@/components/members/MemberSeals'
import { MemberStats } from '@/components/members/MemberStats'
import { PaymentHistory } from '@/components/members/PaymentHistory'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { NumberTicker } from '@/components/ui/NumberTicker'
import { PageHeader } from '@/components/ui/PageHeader'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { getConfiguracoes } from '@/lib/actions/configuracoes'
import { getMembro } from '@/lib/actions/membros'
import { getPagamentosMembro } from '@/lib/actions/pagamentos'
import { calcularPontualidade } from '@/lib/domain/pontualidade'
import { gerarPixCopiaECola } from '@/lib/domain/pix'
import { gerarQrSvg } from '@/lib/domain/qrcode'
import { linkWhatsApp } from '@/lib/domain/whatsapp'
import { formatCurrency } from '@/lib/utils/currency'
import { formatShortMonthYear, getCurrentMonthISO } from '@/lib/utils/date'
import type { Pagamento } from '@/types/database'
import { ArchiveButton } from './ArchiveButton'
import DeleteButton from './DeleteButton'
import { MarcarMesPagoButton } from './MarcarMesPagoButton'
import { MemberPixSheet } from './MemberPixSheet'
import { QuitarTudoButton } from './QuitarTudoButton'

interface Params {
  params: Promise<{ id: string }>
}

function formatDebtMonths(pagamentos: Pagamento[]) {
  const meses = pagamentos.map((pagamento) => new Date(`${pagamento.mes_referencia}T12:00:00`).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''))
  if (meses.length < 2) return meses[0] ?? ''
  if (meses.length === 2) return `${meses[0]} e ${meses[1]}`
  return `${meses.slice(0, -1).join(', ')} e ${meses.at(-1)}`
}

function monthsOnPlan(dataEntrada: string) {
  const start = new Date(`${dataEntrada.slice(0, 10)}T12:00:00`)
  if (Number.isNaN(start.getTime())) return 0
  const now = new Date()
  return Math.max(1, (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth() + 1)
}

export default async function MembroDetailPage({ params }: Params) {
  const { id } = await params
  const [membro, pagamentos, configuracoes] = await Promise.all([
    getMembro(id),
    getPagamentosMembro(id),
    getConfiguracoes(),
  ])

  if (!membro) notFound()

  const mesAtual = getCurrentMonthISO()
  const pagamentoAtual = pagamentos.find((pagamento) => pagamento.mes_referencia === mesAtual) ?? null
  const pagamentosDevidos = pagamentos
    .filter((pagamento) => pagamento.mes_referencia <= mesAtual && pagamento.status !== 'pago')
    .sort((a, b) => a.mes_referencia.localeCompare(b.mes_referencia))
  const totalDivida = pagamentosDevidos.reduce((total, pagamento) => total + Number(pagamento.valor), 0)
  const mesesDevidos = formatDebtMonths(pagamentosDevidos)
  const pontualidade = calcularPontualidade(membro, pagamentos)
  const totalPago = pagamentos
    .filter((pagamento) => pagamento.status === 'pago')
    .reduce((total, pagamento) => total + Number(pagamento.valor), 0)
  const whatsappUrl = membro.telefone ? linkWhatsApp(membro.telefone, `Oi, ${membro.nome}!`) : null
  const telefoneUrl = membro.telefone ? `tel:${membro.telefone.replace(/[^\d+]/g, '')}` : null
  const membroDesde = formatShortMonthYear(membro.data_entrada).replace('.', '').replace(' de ', '/')

  let pixCopiaECola: string | null = null
  let qrSvg: string | null = null
  if (totalDivida > 0 && configuracoes?.chave_pix) {
    try {
      pixCopiaECola = gerarPixCopiaECola({
        chave: configuracoes.chave_pix,
        valor: totalDivida,
        nome: 'SpotiFamilia',
        cidade: 'BRASIL',
        txid: membro.id.slice(0, 25),
      })
      qrSvg = await gerarQrSvg(pixCopiaECola)
    } catch {
      pixCopiaECola = null
      qrSvg = null
    }
  }

  const scoreLabel = pontualidade.pagamentosAnalisados === 0
    ? 'Sem histórico suficiente'
    : pontualidade.scorePontualidade >= 85
      ? 'Pontual'
      : pontualidade.scorePontualidade >= 60
        ? 'Às vezes atrasa'
        : 'Costuma atrasar'
  const avatarStatus = totalDivida === 0 ? 'paid' : pagamentosDevidos.some((pagamento) => pagamento.status === 'atrasado') ? 'overdue' : 'pending'
  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        title="Perfil do membro"
        subtitle={`Acompanhe a contribuição de ${membro.nome}.`}
        showBack
        actions={(
          <Link href={`/membros/${id}/editar`} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-app-line bg-app-elevated px-4 text-sm font-medium text-app-text transition-colors hover:bg-app-raised">
            <Pencil aria-hidden className="h-4 w-4" /> Editar
          </Link>
        )}
      />

      <Card variant="hero" padding="lg" className="overflow-hidden">
        <div className="relative z-10 grid grid-cols-[minmax(0,1fr)_92px] items-center gap-3 sm:grid-cols-[minmax(0,1fr)_112px] sm:gap-5">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Avatar nome={membro.nome} cor={membro.cor_avatar} size="xl" status={avatarStatus} className="ring-offset-app-surface" />
            <div className="min-w-0">
              <h2 className="break-words text-xl font-semibold tracking-[-0.02em] text-app-text sm:text-2xl">{membro.nome}</h2>
              <p className="mt-1 text-sm text-app-muted">No plano desde {membroDesde}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {!membro.ativo ? (
                  <span className="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-app-line bg-app-elevated px-2.5 text-xs text-app-muted">
                    <Archive aria-hidden className="h-3.5 w-3.5" /> Arquivado
                  </span>
                ) : totalDivida > 0 ? (
                  <Badge status={avatarStatus === 'overdue' ? 'atrasado' : 'pendente'} label="Em aberto" />
                ) : (
                  <Badge status="pago" label="Em dia" />
                )}
                <span className="text-xs text-app-subtle">Vence dia {membro.dia_vencimento}</span>
              </div>
            </div>
          </div>

          <div className="justify-self-end">
            <ProgressRing
              value={pontualidade.scorePontualidade}
              size={92}
              strokeWidth={7}
              label={<NumberTicker value={pontualidade.scorePontualidade} className="text-2xl" />}
              caption="de 100"
            />
          </div>
        </div>

        <div className="relative z-10 mt-5 border-t border-app-line/80 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-app-text">{scoreLabel}</p>
            <span className="text-xs text-app-muted">{pontualidade.pagamentosAnalisados} pagamentos analisados</span>
          </div>
          <div className="mt-3">
            <MemberSeals selos={pontualidade.selos} />
          </div>
        </div>
      </Card>

      <section aria-labelledby="billing-status" className="space-y-3">
        <SectionHeader title="Situação atual" />
        <Card className="space-y-4">
          <div className="flex items-start gap-3">
            <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${totalDivida > 0 ? 'bg-app-warn/12 text-app-warn' : 'bg-app-accent/12 text-app-accent'}`}>
              <Wallet aria-hidden className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="billing-status" className="text-[17px] font-semibold text-app-text">
                {totalDivida > 0 ? `Deve ${formatCurrency(totalDivida)} (${mesesDevidos})` : 'Em dia'}
              </h2>
              <p className="mt-1 text-sm text-app-muted">
                {totalDivida > 0 ? `${pagamentosDevidos.length} ${pagamentosDevidos.length === 1 ? 'mês em aberto' : 'meses em aberto'}.` : 'Não há contribuições pendentes até este mês.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-app-line pt-4">
            {membro.ativo && (
              <Link
                href={`/cobrar?membro=${membro.id}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-app-accent px-4 text-sm font-semibold text-app-accent-ink transition-colors hover:bg-app-accent-hover"
              >
                <Phone aria-hidden className="h-4 w-4" /> Cobrar no WhatsApp
              </Link>
            )}
            {membro.ativo && pagamentoAtual && pagamentoAtual.status !== 'pago' && (
              <MarcarMesPagoButton pagamentoId={pagamentoAtual.id} mesReferencia={pagamentoAtual.mes_referencia} nome={membro.nome} />
            )}
            {totalDivida > 0 && (
              <>
                <QuitarTudoButton
                  membroId={id}
                  nome={membro.nome}
                  totalDivida={totalDivida}
                  mesesFormatados={mesesDevidos}
                  qtdPendencias={pagamentosDevidos.length}
                  pagamentoIds={pagamentosDevidos.map((pagamento) => pagamento.id)}
                />
                <MemberPixSheet valor={totalDivida} meses={mesesDevidos} pixCopiaECola={pixCopiaECola} qrSvg={qrSvg} />
              </>
            )}
          </div>
        </Card>
      </section>

      <section aria-label="Estatísticas de pagamentos" className="space-y-3">
        <SectionHeader title="Resumo da jornada" />
        <MemberStats
          mediaDias={pontualidade.mediaDiasAtraso}
          sequenciaAtual={pontualidade.sequenciaAtual}
          totalPago={totalPago}
          mesesNoPlano={monthsOnPlan(membro.data_entrada)}
        />
      </section>

      <PaymentHeatmap membro={membro} pagamentos={pagamentos} />

      <section aria-label="Contato" className="space-y-3">
        <SectionHeader title="Contato" />
        <Card padding="none" className="divide-y divide-app-line overflow-hidden">
          {membro.telefone ? (
            <div className="flex min-w-0 items-center gap-3 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-app-elevated text-app-subtle"><Phone aria-hidden className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-app-subtle">Telefone</p>
                <a href={telefoneUrl ?? undefined} className="mt-0.5 block truncate text-sm font-medium text-app-text hover:text-app-accent">{membro.telefone}</a>
              </div>
              {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-full border border-app-line bg-app-elevated px-3 text-xs font-semibold text-app-text hover:bg-app-raised">WhatsApp</a>}
            </div>
          ) : (
            <p className="p-4 text-sm text-app-muted">Nenhum telefone cadastrado.</p>
          )}
          {membro.email ? (
            <div className="flex min-w-0 items-center gap-3 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-app-elevated text-app-subtle"><Mail aria-hidden className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-app-subtle">E-mail</p>
                <a href={`mailto:${membro.email}`} className="mt-0.5 block truncate text-sm font-medium text-app-text hover:text-app-accent">{membro.email}</a>
              </div>
            </div>
          ) : (
            <p className="p-4 text-sm text-app-muted">Nenhum e-mail cadastrado.</p>
          )}
          <div className="flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-app-elevated text-app-subtle"><CalendarDays aria-hidden className="h-4 w-4" /></span>
            <div><p className="text-xs text-app-subtle">Contribuição mensal</p><p className="mt-0.5 text-sm font-medium tabular text-app-text">{formatCurrency(Number(membro.valor_mensal))} · todo dia {membro.dia_vencimento}</p></div>
          </div>
        </Card>
      </section>

      <section aria-label="Histórico de pagamentos" className="space-y-3">
        <SectionHeader title="Histórico de pagamentos" />
        <PaymentHistory pagamentos={pagamentos} />
      </section>

      <section aria-label="Zona de perigo" className="space-y-3 border-t border-app-line pt-5">
        <SectionHeader title="Zona de perigo" />
        <Card className="space-y-4 border-app-danger/20">
          <div>
            <p className="text-sm font-medium text-app-text">Ações do membro</p>
            <p className="mt-1 text-sm text-app-muted">Arquivar preserva o histórico. Excluir remove os pagamentos registrados.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ArchiveButton membroId={id} nome={membro.nome} ativo={membro.ativo} />
            <DeleteButton membroId={id} nome={membro.nome} />
          </div>
        </Card>
      </section>
    </div>
  )
}
