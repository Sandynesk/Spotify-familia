'use client'

import { useState } from 'react'
import { Check, Copy, Share2 } from 'lucide-react'
import { Card, Button, SectionHeader } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { linkWhatsApp } from '@/lib/domain/whatsapp'

interface RelatorioGrupoCardProps {
  texto: string
  erro?: string
}

export function RelatorioGrupoCard({ texto, erro }: RelatorioGrupoCardProps) {
  const toast = useToast()
  const [copiando, setCopiando] = useState(false)

  async function copiarTexto() {
    if (!texto) return
    setCopiando(true)
    try {
      await navigator.clipboard.writeText(texto)
      toast.success('Copiado')
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
        if (!copiou) throw new Error('Clipboard indisponível')
        toast.success('Copiado')
      } catch {
        toast.error('Não foi possível copiar o texto')
      }
    } finally {
      setCopiando(false)
    }
  }

  async function compartilhar() {
    if (!texto) return
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ text: texto })
        return
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return
      }
    }
    window.open(linkWhatsApp(null, texto), '_blank', 'noopener,noreferrer')
  }

  return (
    <Card className="space-y-4">
      <SectionHeader title="Mensagem para o grupo" />
      {erro ? (
        <p className="rounded-app-sm border border-app-line bg-app-elevated p-3 text-sm text-app-muted">{erro}</p>
      ) : (
        <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap break-words rounded-app-sm border border-app-line bg-app-elevated p-3.5 font-app text-sm leading-relaxed text-app-text">{texto}</pre>
      )}
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" icon={copiando ? <Check /> : <Copy />} onClick={copiarTexto} disabled={!texto} loading={copiando}>
          Copiar
        </Button>
        <Button variant="secondary" icon={<Share2 />} onClick={compartilhar} disabled={!texto}>
          Compartilhar
        </Button>
      </div>
    </Card>
  )
}
