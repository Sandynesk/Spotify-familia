export const dynamic = 'force-dynamic'

import { Header } from '@/components/layout/Header'
import { ConfiguracoesForm } from '@/components/configuracoes/ConfiguracoesForm'
import { getConfiguracoes } from '@/lib/actions/configuracoes'
import type { Configuracoes } from '@/types/database'

export default async function ConfiguracoesPage() {
  let config: Configuracoes | null = null
  let loadError: string | null = null

  try {
    config = await getConfiguracoes()
  } catch (err: unknown) {
    loadError = err instanceof Error ? err.message : 'Não foi possível carregar as configurações atuais'
  }

  return (
    <>
      <Header title="Configurações" showBack />
      <div className="px-4 py-5 lg:px-8 lg:py-8 max-w-xl">
        <div className="hidden lg:block mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-app-text">Configurações</h1>
          <p className="text-app-muted text-sm mt-1">
            Valores usados no cálculo de custos e nas mensagens de cobrança
          </p>
        </div>

        <ConfiguracoesForm initialConfig={config} initialError={loadError} />
      </div>
    </>
  )
}
