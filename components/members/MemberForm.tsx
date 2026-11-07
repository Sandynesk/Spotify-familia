'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useToast } from '@/components/ui/Toast'
import { criarMembro, editarMembro, type MembroFormData } from '@/lib/actions/membros'
import { dividirPlano } from '@/lib/domain/divisao'
import { AVATAR_COLORS } from '@/lib/utils/avatar'
import { formatCurrency } from '@/lib/utils/currency'
import type { Membro } from '@/types/database'

interface MemberFormProps {
  membro?: Membro
  valorPlano?: number | null
}

interface FormErrors {
  nome?: string
  telefone?: string
  email?: string
  valor_mensal?: string
}

function formatPhone(value: string) {
  const rawDigits = value.replace(/\D/g, '')
  const localDigits = rawDigits.startsWith('55') && rawDigits.length > 11 ? rawDigits.slice(2) : rawDigits
  const digits = localDigits.slice(0, 11)
  if (digits.length <= 2) return digits ? `(${digits}` : ''
  const ddd = digits.slice(0, 2)
  const local = digits.slice(2)
  if (local.length <= 4) return `(${ddd}) ${local}`
  if (digits.length <= 10) return `(${ddd}) ${local.slice(0, 4)}-${local.slice(4)}`
  return `(${ddd}) ${local.slice(0, 5)}-${local.slice(5)}`
}

function parseCurrency(value: string) {
  const cleaned = value.trim().replace(/\s/g, '')
  const normalized = cleaned.includes(',')
    ? cleaned.replace(/\./g, '').replace(',', '.')
    : cleaned
  return Number(normalized)
}

export function MemberForm({ membro, valorPlano = null }: MemberFormProps) {
  const router = useRouter()
  const { success, error } = useToast()
  const [pending, startTransition] = useTransition()
  const [nome, setNome] = useState(membro?.nome ?? '')
  const [email, setEmail] = useState(membro?.email ?? '')
  const [telefone, setTelefone] = useState(formatPhone(membro?.telefone ?? ''))
  const [valorMensal, setValorMensal] = useState(membro ? String(membro.valor_mensal).replace('.', ',') : '')
  const [diaVencimento, setDiaVencimento] = useState(membro?.dia_vencimento ?? 5)
  const [corAvatar, setCorAvatar] = useState(membro?.cor_avatar ?? AVATAR_COLORS[0])
  const [errors, setErrors] = useState<FormErrors>({})

  const sugestaoDivisao = valorPlano && valorPlano > 0
    ? dividirPlano(valorPlano, 5, { donoPaga: true }).valores[1] ?? null
    : null

  function validate() {
    const nextErrors: FormErrors = {}
    if (nome.trim().length < 2) nextErrors.nome = 'Informe um nome com pelo menos 2 caracteres.'

    const phoneDigits = telefone.replace(/\D/g, '')
    if (phoneDigits && (phoneDigits.length < 10 || phoneDigits.length > 11)) {
      nextErrors.telefone = 'Use um telefone com DDD e 10 ou 11 números.'
    }

    const normalizedEmail = email.trim()
    if (normalizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      nextErrors.email = 'Confira o formato do e-mail.'
    }

    const value = parseCurrency(valorMensal)
    if (!valorMensal.trim()) nextErrors.valor_mensal = 'Informe o valor mensal.'
    else if (!Number.isFinite(value) || value <= 0 || value > 10000) nextErrors.valor_mensal = 'Use um valor entre R$ 0,01 e R$ 10.000.'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validate()) return

    const payload: MembroFormData = {
      nome: nome.trim(),
      email: email.trim() || undefined,
      telefone: telefone.trim() || undefined,
      valor_mensal: parseCurrency(valorMensal),
      dia_vencimento: diaVencimento,
      cor_avatar: corAvatar,
    }

    startTransition(async () => {
      const result = membro
        ? await editarMembro(membro.id, payload)
        : await criarMembro(payload)

      if (result && 'error' in result && result.error) {
        error(`Não foi possível salvar: ${result.error}`)
        return
      }

      success(membro ? 'Alterações salvas.' : 'Membro adicionado.')
      const nextUrl = membro
        ? `/membros/${membro.id}`
        : result && 'id' in result && result.id
          ? `/membros/${result.id}`
          : '/membros'
      router.push(nextUrl)
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-36 lg:pb-4" noValidate>
      <Card padding="md">
        <SectionHeader title="Pessoa" description="Como encontrar e reconhecer essa pessoa." />
        <div className="space-y-4">
          <Input
            id="nome"
            label="Nome"
            value={nome}
            onChange={(event) => { setNome(event.target.value); setErrors((current) => ({ ...current, nome: undefined })) }}
            error={errors.nome}
            placeholder="Ex.: Ana Souza"
            required
            autoComplete="name"
            autoCapitalize="words"
            autoFocus={!membro}
          />
          <Input
            id="telefone"
            label="Telefone / WhatsApp"
            type="tel"
            inputMode="tel"
            value={telefone}
            onChange={(event) => { setTelefone(formatPhone(event.target.value)); setErrors((current) => ({ ...current, telefone: undefined })) }}
            error={errors.telefone}
            placeholder="(11) 99999-9999"
            autoComplete="tel"
            hint="Opcional"
          />
          <Input
            id="email"
            label="E-mail"
            type="email"
            inputMode="email"
            value={email}
            onChange={(event) => { setEmail(event.target.value); setErrors((current) => ({ ...current, email: undefined })) }}
            error={errors.email}
            placeholder="ana@exemplo.com"
            autoComplete="email"
            autoCapitalize="none"
            hint="Opcional"
          />
        </div>
      </Card>

      <Card padding="md">
        <SectionHeader title="Cobrança" description="Defina o valor e o melhor dia do mês." />
        <div className="space-y-5">
          <div className="space-y-2">
            <Input
              id="valor-mensal"
              label="Valor mensal"
              type="text"
              inputMode="decimal"
              value={valorMensal}
              onChange={(event) => { setValorMensal(event.target.value); setErrors((current) => ({ ...current, valor_mensal: undefined })) }}
              error={errors.valor_mensal}
              placeholder="8,20"
              prefix="R$"
              required
            />
            {sugestaoDivisao !== null && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-app-sm border border-app-line bg-app-elevated/50 px-3 py-2">
                <p className="text-xs text-app-muted">Divisão igual: <span className="font-semibold tabular text-app-text">{formatCurrency(sugestaoDivisao)}</span></p>
                <button
                  type="button"
                  onClick={() => { setValorMensal(sugestaoDivisao.toFixed(2).replace('.', ',')); setErrors((current) => ({ ...current, valor_mensal: undefined })) }}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-app-accent transition-colors hover:bg-app-accent/10"
                >
                  <Check aria-hidden className="h-3.5 w-3.5" /> Usar valor
                </button>
              </div>
            )}
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-app-text">Dia de vencimento</legend>
            <p className="mt-1 text-xs text-app-subtle">Escolha um dia entre 1 e 28.</p>
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7" role="radiogroup" aria-label="Dia de vencimento">
              {Array.from({ length: 28 }, (_, index) => index + 1).map((day) => {
                const selected = day === diaVencimento
                return (
                  <button
                    key={day}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setDiaVencimento(day)}
                    className={`min-h-11 rounded-full border text-sm font-medium tabular transition-colors focus-visible:outline-none ${selected ? 'border-app-accent bg-app-accent text-app-accent-ink' : 'border-app-line bg-app-elevated text-app-muted hover:bg-app-raised hover:text-app-text'}`}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </fieldset>
        </div>
      </Card>

      <Card padding="md">
        <SectionHeader title="Aparência" description="Escolha uma cor e confira o avatar." />
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          <Avatar nome={nome || 'Membro'} cor={corAvatar} size="xl" />
          <div className="w-full min-w-0">
            <p className="mb-3 text-sm font-medium text-app-text">Cor do avatar</p>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-8" role="radiogroup" aria-label="Cores do avatar">
              {AVATAR_COLORS.map((color, index) => {
                const selected = corAvatar === color
                return (
                  <button
                    key={color}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setCorAvatar(color)}
                    className={`flex min-h-11 min-w-11 items-center justify-center rounded-full border transition-transform hover:scale-105 focus-visible:outline-none ${selected ? 'border-app-accent ring-2 ring-app-accent ring-offset-2 ring-offset-app-surface' : 'border-app-line'}`}
                    style={{ backgroundColor: color }}
                    aria-label={`Cor ${index + 1}`}
                  >
                    {selected && <Check aria-hidden className="h-4 w-4 text-app-accent-ink" />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-app-line bg-app-bg/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-0">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-2 sm:px-4 lg:px-0">
          <Link
            href={membro ? `/membros/${membro.id}` : '/membros'}
            aria-disabled={pending}
            className={`inline-flex min-h-[52px] flex-1 items-center justify-center rounded-full border border-app-line bg-app-elevated px-4 text-sm font-semibold text-app-text transition-colors hover:bg-app-raised ${pending ? 'pointer-events-none opacity-50' : ''}`}
          >
            Cancelar
          </Link>
          <Button type="submit" size="lg" loading={pending} className="flex-[2]">
            {membro ? 'Salvar alterações' : 'Adicionar membro'}
          </Button>
        </div>
      </div>
    </form>
  )
}
