'use client'

import { Keyboard } from 'lucide-react'
import { ListRow } from '@/components/ui/ListGroup'
import { useCommandPalette } from '@/components/command/CommandPaletteProvider'

/** Opens the same shortcut reference sheet used by the global keyboard handler. */
export function ShortcutListRow() {
  const { openShortcuts } = useCommandPalette()
  return (
    <ListRow
      title="Atalhos"
      description="Veja as combinações rápidas do computador"
      icon={<Keyboard />}
      chevron
      onClick={openShortcuts}
    />
  )
}
