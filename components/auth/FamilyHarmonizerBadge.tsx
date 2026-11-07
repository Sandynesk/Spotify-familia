'use client'

import { CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react'

const MEMBERS = [
  { initials: 'AL', name: 'Ana', status: 'pago' },
  { initials: 'BC', name: 'Bruno', status: 'pago' },
  { initials: 'CM', name: 'Carla', status: 'pago' },
  { initials: 'DR', name: 'Diego', status: 'pago' },
  { initials: 'EA', name: 'Eduarda', status: 'pago' },
  { initials: 'FS', name: 'Felipe', status: 'pago' },
]

export function FamilyHarmonizerBadge({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-app-surface/60 p-4 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] ${className}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-app-accent animate-pulse" />
          <span className="text-xs font-semibold text-app-text">Plano Família em Harmonia</span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-app-accent/15 px-2.5 py-0.5 text-[11px] font-semibold text-app-accent border border-app-accent/30">
          <CheckCircle2 className="h-3 w-3" /> 6/6 em dia
        </span>
      </div>

      {/* Member avatars ring row */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex -space-x-2 overflow-hidden">
          {MEMBERS.map((m, idx) => (
            <div
              key={idx}
              title={`${m.name} - Pago`}
              className="relative inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-app-surface bg-gradient-to-tr from-app-elevated to-app-raised text-[10px] font-bold text-app-text shadow-sm"
            >
              {m.initials}
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-app-accent border border-app-surface" />
            </div>
          ))}
        </div>

        <div className="text-right">
          <p className="text-[11px] font-medium text-app-muted">Economia média</p>
          <p className="text-xs font-bold text-app-text">
            R$ 260<span className="text-[10px] text-app-muted">/ano</span>
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 pt-2 text-[11px] text-app-subtle border-t border-white/5">
        <ShieldCheck className="h-3.5 w-3.5 text-app-accent shrink-0" />
        <span>Rateio automático via Pix • Sem mensagens chatas no WhatsApp</span>
      </div>
    </div>
  )
}
