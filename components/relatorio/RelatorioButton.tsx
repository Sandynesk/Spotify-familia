'use client'

import { useState } from 'react'
import { MessageCircle, Loader2 } from 'lucide-react'
import { getRelatorio } from '@/lib/actions/relatorio'
import { useToast } from '@/components/ui/Toast'
import { RelatorioSheet } from './RelatorioSheet'

interface RelatorioButtonProps {
  /** 'full' = botão largo (dashboard); 'icon' = só ícone (header) */
  variant?: 'full' | 'icon'
  className?: string
}

export function RelatorioButton({ variant = 'full', className = '' }: RelatorioButtonProps) {
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [texto, setTexto] = useState('')
  const toast = useToast()

  async function handleClick() {
    setLoading(true)
    try {
      const res = await getRelatorio()
      if ('error' in res) {
        toast.error(res.error)
        return
      }
      setTexto(res.texto)
      setIsOpen(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar relatório'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {variant === 'full' ? (
        <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          className={`flex w-full items-center justify-center gap-2 rounded-full bg-app-accent px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-app-accent-hover min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <MessageCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <span>Mandar cobrança no grupo</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          aria-label="Mandar cobrança no grupo"
          className={`flex h-11 w-11 items-center justify-center rounded-full text-app-muted transition-colors hover:bg-app-elevated hover:text-app-text min-h-[44px] min-w-[44px] disabled:opacity-50 ${className}`}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-app-accent" />
          ) : (
            <MessageCircle className="h-5 w-5" />
          )}
        </button>
      )}

      {isOpen && (
        <RelatorioSheet
          open={isOpen}
          onClose={() => setIsOpen(false)}
          texto={texto}
        />
      )}
    </>
  )
}
