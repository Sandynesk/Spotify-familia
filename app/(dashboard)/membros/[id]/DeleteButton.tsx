'use client'

import { useState, useTransition } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { Sheet } from '@/components/ui/Sheet'
import { deletarMembro } from '@/lib/actions/membros'
import { useToast } from '@/components/ui/Toast'

interface DeleteButtonProps {
  membroId: string
  nome: string
}

export default function DeleteButton({ membroId, nome }: DeleteButtonProps) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const { error } = useToast()

  function handleDelete() {
    startTransition(async () => {
      const result = await deletarMembro(membroId)
      if (result && 'error' in result && result.error) {
        error('Erro ao deletar membro')
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-w-[44px] min-h-[44px] rounded-full border border-app-danger/20 bg-app-danger/10 hover:bg-app-danger/20 text-app-danger flex items-center justify-center transition-colors"
        aria-label={`Excluir ${nome}`}
        title="Excluir membro"
      >
        <Trash2 className="w-4 h-4 text-app-danger" />
      </button>

      <Sheet
        open={open}
        onClose={() => !pending && setOpen(false)}
        title={`Excluir ${nome}?`}
        description={`Esta ação não pode ser desfeita. ${nome} e todo o seu histórico de cobranças e pagamentos serão apagados permanentemente.`}
      >
        <div className="mt-4 space-y-4">
          <div className="rounded-[var(--radius-app-sm)] border border-app-danger/20 bg-app-danger/10 p-4">
            <p className="text-xs text-app-danger leading-relaxed">
              <strong>Atenção:</strong> Se você quer apenas remover {nome} do plano mantendo os registros de meses anteriores, use a opção <strong>Arquivar</strong>.
            </p>
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
              onClick={handleDelete}
              disabled={pending}
              className="flex-[2] min-h-[48px] rounded-full bg-app-danger hover:opacity-90 text-white font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {pending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Excluindo...</span>
                </>
              ) : (
                <span>Excluir definitivamente</span>
              )}
            </button>
          </div>
        </div>
      </Sheet>
    </>
  )
}
