'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Archive, RotateCcw, Loader2 } from 'lucide-react'
import { Sheet } from '@/components/ui/Sheet'
import { useToast } from '@/components/ui/Toast'
import { arquivarMembro, reativarMembro } from '@/lib/actions/membros'

interface ArchiveButtonProps {
  membroId: string
  nome: string
  ativo: boolean
  className?: string
}

export function ArchiveButton({ membroId, nome, ativo, className = '' }: ArchiveButtonProps) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const { success, error } = useToast()
  const router = useRouter()

  function handleAction() {
    startTransition(async () => {
      try {
        const action = ativo ? arquivarMembro : reativarMembro
        const result = await action(membroId)
        if (result && 'error' in result && result.error) {
          error(result.error)
        } else {
          success(
            ativo
              ? `${nome} foi arquivado(a) do plano.`
              : `${nome} foi reativado(a) no plano!`
          )
          setOpen(false)
          router.refresh()
        }
      } catch (err: unknown) {
        error(err instanceof Error ? err.message : 'Erro ao processar solicitação')
      }
    })
  }

  const title = ativo ? `Arquivar ${nome}?` : `Reativar ${nome}?`
  const description = ativo
    ? `${nome} sai do plano, mas o histórico fica. Cobranças futuras são removidas.`
    : `As cobranças voltam a partir deste mês.`

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`min-h-[44px] px-4 rounded-full border border-app-line bg-app-elevated hover:bg-app-surface text-app-text font-medium text-sm transition-colors flex items-center justify-center gap-2 ${className}`}
        aria-label={ativo ? `Arquivar ${nome}` : `Reativar ${nome}`}
      >
        {ativo ? (
          <>
            <Archive className="w-4 h-4 text-app-subtle" />
            <span>Arquivar</span>
          </>
        ) : (
          <>
            <RotateCcw className="w-4 h-4 text-app-accent" />
            <span className="text-app-accent font-semibold">Reativar</span>
          </>
        )}
      </button>

      <Sheet
        open={open}
        onClose={() => !pending && setOpen(false)}
        title={title}
        description={description}
      >
        <div className="mt-4 space-y-4">
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
              onClick={handleAction}
              disabled={pending}
              className={`
                flex-[2] min-h-[48px] rounded-full font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2
                ${ativo
                  ? 'bg-app-elevated hover:bg-app-line text-app-text border border-app-line'
                  : 'bg-app-accent hover:bg-app-accent-hover text-black'
                }
              `}
            >
              {pending ? (
                <>
                  <Loader2 className={`w-4 h-4 animate-spin ${ativo ? 'text-app-text' : 'text-black'}`} />
                  <span>Processando...</span>
                </>
              ) : (
                <span>{ativo ? 'Confirmar arquivamento' : 'Reativar membro'}</span>
              )}
            </button>
          </div>
        </div>
      </Sheet>
    </>
  )
}
