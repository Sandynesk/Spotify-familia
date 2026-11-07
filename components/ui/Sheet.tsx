'use client'

import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'
import { IconButton } from '@/components/ui/IconButton'

export interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

/** Native modal sheet: bottom aligned on phones and centered on larger screens. */
export function Sheet({ open, onClose, title, description, children, className = '' }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className={`app-sheet fixed inset-x-0 bottom-0 mb-0 mt-auto max-h-[min(90dvh,760px)] w-full max-w-none overflow-y-auto scrollbar-none rounded-t-[28px] border p-0 text-app-text sm:inset-0 sm:m-auto sm:max-w-lg sm:rounded-app ${className}`}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pt-5">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-app-line-strong sm:hidden" aria-hidden="true" />
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold tracking-[-0.02em]">{title}</h2>
            {description && <p id={descriptionId} className="mt-1 text-sm text-app-muted">{description}</p>}
          </div>
          <IconButton aria-label="Fechar" icon={<X />} variant="ghost" size="sm" onClick={onClose} />
        </div>
        {children}
      </div>
    </dialog>
  )
}
