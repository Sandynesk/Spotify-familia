import { CircleCheck, Heart, Target, TrendingUp, Zap } from 'lucide-react'
import type { Selo } from '@/types/domain'

const sealIcons = {
  CircleCheck,
  Heart,
  Target,
  TrendingUp,
  Zap,
}

export function MemberSeals({ selos, compact = false }: { selos: Selo[]; compact?: boolean }) {
  if (selos.length === 0) {
    return compact ? null : <p className="text-sm text-app-muted">Os primeiros selos chegam com o seu histórico.</p>
  }

  return (
    <ul className="flex flex-wrap gap-2" aria-label="Selos de pontualidade">
      {selos.map((selo) => {
        const Icon = sealIcons[selo.icone as keyof typeof sealIcons] ?? CircleCheck

        return (
          <li key={selo.id}>
            <span
              title={selo.descricao}
              aria-label={`${selo.titulo}: ${selo.descricao}`}
              className={compact
                ? 'inline-flex h-8 w-8 items-center justify-center rounded-full border border-app-line bg-app-elevated text-app-accent'
                : 'inline-flex min-h-9 items-center gap-2 rounded-full border border-app-line bg-app-elevated px-3 text-xs font-medium text-app-text'}
            >
              <Icon aria-hidden className="h-4 w-4 shrink-0" />
              {!compact && <span>{selo.titulo}</span>}
              {compact && <span className="sr-only">{selo.titulo}</span>}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
