'use client'

import { useState, useSyncExternalStore } from 'react'
import { Download, X } from 'lucide-react'
import { BrandSymbol } from '@/components/landing/BrandMark'
import {
  subscribeToInstallStore,
  getInstallSnapshot,
  getServerInstallSnapshot,
  dismissInstallPrompt,
  triggerInstall,
} from '@/lib/pwa/install-store'
import { IOSInstallSheet } from '@/components/pwa/IOSInstallSheet'

export function SmartMobileInstallBanner() {
  const browser = useSyncExternalStore(
    subscribeToInstallStore,
    getInstallSnapshot,
    getServerInstallSnapshot
  )
  const [iosSheetOpen, setIosSheetOpen] = useState(false)
  const [installing, setInstalling] = useState(false)

  // Não renderiza se não estiver pronto, se já foi dispensado, se já está instalado
  // ou se não é elegível (nem Android/Chromium canInstall nem iOS Safari)
  if (!browser.ready || browser.dismissed || browser.isStandalone || (!browser.canInstall && !browser.isIOSSafari)) {
    return null
  }

  async function handleInstallClick() {
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
      <div className="mb-4 overflow-hidden rounded-2xl border border-[#48E5B2]/20 bg-gradient-to-r from-[#04261B]/80 via-[#0a1a15]/90 to-black/80 p-3.5 shadow-lg shadow-[#48E5B2]/5 backdrop-blur-xl animate-in fade-in duration-300">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/70 shadow-inner">
              <BrandSymbol size={24} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-white">Instalar SpotiFamília</p>
              <p className="truncate text-[11px] text-white/60">Acesse em 1 toque na sua tela inicial</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={handleInstallClick}
              disabled={installing}
              className="inline-flex min-h-[34px] items-center gap-1.5 rounded-full bg-[#48E5B2] px-3.5 text-xs font-bold text-[#04261B] shadow-sm transition hover:brightness-105 active:scale-[0.97] disabled:opacity-50 cursor-pointer"
            >
              {installing ? (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#04261B] border-t-transparent" />
              ) : (
                <Download size={13} className="stroke-[2.5]" />
              )}
              <span>{browser.isIOSSafari ? 'Como instalar' : 'Instalar'}</span>
            </button>
            <button
              type="button"
              onClick={dismissInstallPrompt}
              aria-label="Dispensar convite de instalação"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/40 hover:bg-white/10 hover:text-white transition"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </div>

      <IOSInstallSheet open={iosSheetOpen} onClose={() => setIosSheetOpen(false)} />
    </>
  )
}
