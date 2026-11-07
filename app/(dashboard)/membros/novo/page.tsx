import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { MemberForm } from '@/components/members/MemberForm'

export const dynamic = 'force-dynamic'

export default function NovoMembroPage() {
  return (
    <>
      <Header title="Novo membro" showBack />
      <div className="px-4 py-5 lg:px-8 lg:py-8 max-w-xl">
        {/* Desktop back link */}
        <div className="hidden lg:flex items-center gap-2 mb-6">
          <Link
            href="/membros"
            className="text-app-muted hover:text-app-text text-sm flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para membros</span>
          </Link>
        </div>

        <div className="hidden lg:block mb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-app-text">Adicionar membro</h1>
          <p className="text-app-muted text-sm mt-1">
            Preencha os dados da pessoa para gerenciar os pagamentos mensais
          </p>
        </div>

        <MemberForm />
      </div>
    </>
  )
}
