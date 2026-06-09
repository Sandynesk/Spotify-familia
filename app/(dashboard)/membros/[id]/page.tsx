import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Pencil, Mail, Phone, Calendar, DollarSign } from 'lucide-react'
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

  const infoItems = [
    membro.email    && { icon: Mail,     label: 'Email',       value: membro.email },
    membro.telefone && { icon: Phone,    label: 'Telefone',    value: membro.telefone },
    { icon: DollarSign, label: 'Valor mensal', value: formatCurrency(Number(membro.valor_mensal)) },
    { icon: Calendar,   label: 'Vencimento',  value: `Todo dia ${membro.dia_vencimento}` },
  ].filter(Boolean) as { icon: React.ElementType; label: string; value: string }[]

  return (
    <>
      <Header title={membro.nome} showBack />

      <div className="px-4 py-5 lg:px-8 lg:py-8 max-w-2xl">
        {/* Desktop back */}
        <div className="hidden lg:flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="text-[#B3B3B3] hover:text-white text-sm flex items-center gap-1 transition-colors"
          >
            ← Dashboard
          </Link>
        </div>

        {/* Member header */}
        <div className="flex items-start gap-4 mb-6">
          <Avatar nome={membro.nome} cor={membro.cor_avatar} size="lg" />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white">{membro.nome}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge status={statusAtual} />
              <span className="text-[#535353] text-xs">mês atual</span>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Link
              href={`/membros/${id}/editar`}
              className="w-9 h-9 bg-[#282828] hover:bg-[#3E3E3E] rounded-full flex items-center justify-center transition-colors"
              aria-label="Editar membro"
            >
              <Pencil className="w-4 h-4 text-white" />
            </Link>
            <DeleteButton membroId={id} nome={membro.nome} />
          </div>
        </div>

        {/* Info */}
        <div className="bg-[#181818] rounded-lg p-4 mb-4">
          <h2 className="text-white font-semibold text-sm mb-3">Informações</h2>
          <div className="space-y-3">
            {infoItems.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#282828] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-[#535353]" />
                </div>
                <div>
                  <p className="text-[#535353] text-xs">{label}</p>
                  <p className="text-white text-sm">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mb-4">
          <MemberStats pagamentos={pagamentos} />
        </div>

        {/* Payment history */}
        <div>
          <h2 className="text-white font-semibold text-sm mb-3">Histórico de pagamentos</h2>
          <PaymentHistory pagamentos={pagamentos} membroId={id} />
        </div>
      </div>
    </>
  )
}

