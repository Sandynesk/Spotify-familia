'use client'

import { useState, useSyncExternalStore } from 'react'
import { Share2, X } from 'lucide-react'
import { BrandSymbol } from '@/components/landing/BrandMark'
import {
  subscribeToInstallStore,
  getInstallSnapshot,
  getServerInstallSnapshot,
  dismissInstallPrompt,
  triggerInstall,
} from '@/lib/pwa/install-store'
import { IOSInstallSheet } from '@/components/pwa/IOSInstallSheet'

export function InstallPrompt() {
  const browser = useSyncExternalStore(
    subscribeToInstallStore,
    getInstallSnapshot,
    getServerInstallSnapshot
  )
  const [iosSheetOpen, setIosSheetOpen] = useState(false)
  const [installing, setInstalling] = useState(false)

  if (!browser.ready || browser.dismissed || browser.isStandalone || (!browser.canInstall && !browser.isIOSSafari)) {
    return null
  }

  async function handleInstall() {
    if (browser.isIOSSafari) {
      setIosSheetOpen(true)
      return
    }

    setInstalling(true)
    try {
      await triggerInstall()
    } finally {
      setInstalling(false)
    }
  }

  return (
    <>
      <aside
        aria-labelledby="install-prompt-title"
        className="relative overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.055] p-4 shadow-[0_16px_50px_rgba(0,0,0,0.4)] backdrop-blur-2xl"
      >
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-16 h-36 w-36 rounded-full bg-[#48E5B2]/[0.09] blur-3xl" />
        <button
          type="button"
          onClick={dismissInstallPrompt}
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
            <p className="text-sm leading-5 text-white/65">
              Toque em Compartilhar → Adicionar à Tela de Início.
            </p>
            <button
              type="button"
              onClick={() => setIosSheetOpen(true)}
              className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#48E5B2]"
            >
              <Share2 size={16} aria-hidden="true" />
              Como instalar
            </button>
          </div>
        ) : (
          <div className="relative mt-3 pl-14">
            <p className="text-sm leading-5 text-white/60">Acesse cobranças e pagamentos direto da tela inicial.</p>
            <button
              type="button"
              onClick={handleInstall}
              disabled={installing}
              className="mt-3 inline-flex min-h-11 items-center justify-center rounded-full bg-[#48E5B2] px-5 text-sm font-semibold text-[#04261B] transition hover:brightness-105 active:scale-[0.98] disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#48E5B2]"
            >
              {installing ? 'Instalando…' : 'Instalar'}
            </button>
          </div>
        )}
      </aside>

      <IOSInstallSheet open={iosSheetOpen} onClose={() => setIosSheetOpen(false)} />
    </>
  )
}
