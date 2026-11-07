'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { desfazerPagamento, marcarPago } from '@/lib/actions/pagamentos'

export function MarcarMesPagoButton({ pagamentoId, mesReferencia, nome }: {
  pagamentoId: string
  mesReferencia: string
  nome: string
}) {
  const [pending, startTransition] = useTransition()
  const { show, error } = useToast()
  const router = useRouter()

  function handleUndo() {
    startTransition(async () => {
      const result = await desfazerPagamento(pagamentoId, mesReferencia)
      if ('error' in result) {
        error('Não foi possível desfazer o pagamento.')
        return
      }
      show({ message: 'Pagamento desfeito.', type: 'warning' })
      router.refresh()
    })
  }

  function handleMarkPaid() {
    startTransition(async () => {
      const result = await marcarPago(pagamentoId)
      if ('error' in result) {
        error('Não foi possível confirmar o pagamento.')
        return
      }
      show({
        message: `${nome} está em dia neste mês.`,
        action: { label: 'Desfazer', onClick: handleUndo },
      })
      router.refresh()
    })
  }

  return (
    <Button type="button" variant="secondary" loading={pending} onClick={handleMarkPaid} icon={<CheckCircle2 />}>
      Marcar mês atual como pago
    </Button>
  )
}
