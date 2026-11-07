import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
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
      <Header title={`Editar ${membro.nome}`} showBack />
      <div className="px-4 py-5 lg:px-8 lg:py-8 max-w-xl">
        {/* Desktop back link */}
        <div className="hidden lg:flex items-center gap-2 mb-6">
          <Link
            href={`/membros/${id}`}
            className="text-app-muted hover:text-app-text text-sm flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para {membro.nome}</span>
          </Link>
        </div>

        <div className="hidden lg:block mb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-app-text">Editar membro</h1>
          <p className="text-app-muted text-sm mt-1">Atualize as informações de {membro.nome}</p>
        </div>

        <MemberForm membro={membro} />
      </div>
    </>
  )
}
