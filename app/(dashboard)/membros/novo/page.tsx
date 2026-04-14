import { Header } from '@/components/layout/Header'
import { MemberForm } from '@/components/members/MemberForm'

export default function NovoMembroPage() {
  return (
    <>
      <Header title="Novo membro" showBack />
      <div className="px-4 py-5 lg:px-8 lg:py-8 max-w-lg">
        <div className="hidden lg:block mb-6">
          <h1 className="text-2xl font-bold text-white">Adicionar membro</h1>
          <p className="text-[#B3B3B3] text-sm mt-1">
            Preencha as informações do novo membro do plano
          </p>
        </div>
        <MemberForm />
      </div>
    </>
  )
}
