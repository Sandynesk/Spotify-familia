'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Sheet } from '@/components/ui/Sheet'
import { useToast } from '@/components/ui/Toast'
import { quitarPendencias } from '@/lib/actions/pagamentos'
import { formatCurrency } from '@/lib/utils/currency'

interface QuitarTudoButtonProps {
  membroId: string
  nome: string
  totalDivida: number
  mesesFormatados: string
  qtdPendencias: number
}

export function QuitarTudoButton({
  membroId,
  nome,
  totalDivida,
  mesesFormatados,
  qtdPendencias,
}: QuitarTudoButtonProps) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const { success, error } = useToast()
  const router = useRouter()

  function handleQuitar() {
    startTransition(async () => {
      try {
        const result = await quitarPendencias(membroId)
        if (result && 'error' in result && result.error) {
          error(result.error)
        } else {
          const quitadas = result && 'quitadas' in result ? result.quitadas : qtdPendencias
          success(`${quitadas} cobrança(s) quitada(s) com sucesso!`)
          setOpen(false)
          router.refresh()
        }
      } catch (err: unknown) {
        error(err instanceof Error ? err.message : 'Erro ao quitar pendências')
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-[44px] px-4 rounded-full bg-app-accent hover:bg-app-accent-hover text-black font-semibold text-sm transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-1.5 flex-shrink-0"
      >
        <CheckCircle2 className="w-4 h-4" />
        <span>Quitar tudo</span>
      </button>

      <Sheet
        open={open}
        onClose={() => !pending && setOpen(false)}
        title={`Quitar pendências de ${nome}?`}
        description={`Confirma o pagamento de ${formatCurrency(totalDivida)} referente a ${mesesFormatados}? Todas as cobranças até este mês serão marcadas como pagas.`}
      >
        <div className="mt-4 space-y-4">
          <div className="rounded-[var(--radius-app-sm)] border border-app-line bg-app-elevated p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-app-muted">Meses pendentes:</span>
              <span className="text-app-text font-medium capitalize">{mesesFormatados}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-app-line">
              <span className="text-app-muted">Total a quitar:</span>
              <span className="text-app-accent font-semibold text-base tabular-nums">
                {formatCurrency(totalDivida)}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={pending}
              className="flex-1 min-h-[48px] rounded-full border border-app-line bg-app-elevated text-app-text font-medium hover:bg-app-surface transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleQuitar}
              disabled={pending}
              className="flex-[2] min-h-[48px] rounded-full bg-app-accent hover:bg-app-accent-hover text-black font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {pending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Quitando...</span>
                </>
              ) : (
                <span>Confirmar pagamento</span>
              )}
            </button>
          </div>
        </div>
      </Sheet>
    </>
  )
}
