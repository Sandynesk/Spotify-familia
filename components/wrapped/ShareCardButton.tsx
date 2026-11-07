'use client'

import { useState } from 'react'
import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function ShareCardButton({ ano }: { ano: number }) {
  const [sharing, setSharing] = useState(false)
  const [message, setMessage] = useState('')

  async function shareCard() {
    setSharing(true)
    setMessage('')

    try {
      const response = await fetch(`/api/retrospectiva/card?ano=${ano}`)
      if (!response.ok) throw new Error('Não foi possível gerar seu cartão.')

      const card = await response.blob()
      const file = new File([card], `spotifamilia-${ano}.png`, { type: 'image/png' })

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Minha família em ${ano}`,
          text: 'Nossa retrospectiva do plano Família do Spotify',
        })
      } else {
        const objectUrl = URL.createObjectURL(card)
        const link = document.createElement('a')
        link.href = objectUrl
        link.download = file.name
        link.click()
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1_000)
        setMessage('Cartão baixado. Agora é só mandar no grupo!')
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setMessage(error instanceof Error ? error.message : 'Não foi possível compartilhar o cartão.')
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        type="button"
        size="lg"
        loading={sharing}
        icon={sharing ? undefined : <Share2 />}
        onClick={shareCard}
        className="min-w-[210px]"
      >
        Compartilhar
      </Button>
      <p className="min-h-4 text-xs text-app-muted" role="status" aria-live="polite">{message}</p>
    </div>
  )
}
