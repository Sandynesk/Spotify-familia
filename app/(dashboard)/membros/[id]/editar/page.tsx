import { notFound } from 'next/navigation'
import { MemberForm } from '@/components/members/MemberForm'
import { PageHeader } from '@/components/ui/PageHeader'
import { getConfiguracoes } from '@/lib/actions/configuracoes'
import { getMembro } from '@/lib/actions/membros'

interface Params {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function EditarMembroPage({ params }: Params) {
  const { id } = await params
  const [membro, configuracoes] = await Promise.all([
    getMembro(id),
    getConfiguracoes(),
  ])

  if (!membro) notFound()

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader
        title="Editar membro"
        subtitle={`Atualize os dados de ${membro.nome}.`}
        showBack
      />
      <MemberForm membro={membro} valorPlano={configuracoes?.valor_plano ?? null} />
    </div>
  )
}
