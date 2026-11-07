'use client'

import { useState, useTransition } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Sheet } from '@/components/ui/Sheet'
import { useToast } from '@/components/ui/Toast'
import { formatCurrency } from '@/lib/utils/currency'
import { marcarPago, quitarPendencias } from '@/lib/actions/pagamentos'
import type { Devedor, Pagamento, PagamentoStatus } from '@/types/database'

interface DevedoresCardProps {
  devedores: Devedor[]
  pagamentosMes: (Pagamento & { status: PagamentoStatus })[]
  mesAtual: string
}

function formatMesesCurto(meses: string[]): string {
  const currentYear = new Date().getFullYear()
  return meses
    .map(m => {
      const d = new Date(m + 'T12:00:00')
      const month = d
        .toLocaleDateString('pt-BR', { month: 'short' })
        .replace('.', '')
        .toLowerCase()
      if (d.getFullYear() !== currentYear) {
        return `${month}/${String(d.getFullYear()).slice(-2)}`
      }
      return month
    })
    .join(', ')
}

export function DevedoresCard({
  devedores,
  pagamentosMes,
}: DevedoresCardProps) {
  const { success, error } = useToast()
  const [, startTransition] = useTransition()

  const [selectedDevedor, setSelectedDevedor] = useState<Devedor | null>(null)
  const [loadingMemberId, setLoadingMemberId] = useState<string | null>(null)
  const [isSubmittingSheet, setIsSubmittingSheet] = useState(false)

  // Atrasados primeiro, depois por valor decrescente
  const sortedDevedores = [...(devedores || [])].sort((a, b) => {
    if (a.temAtraso !== b.temAtraso) {
      return a.temAtraso ? -1 : 1
    }
    return b.total - a.total
  })

  function handleRecebi(devedor: Devedor) {
    if (devedor.meses.length > 1) {
      setSelectedDevedor(devedor)
      return
    }

    // 1 mês em aberto: marca direto com 1 toque
    setLoadingMemberId(devedor.membro.id)
    startTransition(async () => {
      try {
        const mesAberto = devedor.meses[0]
        const pagamento = pagamentosMes.find(
          p => p.membro_id === devedor.membro.id && p.mes_referencia === mesAberto
        )

        let result: { error?: string; success?: boolean }
        if (pagamento) {
          result = await marcarPago(pagamento.id)
        } else {
          result = await quitarPendencias(devedor.membro.id)
        }

        if (result && 'error' in result && result.error) {
          error(result.error)
        } else {
          success(`${devedor.membro.nome} marcado como pago!`)
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erro ao registrar pagamento'
        error(msg)
      } finally {
        setLoadingMemberId(null)
      }
    })
  }

  function handleConfirmarQuitar() {
    if (!selectedDevedor) return

    setIsSubmittingSheet(true)
    const devedor = selectedDevedor

    startTransition(async () => {
      try {
        const result = await quitarPendencias(devedor.membro.id)

        if (result && 'error' in result && result.error) {
          error(result.error)
        } else {
          const quitadas = 'quitadas' in result ? result.quitadas : devedor.meses.length
          const mesesTxt = quitadas === 1 ? '1 cobrança quitada' : `${quitadas} cobranças quitadas`
          success(`${mesesTxt} de ${devedor.membro.nome}!`)
          setSelectedDevedor(null)
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erro ao quitar pendências'
        error(msg)
      } finally {
        setIsSubmittingSheet(false)
      }
    })
  }

  if (sortedDevedores.length === 0) {
    return (
      <div className="rounded-[var(--radius-app)] border border-app-line bg-app-surface p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-app-accent/15 text-2xl">
          🎉
        </div>
        <h2 className="text-base font-semibold text-app-text">Todo mundo em dia 🎉</h2>
        <p className="mt-1 text-xs text-app-muted">
          Nenhum membro com pagamento pendente no momento.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-[var(--radius-app)] border border-app-line bg-app-surface p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold tracking-tight text-app-text">
              Quem está devendo
            </h2>
            <span className="inline-flex items-center justify-center rounded-full bg-app-danger/15 px-2 py-0.5 text-xs font-semibold text-app-danger tabular-nums">
              {sortedDevedores.length}
            </span>
          </div>
        </div>

        <div className="divide-y divide-app-line">
          {sortedDevedores.map(d => {
            const isLoading = loadingMemberId === d.membro.id
            const mesesTexto = formatMesesCurto(d.meses)

            return (
              <div
                key={d.membro.id}
                className="flex items-center gap-3 py-3.5 first:pt-2 last:pb-1"
              >
                <Avatar nome={d.membro.nome} cor={d.membro.cor_avatar} size="md" />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-app-text">
                    {d.membro.nome}
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                    {d.temAtraso ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-app-danger/15 px-2 py-0.5 text-xs font-medium text-app-danger">
                        <AlertTriangle className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                        <span>Atrasado: {mesesTexto}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-app-muted">
                        Pendente: {mesesTexto}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-shrink-0 items-center gap-3">
                  <div className="text-right">
                    <span
                      className={`text-sm font-semibold tabular-nums sm:text-base ${
                        d.temAtraso ? 'text-app-danger' : 'text-app-text'
                      }`}
                    >
                      {formatCurrency(d.total)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRecebi(d)}
                    disabled={isLoading}
                    aria-label={`Registrar recebimento de ${d.membro.nome}`}
                    className="inline-flex min-h-[44px] min-w-[76px] items-center justify-center gap-1.5 rounded-full bg-app-accent px-4 py-2 text-xs font-semibold text-black transition-all duration-200 hover:bg-app-accent-hover active:scale-95 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="h-4 w-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                    ) : (
                      <span>Recebi</span>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Sheet de confirmação para múltiplos meses */}
      <Sheet
        open={selectedDevedor !== null}
        onClose={() => {
          if (!isSubmittingSheet) setSelectedDevedor(null)
        }}
        title="Confirmar recebimento"
      >
        {selectedDevedor && (
          <div className="space-y-4 pt-1">
            <p className="text-sm leading-relaxed text-app-text">
              Quitar {selectedDevedor.meses.length}{' '}
              {selectedDevedor.meses.length === 1 ? 'mês' : 'meses'} (
              {formatCurrency(selectedDevedor.total)}) de{' '}
              <span className="font-semibold text-white">
                {selectedDevedor.membro.nome}
              </span>
              ?
            </p>

            <div className="rounded-[var(--radius-app-sm)] bg-app-elevated p-3 text-xs text-app-muted">
              <span className="mb-1 block text-app-subtle">Cobranças incluídas:</span>
              <span className="font-medium text-app-text">
                {formatMesesCurto(selectedDevedor.meses)}
              </span>
            </div>

            <div className="flex flex-col-reverse items-center justify-end gap-2 pt-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setSelectedDevedor(null)}
                disabled={isSubmittingSheet}
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-app-line bg-app-elevated px-4 py-2.5 text-sm font-medium text-app-muted transition-colors hover:text-app-text disabled:opacity-50 sm:w-auto"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarQuitar}
                disabled={isSubmittingSheet}
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-app-accent px-5 py-2.5 text-sm font-semibold text-black transition-all hover:bg-app-accent-hover active:scale-95 disabled:opacity-50 sm:w-auto"
              >
                {isSubmittingSheet ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                    <span>Quitando...</span>
                  </>
                ) : (
                  <span>
                    Quitar {formatCurrency(selectedDevedor.total)}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}
      </Sheet>
    </>
  )
}
