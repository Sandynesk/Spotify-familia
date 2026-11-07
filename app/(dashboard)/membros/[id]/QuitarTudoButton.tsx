'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Sheet } from '@/components/ui/Sheet'
import { useToast } from '@/components/ui/Toast'
import { desfazerVarios } from '@/lib/actions/lote'
import { quitarPendencias } from '@/lib/actions/pagamentos'
import { formatCurrency } from '@/lib/utils/currency'

interface QuitarTudoButtonProps {
  membroId: string
  nome: string
  totalDivida: number
  mesesFormatados: string
  qtdPendencias: number
  pagamentoIds: string[]
}

export function QuitarTudoButton({
  membroId,
  nome,
  totalDivida,
  mesesFormatados,
  qtdPendencias,
  pagamentoIds,
}: QuitarTudoButtonProps) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const { show, error } = useToast()
  const router = useRouter()

  function handleUndo() {
    startTransition(async () => {
      try {
        const result = await desfazerVarios(pagamentoIds)
        if ('error' in result && result.error) {
          error(result.error)
          return
        }
        show({ message: 'Pagamentos desfeitos.', type: 'warning' })
        router.refresh()
      } catch {
        error('Não foi possível desfazer os pagamentos.')
      }
    })
  }

  function handleQuitar() {
    startTransition(async () => {
      try {
        const result = await quitarPendencias(membroId)
        if ('error' in result && result.error) {
          error(result.error)
          return
        }
        const quitadas = 'quitadas' in result ? result.quitadas : qtdPendencias
        show({
          message: `${quitadas} ${quitadas === 1 ? 'cobrança quitada' : 'cobranças quitadas'}.`,
          action: { label: 'Desfazer', onClick: handleUndo },
        })
        setOpen(false)
        router.refresh()
      } catch {
        error('Não foi possível quitar as pendências.')
      }
    })
  }

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)} icon={<CheckCircle2 />}>
        Quitar tudo
      </Button>

      <Sheet
        open={open}
        onClose={() => !pending && setOpen(false)}
        title={`Quitar pendências de ${nome}?`}
        description={`Confirma o pagamento de ${formatCurrency(totalDivida)} referente a ${mesesFormatados}? Todas as cobranças até este mês serão marcadas como pagas.`}
      >
        <div className="mt-4 space-y-4">
          <div className="rounded-app-sm border border-app-line bg-app-elevated p-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-app-muted">Meses pendentes</span>
              <span className="truncate font-medium capitalize text-app-text">{mesesFormatados}</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-app-line pt-2 text-sm">
              <span className="text-app-muted">Total a quitar</span>
              <span className="text-base font-semibold tabular text-app-accent">{formatCurrency(totalDivida)}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setOpen(false)} disabled={pending}>
              Cancelar
            </Button>
            <Button type="button" className="flex-[2]" onClick={handleQuitar} loading={pending}>
              Confirmar pagamento
            </Button>
          </div>
        </div>
      </Sheet>
    </>
  )
}
