'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { gerarMensagemAgradecimento } from '@/lib/domain/whatsapp'
import type { PagamentoRecenteCobranca } from '@/lib/actions/cobrar'

interface ReciboButtonProps {
  pagamento: PagamentoRecenteCobranca
}

export function ReciboButton({ pagamento }: ReciboButtonProps) {
  const toast = useToast()
  const [carregando, setCarregando] = useState(false)

  async function copiarMensagem(texto: string) {
    try {
      await navigator.clipboard.writeText(texto)
      return true
    } catch {
      try {
        const campo = document.createElement('textarea')
        campo.value = texto
        campo.style.position = 'fixed'
        campo.style.opacity = '0'
        document.body.appendChild(campo)
        campo.select()
        const copiou = document.execCommand('copy')
        document.body.removeChild(campo)
        return copiou
      } catch {
        return false
      }
    }
  }

  async function enviarRecibo() {
    setCarregando(true)
    const mensagem = gerarMensagemAgradecimento({
      nome: pagamento.nome,
      mes: pagamento.mesReferencia,
      valor: pagamento.valor,
    })

    try {
      const resposta = await fetch(`/api/recibo/${encodeURIComponent(pagamento.id)}`)
      if (!resposta.ok) throw new Error('Não foi possível gerar o recibo')
      const blob = await resposta.blob()
      const arquivo = new File([blob], `recibo-spotifamilia-${pagamento.id}.png`, { type: 'image/png' })
      const podeCompartilhar = typeof navigator.share === 'function'
        && (!navigator.canShare || navigator.canShare({ files: [arquivo] }))

      if (podeCompartilhar) {
        try {
          await navigator.share({ files: [arquivo], text: mensagem })
          return
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') return
        }
      }

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = arquivo.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      const copiou = await copiarMensagem(mensagem)
      toast.show({ message: copiou ? 'Recibo baixado e agradecimento copiado' : 'Recibo baixado; não foi possível copiar o agradecimento', type: copiou ? 'success' : 'warning' })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível gerar o recibo')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <Button size="sm" variant="secondary" icon={<Send />} onClick={enviarRecibo} loading={carregando} aria-label={`Enviar recibo para ${pagamento.nome}`}>
      Enviar recibo
    </Button>
  )
}
