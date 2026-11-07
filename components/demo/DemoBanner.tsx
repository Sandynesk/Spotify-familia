import Link from 'next/link'
import { isDemo } from '@/lib/demo/session'

export async function DemoBanner() {
  if (!(await isDemo())) return null

  return (
    <aside className="app-glass sticky top-0 z-40 flex h-[53px] items-center justify-between border-b border-app-line bg-app-surface/90 px-4 text-xs text-app-text backdrop-blur-xl sm:px-6 select-none shrink-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-app-accent opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-app-accent" />
        </span>
        <p className="truncate text-app-muted">
          <span className="font-semibold text-app-text">
            <span className="sm:hidden">Modo demo</span>
            <span className="hidden sm:inline">Modo demonstração</span>
          </span>
          <span className="hidden sm:inline text-app-subtle mx-1">·</span>
          <span className="hidden sm:inline">nada é salvo de verdade</span>
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Link
          href="/demo/reset"
          prefetch={false}
          className="inline-flex h-8 items-center justify-center rounded-full border border-app-line bg-app-elevated/80 px-3 text-xs font-medium text-app-text transition-colors hover:bg-app-raised hover:text-white"
        >
          Recomeçar
        </Link>
        <Link
          href="/cadastro"
          prefetch={false}
          className="inline-flex h-8 items-center justify-center rounded-full bg-app-accent px-3.5 text-xs font-semibold text-black transition-all hover:bg-app-accent-hover hover:scale-[1.02] active:scale-[0.98]"
        >
          Criar minha conta
        </Link>
      </div>
    </aside>
  )
}
