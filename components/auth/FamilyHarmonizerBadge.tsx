'use client'

import Image from 'next/image'
import { CheckCircle2, ShieldCheck } from 'lucide-react'

const MEMBERS = [
  { initials: 'AL', name: 'Ana', avatar: '/avatars/ana.jpg', role: 'Membro' },
  { initials: 'BC', name: 'Bruno', avatar: '/avatars/bruno.jpg', role: 'Membro' },
  { initials: 'CM', name: 'Carla', avatar: '/avatars/carla.jpg', role: 'Membro' },
  { initials: 'DR', name: 'Diego', avatar: '/avatars/diego.jpg', role: 'Membro' },
  { initials: 'EA', name: 'Eduarda', avatar: '/avatars/eduarda.jpg', role: 'Membro' },
  { initials: 'FS', name: 'Felipe', avatar: '/avatars/felipe.jpg', role: 'Membro' },
]

export function FamilyHarmonizerBadge({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-app-surface/60 p-4.5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] ${className}`}
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

      {/* Real human member avatars row */}
      <div className="mt-3.5 flex items-center justify-between gap-3">
        <div className="flex -space-x-2.5 overflow-visible py-1">
          {MEMBERS.map((m, idx) => (
            <div
              key={idx}
              title={`${m.name} - Pagamento confirmado no Pix`}
              className="group relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-app-surface shadow-md transition-all duration-200 hover:scale-115 hover:z-20 cursor-pointer"
            >
              <Image
                src={m.avatar}
                alt={m.name}
                width={36}
                height={36}
                className="h-full w-full rounded-full object-cover"
                unoptimized
              />
              <span
                aria-hidden="true"
                className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-app-accent border-2 border-app-surface shadow-xs"
              />
            </div>
          ))}
        </div>

        <div className="text-right shrink-0">
          <p className="text-[11px] font-medium text-app-muted">Economia média</p>
          <p className="text-sm font-bold text-app-text">
            R$ 260<span className="text-[10px] font-normal text-app-muted">/ano</span>
          </p>
        </div>
      </div>

      <div className="mt-3.5 flex items-center gap-2 pt-2 text-[11px] text-app-subtle border-t border-white/5">
        <ShieldCheck className="h-3.5 w-3.5 text-app-accent shrink-0" />
        <span>Rateio automático via Pix • Sem mensagens chatas no WhatsApp</span>
      </div>
    </div>
  )
}
