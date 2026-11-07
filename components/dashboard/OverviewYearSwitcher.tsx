import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface OverviewYearSwitcherProps {
  ano: number
}

export function OverviewYearSwitcher({ ano }: OverviewYearSwitcherProps) {
  const currentYear = new Date().getFullYear()

  return (
    <nav aria-label="Selecionar ano dos insights" className="flex h-11 shrink-0 items-center rounded-full border border-app-line bg-app-elevated p-1">
      <Link
        href={`/visao-geral?ano=${ano - 1}`}
        aria-label={`Ver insights de ${ano - 1}`}
        aria-disabled={ano <= 2000}
        tabIndex={ano <= 2000 ? -1 : undefined}
        className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${ano <= 2000 ? 'pointer-events-none text-app-subtle/40' : 'text-app-muted hover:bg-app-raised hover:text-app-text'}`}
      >
        <ChevronLeft aria-hidden className="h-4 w-4" />
      </Link>
      <span className="min-w-14 px-1 text-center text-sm font-semibold tabular text-app-text">
        {ano}
        {ano === currentYear && <span className="sr-only">, ano atual</span>}
      </span>
      <Link
        href={`/visao-geral?ano=${ano + 1}`}
        aria-label={`Ver insights de ${ano + 1}`}
        aria-disabled={ano >= currentYear}
        tabIndex={ano >= currentYear ? -1 : undefined}
        className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${ano >= currentYear ? 'pointer-events-none text-app-subtle/40' : 'text-app-muted hover:bg-app-raised hover:text-app-text'}`}
      >
        <ChevronRight aria-hidden className="h-4 w-4" />
      </Link>
    </nav>
  )
}
