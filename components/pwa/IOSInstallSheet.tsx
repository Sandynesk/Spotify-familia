'use client'

import { X, Share, PlusSquare, Smartphone } from 'lucide-react'
import { BrandSymbol } from '@/components/landing/BrandMark'

interface IOSInstallSheetProps {
  open: boolean
  onClose: () => void
}

export function IOSInstallSheet({ open, onClose }: IOSInstallSheetProps) {
  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ios-install-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 backdrop-blur-md transition-opacity duration-200 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-t-[28px] border-t border-white/15 bg-gradient-to-b from-[#18181b] to-[#09090b] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-white shadow-2xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border border-white/15 bg-black/80 shadow-md">
              <BrandSymbol size={30} />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#48E5B2]">
                App SpotiFamília
              </p>
              <h3 id="ios-install-title" className="text-lg font-bold text-white">
                Instalar no iPhone / iPad
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 space-y-3.5">
          <div className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
              <Share size={18} />
            </span>
            <div className="text-xs leading-relaxed text-white/80">
              <span className="font-semibold text-white">Passo 1:</span> Na barra inferior do Safari, toque no botão de{' '}
              <strong className="text-white">Compartilhar</strong> (ícone com seta para cima).
            </div>
          </div>

          <div className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#48E5B2]/20 text-[#48E5B2]">
              <PlusSquare size={18} />
            </span>
            <div className="text-xs leading-relaxed text-white/80">
              <span className="font-semibold text-white">Passo 2:</span> Role as opções para baixo e selecione{' '}
              <strong className="text-white">"Adicionar à Tela de Início"</strong>.
            </div>
          </div>

          <div className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Smartphone size={18} />
            </span>
            <div className="text-xs leading-relaxed text-white/80">
              <span className="font-semibold text-white">Passo 3:</span> Toque em{' '}
              <strong className="text-white">"Adicionar"</strong> no canto superior direito. O ícone aparecerá imediatamente na sua tela inicial!
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 flex min-h-[48px] w-full items-center justify-center rounded-full bg-[#48E5B2] px-6 text-sm font-semibold text-[#04261B] shadow-lg shadow-[#48E5B2]/20 transition active:scale-[0.98]"
        >
          Entendi, vou instalar
        </button>
      </div>
    </div>
  )
}
