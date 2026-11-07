'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Sheet } from '@/components/ui/Sheet'
import { useToast } from '@/components/ui/Toast'
import { haptic } from '@/components/ui/haptics'
import { quitarPendencias } from '@/lib/actions/pagamentos'
import { formatCurrency } from '@/lib/utils/currency'
import { formatShortMonthYear } from '@/lib/utils/date'
import type { Devedor } from '@/types/database'

export function AtrasosCard({ devedores }: { devedores: Devedor[] }) {
  const router = useRouter()
  const toast = useToast()
  const [selected, setSelected] = useState<Devedor | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [completedIds, setCompletedIds] = useState<string[]>([])
  const atrasados = devedores.filter((devedor) => devedor.temAtraso && !completedIds.includes(devedor.membro.id))

  async function confirmQuit() {
    if (!selected || submitting) return
    const devedor = selected
    setSubmitting(true)
    haptic('light')

    try {
      const result = await quitarPendencias(devedor.membro.id)
      if ('error' in result && result.error) throw new Error(result.error)

      const months = 'quitadas' in result ? result.quitadas : devedor.meses.length
      toast.show({
        message: `${months} ${months === 1 ? 'cobrança quitada' : 'cobranças quitadas'} de ${devedor.membro.nome}`,
        type: 'success',
      })
      setCompletedIds((current) => [...current, devedor.membro.id])
      setSelected(null)
      router.refresh()
    } catch (caught) {
      toast.show({
        message: caught instanceof Error ? caught.message : 'Não foi possível quitar as pendências.',
        type: 'error',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Card padding="md">
        <SectionHeader
          title="Em atraso"
          description="Meses anteriores em aberto"
          actionLabel="Cobrar todos"
          href="/cobrar"
        />

        {atrasados.length === 0 ? (
          <div className="flex items-center gap-3 rounded-app-sm border border-app-line bg-app-elevated/60 px-3.5 py-3">
            <CheckCircle2 aria-hidden className="h-5 w-5 shrink-0 text-app-accent" />
            <p className="text-sm text-app-muted">Sem pendências de meses anteriores.</p>
          </div>
        ) : (
          <div className="divide-y divide-app-line">
            {atrasados.map((devedor) => (
              <article key={devedor.membro.id} className="py-4 first:pt-1 last:pb-0">
                <div className="flex items-start gap-3">
                  <Avatar nome={devedor.membro.nome} cor={devedor.membro.cor_avatar} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-app-text">{devedor.membro.nome}</h3>
                        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-app-muted">
                          {devedor.meses.map(formatShortMonthYear).join(' · ')}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold tabular text-app-danger">
                        {formatCurrency(devedor.total)}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Link
                        href={`/cobrar?membro=${encodeURIComponent(devedor.membro.id)}`}
                        className="inline-flex min-h-11 items-center justify-center rounded-full border border-app-line-strong bg-app-elevated px-3 text-sm font-medium text-app-text transition-colors hover:bg-app-raised"
                      >
                        Cobrar
                      </Link>
                      <Button
                        size="md"
                        onClick={() => setSelected(devedor)}
                        icon={<CheckCircle2 />}
                      >
                        Quitar
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>

      <Sheet
        open={selected !== null}
        onClose={() => {
          if (!submitting) setSelected(null)
        }}
        title="Quitar meses em aberto?"
        description="Confirme o valor antes de registrar o recebimento."
      >
        {selected && (
          <div className="space-y-4">
            <div className="rounded-app-sm border border-app-line bg-app-elevated p-4">
              <div className="flex items-center gap-3">
                <Avatar nome={selected.membro.nome} cor={selected.membro.cor_avatar} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-app-text">{selected.membro.nome}</p>
                  <p className="text-xs text-app-muted">{selected.meses.length} meses em aberto</p>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular text-app-text">{formatCurrency(selected.total)}</p>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-app-muted">
                {selected.meses.map(formatShortMonthYear).join(' · ')}
              </p>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="secondary"
                disabled={submitting}
                onClick={() => setSelected(null)}
              >
                Voltar
              </Button>
              <Button
                loading={submitting}
                onClick={confirmQuit}
                icon={submitting ? undefined : <AlertTriangle />}
              >
                {submitting ? 'Registrando' : `Quitar ${formatCurrency(selected.total)}`}
              </Button>
            </div>
          </div>
        )}
      </Sheet>
    </>
  )
}
