'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Copy, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Sheet } from '@/components/ui/Sheet'
import { Textarea } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { formatCurrency } from '@/lib/utils/currency'

interface MemberPixSheetProps {
  valor: number
  meses: string
  pixCopiaECola: string | null
  qrSvg: string | null
}

export function MemberPixSheet({ valor, meses, pixCopiaECola, qrSvg }: MemberPixSheetProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const { success, error } = useToast()

  async function handleCopy() {
    if (!pixCopiaECola) return
    try {
      await navigator.clipboard.writeText(pixCopiaECola)
      setCopied(true)
      success('Código PIX copiado.')
    } catch {
      error('Não foi possível copiar. Você pode selecionar o código abaixo.')
    }
  }

  return (
    <>
      <Button type="button" variant="secondary" icon={<QrCode />} onClick={() => setOpen(true)}>
        PIX
      </Button>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="PIX do valor em aberto"
        description={`Copie e cole para receber ${formatCurrency(valor)} (${meses}).`}
      >
        {pixCopiaECola ? (
          <div className="space-y-4">
            {qrSvg && (
              <Card padding="sm" className="mx-auto w-fit bg-white">
                <div
                  role="img"
                  aria-label="QR Code PIX com o valor em aberto"
                  className="h-48 w-48 [&>svg]:h-full [&>svg]:w-full"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
              </Card>
            )}
            <Textarea
              label="PIX copia e cola"
              value={pixCopiaECola}
              readOnly
              rows={4}
              className="break-all font-mono text-xs"
            />
            <Button type="button" className="w-full" icon={copied ? <Check /> : <Copy />} onClick={handleCopy}>
              {copied ? 'Copiado' : 'Copiar código PIX'}
            </Button>
          </div>
        ) : (
          <Card className="space-y-3">
            <p className="text-sm text-app-muted">Adicione sua chave PIX para gerar o QR Code e o código de pagamento.</p>
            <Link href="/configuracoes" className="inline-flex min-h-11 items-center rounded-full bg-app-accent px-5 text-sm font-semibold text-app-accent-ink transition-colors hover:bg-app-accent-hover">
              Configurar chave PIX
            </Link>
          </Card>
        )}
      </Sheet>
    </>
  )
}
