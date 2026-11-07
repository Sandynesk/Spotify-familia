'use client'

export const PWA_STORAGE_KEY = 'spotifamilia-install-prompt-dismissed-v2'

export type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export type InstallSnapshot = {
  ready: boolean
  isIOSSafari: boolean
  isStandalone: boolean
  canInstall: boolean
  dismissed: boolean
}

const serverSnapshot: InstallSnapshot = {
  ready: false,
  isIOSSafari: false,
  isStandalone: false,
  canInstall: false,
  dismissed: false,
}

let snapshot = serverSnapshot
let deferredPrompt: InstallPromptEvent | null = null
let initialized = false
const listeners = new Set<() => void>()

function notify() {
  for (const listener of listeners) listener()
}

function updateSnapshot(patch: Partial<InstallSnapshot>) {
  snapshot = { ...snapshot, ...patch }
  notify()
}

export function readStandaloneState(): boolean {
  if (typeof window === 'undefined') return false
  const standaloneMedia = window.matchMedia('(display-mode: standalone)').matches
  const legacyStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true
  return standaloneMedia || legacyStandalone
}

export function initializeBrowserStore() {
  if (initialized || typeof window === 'undefined') return
  initialized = true

  const userAgent = navigator.userAgent
  const platform = navigator.platform
  const isAppleMobile = /iPhone|iPad|iPod/i.test(userAgent) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isSafari = /Safari/i.test(userAgent) && !/CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo|GSA\//i.test(userAgent)
  let dismissed = false

  try {
    dismissed = window.localStorage.getItem(PWA_STORAGE_KEY) === 'true'
  } catch {
    // Storage may be disabled
  }

  snapshot = {
    ready: true,
    isIOSSafari: isAppleMobile && isSafari,
    isStandalone: readStandaloneState(),
    canInstall: deferredPrompt !== null,
    dismissed,
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredPrompt = event as InstallPromptEvent
    updateSnapshot({ ready: true, canInstall: true })
  })

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    updateSnapshot({ canInstall: false, isStandalone: true })
  })

  window.addEventListener('pageshow', () => {
    updateSnapshot({ isStandalone: readStandaloneState() })
  })

  window.matchMedia('(display-mode: standalone)').addEventListener('change', (event) => {
    updateSnapshot({ isStandalone: event.matches })
  })

  window.addEventListener('storage', (event) => {
    if (event.key === PWA_STORAGE_KEY) updateSnapshot({ dismissed: event.newValue === 'true' })
  })
}

if (typeof window !== 'undefined') {
  initializeBrowserStore()
}

export function subscribeToInstallStore(listener: () => void) {
  listeners.add(listener)
  initializeBrowserStore()
  return () => {
    listeners.delete(listener)
  }
}

export function getInstallSnapshot() {
  return snapshot
}

export function getServerInstallSnapshot() {
  return serverSnapshot
}

export function dismissInstallPrompt() {
  try {
    window.localStorage.setItem(PWA_STORAGE_KEY, 'true')
  } catch {
    // Storage may be disabled
  }
  updateSnapshot({ dismissed: true })
}

export function resetDismissal() {
  try {
    window.localStorage.removeItem(PWA_STORAGE_KEY)
  } catch {
    // Storage may be disabled
  }
  updateSnapshot({ dismissed: false })
}

export async function triggerInstall(): Promise<boolean> {
  const event = deferredPrompt
  if (!event) return false

  try {
    await event.prompt()
    const choice = await event.userChoice
    deferredPrompt = null
    const accepted = choice.outcome === 'accepted'
    updateSnapshot({
      canInstall: false,
      isStandalone: accepted || snapshot.isStandalone,
    })
    return accepted
  } catch {
    deferredPrompt = null
    updateSnapshot({ canInstall: false })
    return false
  }
}
