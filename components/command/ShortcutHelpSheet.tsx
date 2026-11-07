'use client'

import { Sheet } from '@/components/ui/Sheet'
import { Kbd } from '@/components/ui/Kbd'

interface ShortcutHelpSheetProps {
  open: boolean
  onClose: () => void
}

const shortcuts = [
  { keys: ['⌘', 'K'], alternate: ['Ctrl', 'K'], label: 'Abrir a busca' },
  { keys: ['G', 'H'], label: 'Ir para Hoje' },
  { keys: ['G', 'M'], label: 'Ir para Membros' },
  { keys: ['G', 'C'], label: 'Ir para Cobrar' },
  { keys: ['G', 'I'], label: 'Ir para Insights' },
  { keys: ['G', 'A'], label: 'Ir para Agenda' },
  { keys: ['N'], label: 'Adicionar membro' },
  { keys: ['?'], label: 'Mostrar estes atalhos' },
]

/** Reference sheet shared by the palette shortcut and the Mais hub. */
export function ShortcutHelpSheet({ open, onClose }: ShortcutHelpSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title="Atalhos" description="Ações rápidas para usar no computador.">
      <ul className="divide-y divide-app-line">
        {shortcuts.map(({ keys, alternate, label }) => (
          <li key={label} className="flex min-h-12 items-center justify-between gap-4 py-3">
            <span className="text-sm text-app-text">{label}</span>
            <span className="flex shrink-0 items-center gap-1.5">
              {keys.map((key) => <Kbd key={`${label}-${key}`}>{key}</Kbd>)}
              {alternate && (
                <>
                  <span className="px-1 text-xs text-app-subtle">ou</span>
                  {alternate.map((key) => <Kbd key={`${label}-${key}`}>{key}</Kbd>)}
                </>
              )}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-app-subtle">As combinações com G são sequenciais: pressione G e depois a letra da tela.</p>
    </Sheet>
  )
}
