'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, Settings2 } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { IconButton } from '@/components/ui/IconButton'

interface HeaderProps {
  title?: string
  showBack?: boolean
}

/** Legacy page header adapter; new pages should use PageHeader directly. */
export function Header({ title = 'SpotiFamília', showBack = false }: HeaderProps) {
  const pathname = usePathname()

  return (
    <div className="lg:hidden">
      <PageHeader
        title={title}
        showBack={showBack}
        compact
        className="mb-3"
        actions={(
          <>
            {pathname !== '/configuracoes' && (
              <Link href="/configuracoes" aria-label="Configurações" className="inline-flex h-11 w-11 items-center justify-center rounded-full text-app-muted transition-colors hover:bg-app-elevated hover:text-app-text focus-visible:outline-offset-2">
                <Settings2 aria-hidden className="h-5 w-5" strokeWidth={1.75} />
              </Link>
            )}
            <form action="/sair" method="post">
              <IconButton aria-label="Sair da conta" icon={<LogOut />} variant="ghost" type="submit" />
            </form>
          </>
        )}
      />
    </div>
  )
}
