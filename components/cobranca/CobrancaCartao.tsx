'use client'

import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Check, Copy, ExternalLink, MessageCircle, QrCode } from 'lucide-react'
import { Avatar, Button, Card, StatusBadge, Textarea, springs } from '@/components/ui'
import type { ItemCobranca } from '@/lib/actions/cobranca'
import { formatCurrency } from '@/lib/utils/currency'
import { formatShortMonthYear } from '@/lib/utils/date'
import type { TomMensagem } from '@/lib/domain/whatsapp'

interface CobrancaCartaoProps {
  cobranca: ItemCobranca
  tom: TomMensagem
  mensagem: string
  cobradoEm?: string
  posicao: number
  totalNaFila: number
  processandoPagamento: boolean
  onMensagemChange: (mensagem: string) => void
  onEnviar: () => void
  onCopiarMensagem: () => void
  onCopiarPix: () => void
  onAbrirPix: () => void
  onMarcarPago: () => void
}

export function CobrancaCartao({
  cobranca,
  tom,
  mensagem,
  cobradoEm,
  posicao,
  totalNaFila,
  processandoPagamento,
  onMensagemChange,
  onEnviar,
  onCopiarMensagem,
  onCopiarPix,
  onAbrirPix,
  onMarcarPago,
}: CobrancaCartaoProps) {
  const reducedMotion = useReducedMotion()
  const meses = cobranca.meses.map(formatShortMonthYear).join(' · ')

  return (
    <div className="relative min-h-[520px] sm:min-h-[500px]">
      {totalNaFila > 1 && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-4 top-3 h-full rounded-app border border-app-line bg-app-elevated/75" />
      )}
      {totalNaFila > 2 && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-8 top-6 h-full rounded-app border border-app-line bg-app-raised/60" />
      )}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={cobranca.membroId}
          initial={reducedMotion ? undefined : { opacity: 0, y: 16, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reducedMotion ? undefined : { opacity: 0, x: 44, rotate: 2, scale: 0.98 }}
          transition={reducedMotion ? { duration: 0 } : springs.snappy}
          className="relative"
        >
          <Card className="space-y-4 border-app-line-strong p-4 shadow-app-float sm:p-6">
            <div className="flex items-start gap-3">
              <Avatar nome={cobranca.nome} size="lg" status={cobranca.temAtraso ? 'overdue' : 'pending'} />
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="truncate text-lg font-semibold tracking-tight text-app-text">{cobranca.nome}</p>
                <p className="mt-1 text-sm text-app-muted">{cobranca.meses.length === 1 ? '1 mês em aberto' : `${cobranca.meses.length} meses em aberto`}</p>
                <p className="mt-1 truncate text-xs text-app-subtle">{meses}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="tabular text-lg font-semibold text-app-text">{formatCurrency(cobranca.total)}</p>
                <StatusBadge status={cobranca.temAtraso ? 'atrasado' : 'pendente'} className="mt-1" />
              </div>
            </div>

            {cobradoEm && <p className="-mt-1 flex items-center gap-1.5 text-xs font-medium text-app-accent"><Check aria-hidden className="h-3.5 w-3.5" />{cobradoEm}</p>}

            <Textarea
              label={`Mensagem para ${cobranca.nome} · tom ${tom}`}
              value={mensagem}
              onChange={event => onMensagemChange(event.target.value)}
              rows={5}
              className="min-h-28 resize-y text-sm leading-relaxed"
            />

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Button className="col-span-2 sm:col-span-3" icon={<MessageCircle />} onClick={onEnviar}>
                {cobranca.telefoneWhatsApp ? 'Enviar no WhatsApp' : 'Escolher contato no WhatsApp'}
              </Button>
              <Button variant="secondary" icon={<Copy />} onClick={onCopiarMensagem}>Copiar mensagem</Button>
              <Button variant="secondary" icon={<QrCode />} onClick={onAbrirPix}>Ver PIX</Button>
              <Button variant="secondary" icon={<Copy />} onClick={onCopiarPix} disabled={!cobranca.pixCopiaECola}>Copiar PIX</Button>
              <Button
                className="col-span-2 sm:col-span-3"
                variant="ghost"
                icon={<Check />}
                onClick={onMarcarPago}
                loading={processandoPagamento}
              >
                Já pagou
              </Button>
            </div>

            {!cobranca.telefoneWhatsApp && (
              <p className="text-center text-sm text-app-muted">
                Sem telefone salvo. <Link className="inline-flex min-h-11 items-center gap-1 font-medium text-app-accent hover:underline" href={`/membros/${cobranca.membroId}/editar`}>Adicionar telefone <ExternalLink aria-hidden className="h-3.5 w-3.5" /></Link>
              </p>
            )}

            <p className="text-center text-xs text-app-subtle">Pessoa {posicao} de {totalNaFila}</p>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
