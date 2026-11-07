export const dynamic = 'force-dynamic'

import { ConfiguracoesScreen } from '@/components/configuracoes/ConfiguracoesScreen'
import { getMembros } from '@/lib/actions/membros'
import { getConfiguracoes } from '@/lib/actions/configuracoes'
import { getSession } from '@/lib/auth'
import { isDemo } from '@/lib/demo/session'

export default async function ConfiguracoesPage() {
  const [initialConfig, membros, session, demo] = await Promise.all([
    getConfiguracoes(),
    getMembros(),
    getSession(),
    isDemo(),
  ])

  return (
    <ConfiguracoesScreen
      initialConfig={initialConfig}
      membros={membros}
      email={session?.user.email ?? ''}
      isDemo={demo}
    />
  )
}
