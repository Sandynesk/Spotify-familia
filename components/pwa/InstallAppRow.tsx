'use client'

import { useState, useSyncExternalStore } from 'react'
import { CheckCircle2, Download, Smartphone } from 'lucide-react'
import {
  subscribeToInstallStore,
  getInstallSnapshot,
  getServerInstallSnapshot,
  triggerInstall,
} from '@/lib/pwa/install-store'
import { IOSInstallSheet } from '@/components/pwa/IOSInstallSheet'

export function InstallAppRow() {
  const browser = useSyncExternalStore(
    subscribeToInstallStore,
    getInstallSnapshot,
    getServerInstallSnapshot
  )
  const [iosSheetOpen, setIosSheetOpen] = useState(false)
  const [installing, setInstalling] = useState(false)

  if (!browser.ready) return null

  if (browser.isStandalone) {
    return (
      <div className="flex min-w-0 items-center justify-between gap-3 p-3.5 rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#48E5B2]/20 text-[#48E5B2]">
            <CheckCircle2 size={18} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">Aplicativo Instalado</p>
            <p className="text-xs text-white/50 truncate">Você já está usando o SpotiFamília como app</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-[#48E5B2]/30 bg-[#48E5B2]/10 px-2.5 py-1 text-[11px] font-semibold text-[#48E5B2]">
          Ativo
        </span>
      </div>
    )
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
      <div className="flex min-w-0 items-center justify-between gap-3 p-3.5 rounded-2xl border border-[#48E5B2]/20 bg-[#48E5B2]/[0.04]">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#48E5B2]/20 text-[#48E5B2]">
            <Smartphone size={18} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">Instalar no Celular</p>
            <p className="text-xs text-white/60 truncate">Abra direto da sua tela inicial sem navegador</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleInstall}
          disabled={installing}
          className="inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-full bg-[#48E5B2] px-4 text-xs font-bold text-[#04261B] shadow-sm transition hover:brightness-105 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          {installing ? (
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#04261B] border-t-transparent" />
          ) : (
            <Download size={13} className="stroke-[2.5]" />
          )}
          <span>{browser.isIOSSafari ? 'Como instalar' : 'Instalar agora'}</span>
        </button>
      </div>

      <IOSInstallSheet open={iosSheetOpen} onClose={() => setIosSheetOpen(false)} />
    </>
  )
}
