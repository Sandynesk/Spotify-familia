'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Archive, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
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
  const { show, error } = useToast()
  const router = useRouter()

  function handleUndo(wasActive: boolean) {
    startTransition(async () => {
      try {
        const action = wasActive ? reativarMembro : arquivarMembro
        const result = await action(membroId)
        if (result && 'error' in result && result.error) {
          error(result.error)
          return
        }
        show({ message: wasActive ? `${nome} voltou ao plano.` : `${nome} foi arquivado novamente.`, type: 'warning' })
        router.refresh()
      } catch {
        error('Não foi possível desfazer esta ação.')
      }
    })
  }

  function handleAction() {
    startTransition(async () => {
      try {
        const action = ativo ? arquivarMembro : reativarMembro
        const result = await action(membroId)
        if (result && 'error' in result && result.error) {
          error(result.error)
          return
        }
        show({
          message: ativo ? `${nome} foi arquivado do plano.` : `${nome} foi reativado no plano.`,
          action: { label: 'Desfazer', onClick: () => handleUndo(ativo) },
        })
        setOpen(false)
        router.refresh()
      } catch {
        error('Não foi possível processar esta ação.')
      }
    })
  }

  return (
    <>
      <Button
        type="button"
        variant={ativo ? 'secondary' : 'primary'}
        className={className}
        icon={ativo ? <Archive /> : <RotateCcw />}
        aria-label={ativo ? `Arquivar ${nome}` : `Reativar ${nome}`}
        onClick={() => setOpen(true)}
      >
        {ativo ? 'Arquivar' : 'Reativar'}
      </Button>

      <Sheet
        open={open}
        onClose={() => !pending && setOpen(false)}
        title={ativo ? `Arquivar ${nome}?` : `Reativar ${nome}?`}
        description={ativo
          ? `${nome} sai do plano, mas o histórico fica. As cobranças futuras serão removidas.`
          : 'As cobranças voltam a partir deste mês.'}
      >
        <div className="mt-4 flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={() => setOpen(false)} disabled={pending}>
            Cancelar
          </Button>
          <Button type="button" variant={ativo ? 'danger' : 'primary'} className="flex-[2]" onClick={handleAction} loading={pending}>
            {ativo ? 'Confirmar arquivamento' : 'Reativar membro'}
          </Button>
        </div>
      </Sheet>
    </>
  )
}
