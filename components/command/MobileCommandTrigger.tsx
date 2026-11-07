'use client'

import { Search } from 'lucide-react'
import { IconButton } from '@/components/ui/IconButton'
import { useCommandPalette } from '@/components/command/CommandPaletteProvider'

/** Compact glass search control, reserved for the mobile page header area. */
export function MobileCommandTrigger() {
  const { openPalette } = useCommandPalette()
  return (
    <IconButton
      aria-label="Buscar telas, membros e ações"
      title="Buscar"
      icon={<Search />}
      variant="glass"
      size="md"
      data-command-trigger
      onClick={openPalette}
      className="shadow-app-float"
    />
  )
}
