'use client'

import { Sheet } from '@/components/ui/Sheet'
import { useToast } from '@/components/ui/Toast'
import { MessageCircle, Copy } from 'lucide-react'

interface RelatorioSheetProps {
  open: boolean
  onClose: () => void
  texto: string
}

export function RelatorioSheet({ open, onClose, texto }: RelatorioSheetProps) {
  const toast = useToast()

  async function handleShareWhatsApp() {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ text: texto })
        return
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }
      }
    }
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  async function handleCopy() {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(texto)
        toast.success('Copiado!')
        return
      }
      throw new Error('Clipboard indisponível')
    } catch {
      try {
        const textarea = document.createElement('textarea')
        textarea.value = texto
        textarea.style.position = 'fixed'
        textarea.style.left = '-9999px'
        textarea.style.top = '0'
        textarea.setAttribute('readonly', '')
        // Com o <dialog> modal aberto, o resto da página fica inerte: o campo precisa ficar dentro dele
        const container = document.querySelector('dialog[open]') ?? document.body
        container.appendChild(textarea)
        textarea.focus()
        textarea.select()
        const successful = document.execCommand('copy')
        container.removeChild(textarea)
        if (successful) {
          toast.success('Copiado!')
          return
        }
      } catch {
        // Fallback falhou
      }
      toast.error('Não foi possível copiar o texto')
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Cobrança do grupo">
      <div className="space-y-4">
        {/* Caixa de pré-visualização */}
        <div className="max-h-[50vh] overflow-y-auto rounded-[var(--radius-app-sm)] border border-app-line bg-app-elevated p-3.5 text-sm font-normal text-app-text whitespace-pre-wrap leading-relaxed select-text">
          {texto}
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex-1 flex items-center justify-center gap-2 rounded-full bg-app-accent px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-app-accent-hover min-h-[44px]"
          >
            <MessageCircle className="w-5 h-5 flex-shrink-0" />
            <span>Enviar no WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 rounded-full border border-app-line bg-app-elevated px-5 py-3 text-sm font-medium text-app-text transition-colors hover:bg-white/10 min-h-[44px]"
          >
            <Copy className="w-4 h-4 flex-shrink-0" />
            <span>Copiar texto</span>
          </button>
        </div>
      </div>
    </Sheet>
  )
}
