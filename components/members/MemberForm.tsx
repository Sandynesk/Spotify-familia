'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { useToast } from '@/components/ui/Toast'
import { criarMembro, editarMembro } from '@/lib/actions/membros'
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
    membro ? String(membro.valor_mensal) : ''
  )
  const [diaVencimento, setDiaVencimento] = useState(
    membro ? String(membro.dia_vencimento) : '5'
  )
  const [corAvatar, setCorAvatar] = useState(membro?.cor_avatar ?? AVATAR_COLORS[0])
  const [errors, setErrors] = useState<FormErrors>({})

  function validate(): boolean {
    const e: FormErrors = {}

    if (!nome.trim()) e.nome = 'Nome é obrigatório'
    else if (nome.trim().length < 2) e.nome = 'Nome deve ter ao menos 2 caracteres'

    const valor = parseFloat(valorMensal.replace(',', '.'))
    if (!valorMensal) e.valor_mensal = 'Valor é obrigatório'
    else if (isNaN(valor) || valor <= 0) e.valor_mensal = 'Valor deve ser maior que zero'

    const dia = parseInt(diaVencimento)
    if (!diaVencimento) e.dia_vencimento = 'Dia de vencimento é obrigatório'
    else if (isNaN(dia) || dia < 1 || dia > 28) e.dia_vencimento = 'Dia deve ser entre 1 e 28'

    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const valor = parseFloat(valorMensal.replace(',', '.'))

    startTransition(async () => {
      const payload = {
        nome: nome.trim(),
        email: email.trim() || undefined,
        telefone: telefone.trim() || undefined,
        valor_mensal: valor,
        dia_vencimento: parseInt(diaVencimento),
        cor_avatar: corAvatar,
      }

      const result = membro
        ? await editarMembro(membro.id, payload)
        : await criarMembro(payload)

      if (result?.error) {
        error(`Erro: ${result.error}`)
      } else {
        success(membro ? 'Membro atualizado!' : 'Membro adicionado com sucesso!')
        router.push(membro ? `/membros/${membro.id}` : '/dashboard')
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Avatar preview */}
      <div className="flex flex-col items-center gap-4 py-2">
        <Avatar nome={nome || 'N'} cor={corAvatar} size="lg" />
        <div>
          <p className="text-[#B3B3B3] text-xs text-center mb-2">Cor do avatar</p>
          <div className="flex gap-2 flex-wrap justify-center">
            {AVATAR_COLORS.map(cor => (
              <button
                key={cor}
                type="button"
                onClick={() => setCorAvatar(cor)}
                className={`
                  w-7 h-7 rounded-full transition-all duration-200
                  ${corAvatar === cor
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-[#121212] scale-110'
                    : 'hover:scale-105'
                  }
                `}
                style={{ backgroundColor: cor }}
                aria-label={`Cor ${cor}`}
                aria-pressed={corAvatar === cor}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/5" />

      {/* Fields */}
      <div className="space-y-4">
        <Input
          label="Nome"
          id="nome"
          value={nome}
          onChange={e => { setNome(e.target.value); setErrors(p => ({ ...p, nome: undefined })) }}
          error={errors.nome}
          placeholder="Ex: João Silva"
          required
          autoFocus={!membro}
        />

        <Input
          label="Email"
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Ex: joao@email.com"
          autoComplete="email"
        />

        <Input
          label="Telefone"
          id="telefone"
          type="tel"
          value={telefone}
          onChange={e => setTelefone(e.target.value)}
          placeholder="Ex: (11) 99999-9999"
          autoComplete="tel"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Valor mensal"
            id="valor_mensal"
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            value={valorMensal}
            onChange={e => { setValorMensal(e.target.value); setErrors(p => ({ ...p, valor_mensal: undefined })) }}
            error={errors.valor_mensal}
            placeholder="Ex: 10.00"
            hint="Em reais (R$)"
            required
          />

          <Input
            label="Dia de vencimento"
            id="dia_vencimento"
            type="number"
            inputMode="numeric"
            min="1"
            max="28"
            value={diaVencimento}
            onChange={e => { setDiaVencimento(e.target.value); setErrors(p => ({ ...p, dia_vencimento: undefined })) }}
            error={errors.dia_vencimento}
            placeholder="Ex: 5"
            hint="Dia 1 a 28"
            required
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          className="flex-1"
          disabled={pending}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={pending}
          className="flex-1"
        >
          {membro ? 'Salvar alterações' : 'Adicionar membro'}
        </Button>
      </div>
    </form>
  )
}
