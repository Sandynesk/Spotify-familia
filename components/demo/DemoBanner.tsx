import Link from 'next/link'
import { isDemo } from '@/lib/demo/session'

export async function DemoBanner() {
  if (!(await isDemo())) return null

  return (
    <aside className="app-glass relative z-40 flex flex-col gap-3 border-b border-app-line bg-app-surface/80 px-4 py-3 text-sm text-app-text backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="text-app-muted">
        <span className="font-medium text-app-text">Modo demonstração</span>
        <span aria-hidden="true"> · </span>
        nada é salvo de verdade
      </p>
      <div className="flex items-center gap-2">
        <Link
          href="/demo/reset"
          prefetch={false}
          className="inline-flex min-h-10 items-center justify-center rounded-full border border-app-line bg-app-elevated px-4 text-sm font-medium text-app-text transition-colors hover:bg-app-elevated/80"
        >
          Recomeçar
        </Link>
        <Link
          href="/cadastro"
          prefetch={false}
          className="inline-flex min-h-10 items-center justify-center rounded-full bg-app-accent px-4 text-sm font-semibold text-black transition-colors hover:bg-app-accent-hover"
        >
          Criar minha conta
        </Link>
      </div>
    </aside>
  )
}
