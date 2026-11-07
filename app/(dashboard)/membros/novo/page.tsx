import { MemberForm } from '@/components/members/MemberForm'
import { PageHeader } from '@/components/ui/PageHeader'
import { getConfiguracoes } from '@/lib/actions/configuracoes'

export const dynamic = 'force-dynamic'

export default async function NovoMembroPage() {
  const configuracoes = await getConfiguracoes()

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader
        title="Novo membro"
        subtitle="Adicione alguém ao seu plano Família."
        showBack
      />
      <MemberForm valorPlano={configuracoes?.valor_plano ?? null} />
    </div>
  )
}
