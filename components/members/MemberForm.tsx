'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { useToast } from '@/components/ui/Toast'
import { criarMembro, editarMembro, type MembroFormData } from '@/lib/actions/membros'
import { AVATAR_COLORS } from '@/lib/utils/avatar'
import type { Membro } from '@/types/database'

interface MemberFormProps {
  membro?: Membro
}

interface FormErrors {
  nome?: string
  valor_mensal?: string
  dia_vencimento?: string
}

export function MemberForm({ membro }: MemberFormProps) {
  const router = useRouter()
  const { success, error } = useToast()
  const [pending, startTransition] = useTransition()

  const [nome, setNome] = useState(membro?.nome ?? '')
  const [email, setEmail] = useState(membro?.email ?? '')
  const [telefone, setTelefone] = useState(membro?.telefone ?? '')
  const [valorMensal, setValorMensal] = useState(
    membro ? String(membro.valor_mensal).replace('.', ',') : ''
  )
  const [diaVencimento, setDiaVencimento] = useState(
    membro ? String(membro.dia_vencimento) : '5'
  )
  const [corAvatar, setCorAvatar] = useState(membro?.cor_avatar ?? AVATAR_COLORS[0])
  const [errors, setErrors] = useState<FormErrors>({})

  function validate(): boolean {
    const e: FormErrors = {}

    if (!nome.trim()) {
      e.nome = 'Nome é obrigatório'
    } else if (nome.trim().length < 2) {
      e.nome = 'Nome deve ter ao menos 2 caracteres'
    }

    const valor = parseFloat(valorMensal.replace(',', '.'))
    if (!valorMensal.trim()) {
      e.valor_mensal = 'Valor é obrigatório'
    } else if (isNaN(valor) || valor <= 0) {
      e.valor_mensal = 'Valor deve ser maior que zero'
    }

    const dia = parseInt(diaVencimento, 10)
    if (!diaVencimento.trim()) {
      e.dia_vencimento = 'Dia de vencimento é obrigatório'
    } else if (isNaN(dia) || dia < 1 || dia > 28) {
      e.dia_vencimento = 'Dia deve ser entre 1 e 28'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const valor = parseFloat(valorMensal.replace(',', '.'))

    startTransition(async () => {
      const payload: MembroFormData = {
        nome: nome.trim(),
        email: email.trim() || undefined,
        telefone: telefone.trim() || undefined,
        valor_mensal: valor,
        dia_vencimento: parseInt(diaVencimento, 10),
        cor_avatar: corAvatar,
      }

      const result = membro
        ? await editarMembro(membro.id, payload)
        : await criarMembro(payload)

      if (result && 'error' in result && result.error) {
        error(`Erro: ${result.error}`)
      } else {
        success(membro ? 'Membro atualizado!' : 'Membro adicionado com sucesso!')
        const nextUrl = membro
          ? `/membros/${membro.id}`
          : (result && 'id' in result && result.id ? `/membros/${result.id}` : '/membros')
        router.push(nextUrl)
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-28 lg:pb-0" noValidate>
      {/* Avatar preview e seletor de cor */}
      <div className="rounded-[var(--radius-app)] border border-app-line bg-app-surface p-5">
        <div className="flex flex-col items-center gap-4">
          <Avatar nome={nome || 'Membro'} cor={corAvatar} size="lg" />
          <div className="w-full">
            <p className="text-xs font-medium text-app-muted text-center mb-3">
              Escolha a cor do avatar
            </p>
            <div className="flex gap-2.5 flex-wrap justify-center" role="radiogroup" aria-label="Cores do avatar">
              {AVATAR_COLORS.map(cor => {
                const isSelected = corAvatar === cor
                return (
                  <button
                    key={cor}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setCorAvatar(cor)}
                    className={`
                      w-9 h-9 rounded-full transition-all duration-200
                      flex items-center justify-center
                      ${isSelected
                        ? 'ring-2 ring-app-accent ring-offset-2 ring-offset-app-surface scale-110'
                        : 'hover:scale-105 opacity-80 hover:opacity-100'
                      }
                    `}
                    style={{ backgroundColor: cor }}
                    aria-label={`Cor ${cor}`}
                  >
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-white shadow-sm" aria-hidden="true" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Campos do formulário */}
      <div className="rounded-[var(--radius-app)] border border-app-line bg-app-surface p-5 space-y-4">
        <Input
          label="Nome completo"
          id="nome"
          value={nome}
          onChange={e => {
            setNome(e.target.value)
            if (errors.nome) setErrors(p => ({ ...p, nome: undefined }))
          }}
          error={errors.nome}
          placeholder="Ex: Ana Souza"
          required
          autoComplete="name"
          autoCapitalize="words"
          autoFocus={!membro}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Valor mensal"
            id="valor_mensal"
            type="text"
            inputMode="decimal"
            value={valorMensal}
            onChange={e => {
              setValorMensal(e.target.value)
              if (errors.valor_mensal) setErrors(p => ({ ...p, valor_mensal: undefined }))
            }}
            error={errors.valor_mensal}
            placeholder="Ex: 10,00"
            hint="Em reais (R$)"
            required
          />

          <Input
            label="Dia do vencimento"
            id="dia_vencimento"
            type="number"
            inputMode="numeric"
            min="1"
            max="28"
            value={diaVencimento}
            onChange={e => {
              setDiaVencimento(e.target.value)
              if (errors.dia_vencimento) setErrors(p => ({ ...p, dia_vencimento: undefined }))
            }}
            error={errors.dia_vencimento}
            placeholder="Ex: 5"
            hint="Dia 1 a 28"
            required
          />
        </div>

        <Input
          label="Email"
          id="email"
          type="email"
          inputMode="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Ex: ana@exemplo.com"
          autoComplete="email"
          hint="Opcional"
        />

        <Input
          label="Telefone / WhatsApp"
          id="telefone"
          type="tel"
          inputMode="tel"
          value={telefone}
          onChange={e => setTelefone(e.target.value)}
          placeholder="Ex: (11) 99999-9999"
          autoComplete="tel"
          hint="Opcional"
        />
      </div>

      {/* Botões de Ação (fixos no celular com safe-area, padrão no desktop) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-4 bg-app-bg/95 backdrop-blur-md border-t border-app-line pb-[max(1rem,env(safe-area-inset-bottom))] lg:static lg:bg-transparent lg:border-0 lg:p-0">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={pending}
            className="flex-1 min-h-[48px] px-5 rounded-full border border-app-line bg-app-elevated text-app-text font-medium hover:bg-app-surface transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={pending}
            className="flex-[2] min-h-[48px] px-6 rounded-full bg-app-accent hover:bg-app-accent-hover text-black font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {pending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Salvando...</span>
              </>
            ) : (
              <span>{membro ? 'Salvar alterações' : 'Adicionar membro'}</span>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
