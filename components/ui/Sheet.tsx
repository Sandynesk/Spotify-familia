'use client'

import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'

interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
}

/**
 * Diálogo modal das telas internas: folha que sobe da base no celular e janela
 * centralizada no desktop. Usa <dialog> nativo (foco preso, Esc fecha, acessível).
 */
export function Sheet({ open, onClose, title, description, children }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="app-sheet font-app m-0 mt-auto max-h-[90dvh] w-full max-w-none overflow-y-auto rounded-t-[var(--radius-app)] border border-app-line bg-app-surface p-0 text-app-text sm:m-auto sm:max-w-md sm:rounded-[var(--radius-app)]"
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onClose={onClose}
      onClick={e => {
        // clique no backdrop (fora do conteúdo) fecha
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-app-line sm:hidden" aria-hidden />
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold tracking-tight">{title}</h2>
            {description && (
              <p id={descId} className="mt-1 text-sm text-app-muted">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-app-muted transition-colors hover:bg-app-elevated hover:text-app-text"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
