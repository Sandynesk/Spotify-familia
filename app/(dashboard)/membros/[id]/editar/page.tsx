import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { MemberForm } from '@/components/members/MemberForm'
import { getMembro } from '@/lib/actions/membros'

interface Params {
  params: Promise<{ id: string }>
}

export default async function EditarMembroPage({ params }: Params) {
  const { id } = await params
  const membro = await getMembro(id)

  if (!membro) notFound()

  return (
    <>
      <Header title="Editar membro" showBack />
      <div className="px-4 py-5 lg:px-8 lg:py-8 max-w-lg">
        <div className="hidden lg:block mb-6">
          <h1 className="text-2xl font-bold text-white">Editar membro</h1>
          <p className="text-[#B3B3B3] text-sm mt-1">Atualize as informações de {membro.nome}</p>
        </div>
        <MemberForm membro={membro} />
      </div>
    </>
  )
}
