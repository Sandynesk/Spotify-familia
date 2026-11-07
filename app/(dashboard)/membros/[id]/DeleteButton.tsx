'use client'

import { useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Sheet } from '@/components/ui/Sheet'
import { useToast } from '@/components/ui/Toast'
import { deletarMembro } from '@/lib/actions/membros'

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
      try {
        const result = await deletarMembro(membroId)
        if (result && 'error' in result && result.error) error(result.error)
      } catch {
        error('Não foi possível excluir o membro.')
      }
    })
  }

  return (
    <>
      <Button
        type="button"
        variant="danger"
        icon={<Trash2 />}
        aria-label={`Excluir ${nome}`}
        onClick={() => setOpen(true)}
      >
        Excluir
      </Button>

      <Sheet
        open={open}
        onClose={() => !pending && setOpen(false)}
        title={`Excluir ${nome}?`}
        description={`Esta ação é permanente. ${nome} e o histórico de cobranças serão apagados.`}
      >
        <div className="mt-4 space-y-4">
          <Card padding="sm" className="border-app-danger/20 bg-app-danger/10">
            <p className="text-sm leading-relaxed text-app-danger">
              Se quiser apenas remover {nome} do plano e preservar os registros, escolha <strong>Arquivar</strong>.
            </p>
          </Card>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setOpen(false)} disabled={pending}>
              Cancelar
            </Button>
            <Button type="button" variant="danger" className="flex-[2]" onClick={handleDelete} loading={pending}>
              Excluir definitivamente
            </Button>
          </div>
        </div>
      </Sheet>
    </>
  )
}
