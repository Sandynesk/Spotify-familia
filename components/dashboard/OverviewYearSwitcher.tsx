import Link from 'next/link'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

interface OverviewYearSwitcherProps {
  ano: number
}

export function OverviewYearSwitcher({ ano }: OverviewYearSwitcherProps) {
  const currentYear = new Date().getFullYear()
  const isNextDisabled = ano >= currentYear
  const isPrevDisabled = ano <= 2000
  const isCurrentYear = ano === currentYear

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-app-sm)] bg-app-elevated text-app-accent">
          <Calendar className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-app-text">
            Calendário do Ano
          </h2>
          <p className="text-xs text-app-muted">
            Controle mensal de pagamentos por membro
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-2 bg-app-surface border border-app-line rounded-[var(--radius-app)] p-1.5">
        {isPrevDisabled ? (
          <button
            type="button"
            disabled
            aria-disabled="true"
            aria-label="Ano anterior desabilitado"
            className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-app-sm)] text-app-subtle/30 cursor-not-allowed select-none"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : (
          <Link
            href={`/visao-geral?ano=${ano - 1}`}
            aria-label={`Ver ano anterior (${ano - 1})`}
            className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-app-sm)] text-app-text transition-colors hover:bg-app-elevated active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
        )}

        <div className="flex items-center gap-2 px-3">
          <span className="text-xl font-bold tracking-tight text-app-text tabular-nums">
            {ano}
          </span>
          {isCurrentYear && (
            <span className="rounded-full bg-app-accent/15 px-2 py-0.5 text-[11px] font-semibold text-app-accent">
              Atual
            </span>
          )}
        </div>

        {isNextDisabled ? (
          <button
            type="button"
            disabled
            aria-disabled="true"
            aria-label="Próximo ano desabilitado (ano atual)"
            className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-app-sm)] text-app-subtle/30 cursor-not-allowed select-none"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        ) : (
          <Link
            href={`/visao-geral?ano=${ano + 1}`}
            aria-label={`Ver próximo ano (${ano + 1})`}
            className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-app-sm)] text-app-text transition-colors hover:bg-app-elevated active:scale-95"
          >
            <ChevronRight className="h-5 w-5" />
          </Link>
        )}
      </div>
    </div>
  )
}
