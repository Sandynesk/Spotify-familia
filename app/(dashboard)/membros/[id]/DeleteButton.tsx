'use client'

import { useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { deletarMembro } from '@/lib/actions/membros'
import { useToast } from '@/components/ui/Toast'

interface DeleteButtonProps {
  membroId: string
  nome: string
}

export default function DeleteButton({ membroId, nome }: DeleteButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [pending, startTransition] = useTransition()
  const { error } = useToast()

  function handleDelete() {
    startTransition(async () => {
      const result = await deletarMembro(membroId)
      if (result?.error) error('Erro ao deletar membro')
    })
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="w-9 h-9 bg-[#282828] hover:bg-[rgba(226,33,52,0.15)] rounded-full flex items-center justify-center transition-colors"
        aria-label="Deletar membro"
      >
        <Trash2 className="w-4 h-4 text-[#E22134]" />
      </button>

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowConfirm(false)}
          />
          <div className="relative bg-[#181818] rounded-xl p-6 w-full max-w-sm shadow-2xl z-10">
            <div className="w-12 h-12 bg-[rgba(226,33,52,0.1)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-[#E22134]" />
            </div>
            <h3 className="text-white font-bold text-lg text-center mb-2">
              Remover membro?
            </h3>
            <p className="text-[#B3B3B3] text-sm text-center mb-6 leading-relaxed">
              <span className="text-white">{nome}</span> e todo o histórico de pagamentos serão removidos permanentemente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={pending}
                className="flex-1 py-2.5 bg-[#282828] hover:bg-[#3E3E3E] text-white text-sm font-medium rounded-full transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={pending}
                className="flex-1 py-2.5 bg-[#E22134] hover:bg-[#c51e2b] text-white text-sm font-bold rounded-full transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {pending
                  ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : 'Remover'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
