'use client'

import { Copy, MessageCircle, QrCode } from 'lucide-react'
import Link from 'next/link'
import { Button, Sheet, Textarea } from '@/components/ui'
import type { ItemCobranca } from '@/lib/actions/cobranca'
import { formatCurrency } from '@/lib/utils/currency'

interface PixCobrancaSheetProps {
  cobranca: ItemCobranca | null
  mensagem: string
  onClose: () => void
  onMensagemChange: (mensagem: string) => void
  onEnviar: () => void
  onCopiarPix: () => void
}

export function PixCobrancaSheet({ cobranca, mensagem, onClose, onMensagemChange, onEnviar, onCopiarPix }: PixCobrancaSheetProps) {
  return (
    <Sheet open={Boolean(cobranca)} onClose={onClose} title={cobranca ? `Cobrar ${cobranca.nome}` : 'PIX da cobrança'} description={cobranca ? `${formatCurrency(cobranca.total)} · ${cobranca.meses.length} ${cobranca.meses.length === 1 ? 'mês em aberto' : 'meses em aberto'}` : undefined}>
      {cobranca && (
        <div className="space-y-5">
          <Textarea
            label="Mensagem"
            value={mensagem}
            onChange={event => onMensagemChange(event.target.value)}
            rows={4}
            className="min-h-24 text-sm leading-relaxed"
          />
          {cobranca.qrSvg ? (
            <div className="flex flex-col items-center gap-3 rounded-app border border-app-line bg-app-elevated p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-app-text"><QrCode aria-hidden className="h-4 w-4 text-app-accent" /> PIX de {formatCurrency(cobranca.total)}</p>
              <div className="h-56 w-56 rounded-app-sm bg-white p-3 sm:h-64 sm:w-64 sm:p-4" role="img" aria-label={`QR Code PIX de ${formatCurrency(cobranca.total)} para ${cobranca.nome}`}>
                <div className="h-full w-full [&>svg]:block [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: cobranca.qrSvg }} />
              </div>
              <p className="text-xs text-app-muted">Aponte a câmera do banco para pagar o valor exato.</p>
              <div className="w-full break-all rounded-app-sm border border-app-line bg-app-surface p-3 font-mono text-xs leading-relaxed text-app-muted">{cobranca.pixCopiaECola}</div>
            </div>
          ) : (
            <p className="rounded-app-sm border border-app-line bg-app-elevated p-3 text-sm text-app-muted">Cadastre sua chave PIX em <Link className="font-medium text-app-accent hover:underline" href="/configuracoes">Configurações</Link> para gerar o QR com o valor exato.</p>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Button icon={<MessageCircle />} onClick={onEnviar}>{cobranca.telefoneWhatsApp ? 'Enviar no WhatsApp' : 'Escolher contato no WhatsApp'}</Button>
            <Button variant="secondary" icon={<Copy />} disabled={!cobranca.pixCopiaECola} onClick={onCopiarPix}>Copiar PIX</Button>
          </div>
        </div>
      )}
    </Sheet>
  )
}
