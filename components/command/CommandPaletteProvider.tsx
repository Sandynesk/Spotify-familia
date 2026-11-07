'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { CommandPalette } from '@/components/command/CommandPalette'
import { ShortcutHelpSheet } from '@/components/command/ShortcutHelpSheet'

interface CommandPaletteContextValue {
  openPalette: () => void
  openShortcuts: () => void
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null)

const sequenceRoutes: Record<string, string> = {
  h: '/dashboard',
  m: '/membros',
  c: '/cobrar',
  i: '/visao-geral',
  a: '/agenda',
}

export function useCommandPalette() {
  const value = useContext(CommandPaletteContext)
  if (!value) throw new Error('useCommandPalette deve ser usado dentro de CommandPaletteProvider')
  return value
}

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const sequenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const waitingForSequence = useRef(false)

  const openPalette = useCallback(() => setPaletteOpen(true), [])
  const openShortcuts = useCallback(() => setShortcutsOpen(true), [])
  const closeShortcuts = useCallback(() => setShortcutsOpen(false), [])

  useEffect(() => {
    function clearSequence() {
      waitingForSequence.current = false
      if (sequenceTimer.current) clearTimeout(sequenceTimer.current)
      sequenceTimer.current = null
    }

    function onKeyDown(event: KeyboardEvent) {
      const key = event.key.toLowerCase()
      const commandKey = (event.metaKey || event.ctrlKey) && key === 'k'

      if (commandKey) {
        event.preventDefault()
        setPaletteOpen((current) => !current)
        return
      }

      if (isTypingTarget(event.target)) {
        clearSequence()
        return
      }

      if (paletteOpen || shortcutsOpen || !window.matchMedia('(min-width: 1024px)').matches) {
        clearSequence()
        return
      }

      if (waitingForSequence.current) {
        clearSequence()
        const destination = sequenceRoutes[key]
        if (destination) {
          event.preventDefault()
          router.push(destination)
          return
        }
      }

      if (key === 'g') {
        event.preventDefault()
        waitingForSequence.current = true
        sequenceTimer.current = setTimeout(clearSequence, 900)
        return
      }

      if (key === 'n') {
        event.preventDefault()
        router.push('/membros/novo')
        return
      }

      if (event.key === '?') {
        event.preventDefault()
        setShortcutsOpen(true)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      waitingForSequence.current = false
      if (sequenceTimer.current) clearTimeout(sequenceTimer.current)
      sequenceTimer.current = null
    }
  }, [paletteOpen, router, shortcutsOpen])

  const contextValue = useMemo(() => ({ openPalette, openShortcuts }), [openPalette, openShortcuts])

  return (
    <CommandPaletteContext.Provider value={contextValue}>
      {children}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <ShortcutHelpSheet open={shortcutsOpen} onClose={closeShortcuts} />
    </CommandPaletteContext.Provider>
  )
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}
