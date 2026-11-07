'use client'

import { useSyncExternalStore } from 'react'
import { Share2, X } from 'lucide-react'
import { BrandSymbol } from '@/components/landing/BrandMark'

const STORAGE_KEY = 'spotifamilia-install-prompt-dismissed-v1'

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

type InstallSnapshot = {
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

function readStandaloneState() {
  const standaloneMedia = window.matchMedia('(display-mode: standalone)').matches
  const legacyStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true
  return standaloneMedia || legacyStandalone
}

function initializeBrowserStore() {
  if (initialized || typeof window === 'undefined') return
  initialized = true

  const userAgent = navigator.userAgent
  const platform = navigator.platform
  const isAppleMobile = /iPhone|iPad|iPod/i.test(userAgent) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isSafari = /Safari/i.test(userAgent) && !/CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo|GSA\//i.test(userAgent)
  let dismissed = false

  try {
    dismissed = window.localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    // Storage may be disabled; the prompt still works for this visit.
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
    if (event.key === STORAGE_KEY) updateSnapshot({ dismissed: event.newValue === 'true' })
  })
}

if (typeof window !== 'undefined') initializeBrowserStore()

function subscribe(listener: () => void) {
  listeners.add(listener)
  initializeBrowserStore()
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return snapshot
}

function getServerSnapshot() {
  return serverSnapshot
}

function rememberDismissal() {
  try {
    window.localStorage.setItem(STORAGE_KEY, 'true')
  } catch {
    // Keep the choice for the current visit even when storage is unavailable.
  }
  updateSnapshot({ dismissed: true })
}

async function requestInstall() {
  const event = deferredPrompt
  if (!event) return

  try {
    await event.prompt()
    const choice = await event.userChoice
    deferredPrompt = null
    updateSnapshot({ canInstall: false, isStandalone: choice.outcome === 'accepted' || snapshot.isStandalone })
  } catch {
    deferredPrompt = null
    updateSnapshot({ canInstall: false })
  }
}

export function InstallPrompt() {
  const browser = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  if (!browser.ready || browser.dismissed || browser.isStandalone || (!browser.canInstall && !browser.isIOSSafari)) {
    return null
  }

  return (
    <aside
      aria-labelledby="install-prompt-title"
      className="relative overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.055] p-4 shadow-[0_16px_50px_rgba(0,0,0,0.4)] backdrop-blur-2xl"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-16 h-36 w-36 rounded-full bg-[#48E5B2]/[0.09] blur-3xl" />
      <button
        type="button"
        onClick={rememberDismissal}
        aria-label="Fechar convite para instalar"
        className="absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full text-white/55 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#48E5B2]"
      >
        <X size={18} aria-hidden="true" />
      </button>

      <div className="relative flex items-start gap-3 pr-9">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border border-white/10 bg-black/70">
          <BrandSymbol size={27} />
        </span>
        <div className="min-w-0 pt-0.5">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/45">Seu plano, sempre à mão</p>
          <h2 id="install-prompt-title" className="mt-1 text-[17px] font-semibold leading-tight tracking-[-0.02em] text-white">
            Instale o SpotiFamília
          </h2>
        </div>
      </div>

      {browser.isIOSSafari ? (
        <div className="relative mt-3 pl-14">
          <p id="install-ios-instructions" tabIndex={-1} className="text-sm leading-5 text-white/65">
            Toque em Compartilhar → Adicionar à Tela de Início.
          </p>
          <a
            href="#install-ios-instructions"
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#48E5B2]"
          >
            <Share2 size={16} aria-hidden="true" />
            Como instalar
          </a>
        </div>
      ) : (
        <div className="relative mt-3 pl-14">
          <p className="text-sm leading-5 text-white/60">Acesse cobranças e pagamentos direto da tela inicial.</p>
          <button
            type="button"
            onClick={() => void requestInstall()}
            className="mt-3 inline-flex min-h-11 items-center justify-center rounded-full bg-[#48E5B2] px-5 text-sm font-semibold text-[#04261B] transition hover:brightness-105 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#48E5B2]"
          >
            Instalar
          </button>
        </div>
      )}
    </aside>
  )
}
