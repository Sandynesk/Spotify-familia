'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Plus, Trash2 } from 'lucide-react'
import { Button, Card, Confetti, PageHeader, SlotsRing, springs } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { formatMoneyInput, parseMoneyInput } from '@/components/configuracoes/money'
import { useLocalStorageState } from '@/components/configuracoes/useLocalStorageState'
import { criarMembro } from '@/lib/actions/membros'
import { salvarConfiguracoes } from '@/lib/actions/configuracoes'
import { dividirPlano } from '@/lib/domain/divisao'
import { formatCurrency } from '@/lib/utils/currency'
import type { Configuracoes, Membro } from '@/types/database'

interface OnboardingWizardProps {
  initialConfig: Configuracoes | null
  membros: Membro[]
}

interface MembroDraft {
  id: string
  nome: string
  valor: string
  valorPersonalizado: boolean
  dia: string
}

const monthDefault = 40.9

function moneyInput(value: number) {
  return formatMoneyInput(value)
}

function draft(id: string): MembroDraft {
  return { id, nome: '', valor: '', valorPersonalizado: false, dia: '5' }
}

function uniqueDraftId() {
  return `membro-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function OnboardingWizard({ initialConfig, membros }: OnboardingWizardProps) {
  const router = useRouter()
  const toast = useToast()
  const reducedMotion = useReducedMotion()
  const [step, setStep] = useState(0)
  const [pending, startTransition] = useTransition()
  const [valorPlano, setValorPlano] = useState(() => formatMoneyInput(Number(initialConfig?.valor_plano ?? monthDefault)))
  const [chavePix, setChavePix] = useState(initialConfig?.chave_pix ?? '')
  const [nomeRecebedor, setNomeRecebedor] = useLocalStorageState('sf:pix-recebedor-nome', '')
  const [cidadeRecebedor, setCidadeRecebedor] = useLocalStorageState('sf:pix-recebedor-cidade', 'BRASIL')
  const [drafts, setDrafts] = useState<MembroDraft[]>(() => [draft('membro-1')])

  const plano = parseMoneyInput(valorPlano) ?? monthDefault
  const vagasRestantes = Math.max(0, 5 - membros.length)
  const quantidadeDrafts = Math.min(vagasRestantes, 5)
  const sugestao = dividirPlano(plano, 5).valores[0] ?? 0
  const progreso = step >= 4 ? 100 : ((step + 1) / 4) * 100
  const simboloMontado = step >= 4 ? 6 : step + 1
  const reducedTransition = reducedMotion ? { duration: 0 } : springs.soft

  const stepLabel = useMemo(() => {
    if (step === 4) return 'Tudo pronto'
    return `Passo ${step + 1} de 4`
  }, [step])

  function voltar() {
    if (step > 0) setStep((current) => current - 1)
  }

  function pular() {
    if (step === 0) {
      router.push('/dashboard')
      return
    }
    if (step >= 3) {
      setStep(4)
      return
    }
    setStep((current) => current + 1)
  }

  function salvarPlanoEAvancar() {
    const valor = parseMoneyInput(valorPlano)
    if (valor === null || valor > 10000) {
      toast.error('Digite um valor de plano válido, como R$ 40,90.')
      return
    }
    startTransition(async () => {
      try {
        const result = await salvarConfiguracoes({ valor_plano: valor, chave_pix: initialConfig?.chave_pix ?? null })
        if ('error' in result && result.error) {
          toast.error(result.error)
          return
        }
        toast.success('Valor do plano salvo!')
        setStep(2)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Não foi possível salvar o plano.')
      }
    })
  }

  function salvarPixEAvancar() {
    const valor = parseMoneyInput(valorPlano)
    startTransition(async () => {
      try {
        const result = await salvarConfiguracoes({ valor_plano: valor, chave_pix: chavePix.trim() || null })
        if ('error' in result && result.error) {
          toast.error(result.error)
          return
        }
        toast.success('Dados do PIX salvos!')
        setStep(3)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Não foi possível salvar o PIX.')
      }
    })
  }

  function atualizarDraft(id: string, patch: Partial<MembroDraft>) {
    setDrafts((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item))
  }

  function adicionarDraft() {
    if (drafts.length >= quantidadeDrafts) return
    setDrafts((current) => [...current, draft(uniqueDraftId())])
  }

  function removerDraft(id: string) {
    setDrafts((current) => current.length <= 1 ? current : current.filter((item) => item.id !== id))
  }

  function criarMembrosEConcluir() {
    const preenchidos = drafts.filter((item) => item.nome.trim())
    if (preenchidos.some((item) => item.nome.trim().length < 2)) {
      toast.error('Use pelo menos duas letras em cada nome.')
      return
    }
    if (preenchidos.some((item) => {
      const valor = parseMoneyInput(item.valorPersonalizado ? item.valor : moneyInput(sugestao))
      const dia = Number(item.dia)
      return valor === null || valor <= 0 || !Number.isInteger(dia) || dia < 1 || dia > 28
    })) {
      toast.error('Confira o valor e o dia de vencimento de cada pessoa.')
      return
    }

    startTransition(async () => {
      try {
        for (const item of preenchidos) {
          const valor = parseMoneyInput(item.valorPersonalizado ? item.valor : moneyInput(sugestao))
          if (valor === null) continue
          const result = await criarMembro({
            nome: item.nome.trim(),
            valor_mensal: valor,
            dia_vencimento: Number(item.dia),
          })
          if ('error' in result && result.error) {
            toast.error(`Não foi possível adicionar ${item.nome.trim()}: ${result.error}`)
            return
          }
          setDrafts((current) => current.map((draftItem) => draftItem.id === item.id ? { ...draftItem, nome: '' } : draftItem))
        }
        toast.success(preenchidos.length ? 'Pessoas adicionadas ao plano!' : 'Introdução concluída!')
        setStep(4)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Não foi possível adicionar as pessoas.')
      }
    })
  }

  function skipMembers() {
    setStep(4)
  }

  return (
    <div className="w-full min-w-0 max-w-full space-y-5 overflow-x-clip pb-8">
      <PageHeader title="Boas-vindas" subtitle="Deixe o SpotiFamília do seu jeito." />

      <Card variant="hero" padding="md" className="relative overflow-hidden">
        <Confetti trigger={step === 4 ? 1 : 0} />
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-app-muted">{stepLabel}</p>
            <p className="mt-1 text-sm text-app-text">Cada cápsula representa uma vaga do plano.</p>
          </div>
          <SlotsRing occupied={simboloMontado} paid={simboloMontado} label={`${simboloMontado} de 6 cápsulas montadas`} size={72} />
        </div>
        <div className="relative z-10 mt-4 h-1.5 overflow-hidden rounded-full bg-app-elevated" role="progressbar" aria-label="Progresso da introdução" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progreso}>
          <div className="h-full rounded-full bg-app-accent transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${progreso}%` }} />
        </div>
      </Card>

      <div className="min-h-[380px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.section
            key={step}
            initial={reducedMotion ? undefined : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
            transition={reducedTransition}
            className="space-y-5"
          >
            {step === 0 && (
              <Card padding="lg" className="w-full min-w-0 space-y-5">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-app-accent">Sua vida em grupo, mais leve</p>
                  <h2 className="w-full max-w-xl break-words text-3xl font-semibold leading-tight tracking-[-0.03em] text-app-text sm:text-4xl">Organize o Spotify Família sem constrangimento</h2>
                  <p className="w-full max-w-xl break-words text-sm leading-relaxed text-app-muted">Um lugar simples para acompanhar as contribuições e manter todo mundo por dentro.</p>
                </div>
                <ul className="grid min-w-0 gap-3 sm:grid-cols-3">
                  {[
                    ['Tudo organizado', 'Veja quem já pagou e quem ainda precisa de um lembrete.'],
                    ['Cobrança com carinho', 'Use uma mensagem pronta no tom que combina com você.'],
                    ['Contas claras', 'Divida o valor do plano sem fazer conta todo mês.'],
                  ].map(([title, text]) => (
                    <li key={title} className="min-w-0 break-words rounded-app-sm border border-app-line bg-app-elevated p-4">
                      <p className="text-sm font-semibold text-app-text">{title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-app-muted">{text}</p>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button size="lg" icon={<ArrowRight />} onClick={() => setStep(1)}>Começar</Button>
                  <Button size="lg" variant="ghost" onClick={pular}>Pular introdução</Button>
                </div>
              </Card>
            )}

            {step === 1 && (
              <Card padding="lg" className="mx-auto w-full min-w-0 max-w-2xl space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-app-accent">Plano</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-app-text">Quanto custa o seu plano?</h2>
                  <p className="mt-2 text-sm text-app-muted">Esse valor ajuda a dividir a conta e acompanhar o saldo do mês.</p>
                </div>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-app-text">Valor mensal</span>
                  <span className="flex min-h-[52px] items-center gap-2 rounded-app-sm border border-app-line bg-app-elevated px-4 focus-within:border-app-accent focus-within:ring-1 focus-within:ring-app-accent/60">
                    <span className="text-sm text-app-muted">R$</span>
                    <input
                      autoFocus
                      value={valorPlano}
                      onChange={(event) => setValorPlano(event.target.value)}
                      inputMode="decimal"
                      placeholder="40,90"
                      aria-label="Valor mensal do plano"
                      className="min-w-0 flex-1 bg-transparent py-3 text-lg tabular text-app-text outline-none placeholder:text-app-subtle"
                    />
                  </span>
                  <span className="block text-xs text-app-subtle">Sugestão: R$ 40,90</span>
                </label>
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                  <Button variant="ghost" onClick={pular}>Pular por enquanto</Button>
                  <div className="flex gap-2">
                    <Button variant="secondary" icon={<ArrowLeft />} onClick={voltar}>Voltar</Button>
                    <Button icon={<ArrowRight />} loading={pending} onClick={salvarPlanoEAvancar}>Continuar</Button>
                  </div>
                </div>
              </Card>
            )}

            {step === 2 && (
              <Card padding="lg" className="mx-auto w-full min-w-0 max-w-2xl space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-app-accent">PIX</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-app-text">Sua chave PIX</h2>
                  <p className="mt-2 text-sm text-app-muted">Ela pode aparecer nas mensagens de cobrança. Você também pode adicionar depois.</p>
                </div>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-app-text">Chave PIX <span className="font-normal text-app-muted">(opcional)</span></span>
                  <input
                    autoFocus
                    value={chavePix}
                    onChange={(event) => setChavePix(event.target.value)}
                    placeholder="CPF, telefone, e-mail ou chave aleatória"
                    autoComplete="off"
                    className="min-h-[52px] w-full min-w-0 rounded-app-sm border border-app-line bg-app-elevated px-4 py-3 text-base text-app-text outline-none placeholder:text-app-subtle focus:border-app-accent focus:ring-1 focus:ring-app-accent/60"
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-1.5">
                    <span className="text-sm font-medium text-app-text">Nome no PIX</span>
                    <input value={nomeRecebedor} onChange={(event) => setNomeRecebedor(event.target.value)} placeholder="Seu nome" className="min-h-11 w-full min-w-0 rounded-app-sm border border-app-line bg-app-elevated px-3 text-sm text-app-text outline-none placeholder:text-app-subtle focus:border-app-accent focus:ring-1 focus:ring-app-accent/60" />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-sm font-medium text-app-text">Cidade</span>
                    <input value={cidadeRecebedor} onChange={(event) => setCidadeRecebedor(event.target.value)} placeholder="Sua cidade" className="min-h-11 w-full min-w-0 rounded-app-sm border border-app-line bg-app-elevated px-3 text-sm text-app-text outline-none placeholder:text-app-subtle focus:border-app-accent focus:ring-1 focus:ring-app-accent/60" />
                  </label>
                </div>
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                  <Button variant="ghost" onClick={pular}>Pular</Button>
                  <div className="flex gap-2">
                    <Button variant="secondary" icon={<ArrowLeft />} onClick={voltar}>Voltar</Button>
                    <Button icon={<ArrowRight />} loading={pending} onClick={salvarPixEAvancar}>Continuar</Button>
                  </div>
                </div>
              </Card>
            )}

            {step === 3 && (
              <Card padding="lg" className="mx-auto w-full min-w-0 max-w-3xl space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-app-accent">Seu grupo</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-app-text">Quem está no plano?</h2>
                  <p className="mt-2 text-sm text-app-muted">Adicione até {quantidadeDrafts} {quantidadeDrafts === 1 ? 'pessoa' : 'pessoas'}. A sugestão por pessoa é {formatCurrency(sugestao)}.</p>
                </div>

                {quantidadeDrafts === 0 ? (
                  <Card padding="md"><p className="text-sm text-app-muted">Seu plano já está com as cinco vagas de membros preenchidas.</p></Card>
                ) : (
                  <div className="space-y-3">
                    {drafts.map((item, index) => {
                      const valorVisivel = item.valorPersonalizado ? item.valor : moneyInput(sugestao)
                      return (
                        <div key={item.id} className="rounded-app-sm border border-app-line bg-app-elevated p-3 sm:p-4">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <p className="text-xs font-medium uppercase tracking-[0.08em] text-app-subtle">Pessoa {index + 1}</p>
                            {drafts.length > 1 && <button type="button" aria-label={`Remover pessoa ${index + 1}`} onClick={() => removerDraft(item.id)} className="inline-flex h-10 w-10 items-center justify-center rounded-full text-app-muted hover:bg-app-raised hover:text-app-danger focus-visible:outline-offset-2"><Trash2 aria-hidden className="h-4 w-4" /></button>}
                          </div>
                          <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_130px_100px]">
                            <label className="min-w-0 space-y-1">
                              <span className="text-xs text-app-muted">Nome</span>
                              <input value={item.nome} onChange={(event) => atualizarDraft(item.id, { nome: event.target.value })} placeholder="Ex.: Ana Souza" autoComplete="name" className="min-h-11 w-full min-w-0 rounded-app-xs border border-app-line bg-app-surface px-3 text-sm text-app-text outline-none placeholder:text-app-subtle focus:border-app-accent focus:ring-1 focus:ring-app-accent/60" />
                            </label>
                            <label className="min-w-0 space-y-1">
                              <span className="text-xs text-app-muted">Valor mensal</span>
                              <span className="flex min-h-11 min-w-0 items-center gap-1 rounded-app-xs border border-app-line bg-app-surface px-2.5 focus-within:border-app-accent focus-within:ring-1 focus-within:ring-app-accent/60">
                                <span className="text-xs text-app-muted">R$</span>
                                <input value={valorVisivel} onChange={(event) => atualizarDraft(item.id, { valor: event.target.value, valorPersonalizado: true })} inputMode="decimal" aria-label={`Valor mensal da pessoa ${index + 1}`} className="min-w-0 w-full bg-transparent py-2 text-sm tabular text-app-text outline-none" />
                              </span>
                            </label>
                            <label className="min-w-0 space-y-1">
                              <span className="text-xs text-app-muted">Dia</span>
                              <input type="number" min={1} max={28} value={item.dia} onChange={(event) => atualizarDraft(item.id, { dia: event.target.value })} aria-label={`Dia de vencimento da pessoa ${index + 1}`} className="min-h-11 w-full min-w-0 rounded-app-xs border border-app-line bg-app-surface px-3 text-sm tabular text-app-text outline-none focus:border-app-accent focus:ring-1 focus:ring-app-accent/60" />
                            </label>
                          </div>
                        </div>
                      )
                    })}
                    {drafts.length < quantidadeDrafts && (
                      <Button variant="secondary" icon={<Plus />} onClick={adicionarDraft} className="w-full sm:w-auto">Adicionar outra pessoa</Button>
                    )}
                  </div>
                )}

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                  <Button variant="ghost" onClick={skipMembers}>Pular por enquanto</Button>
                  <div className="flex gap-2">
                    <Button variant="secondary" icon={<ArrowLeft />} onClick={voltar}>Voltar</Button>
                    <Button icon={<ArrowRight />} loading={pending} onClick={criarMembrosEConcluir}>Concluir</Button>
                  </div>
                </div>
              </Card>
            )}

            {step === 4 && (
              <Card variant="hero" padding="lg" className="relative mx-auto w-full min-w-0 max-w-2xl overflow-hidden text-center">
                <div className="relative z-10 mx-auto flex max-w-lg flex-col items-center gap-4">
                  <SlotsRing occupied={6} paid={6} label="Plano organizado, seis vagas no seu controle" size={84} />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-app-accent">Tudo no lugar</p>
                    <h2 className="mt-1 text-3xl font-semibold tracking-[-0.03em] text-app-text">Pronto!</h2>
                    <p className="mt-2 text-sm leading-relaxed text-app-muted">Seu plano está organizado. Quando precisar, você pode mudar os valores e as mensagens nas configurações.</p>
                  </div>
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                    <Button size="lg" onClick={() => router.push('/dashboard')}>Ir para o Hoje</Button>
                    <Link href="/configuracoes" className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border border-app-line bg-app-elevated px-5 text-sm font-semibold text-app-text transition-colors hover:bg-app-raised focus-visible:outline-offset-2">
                      Ajustes <ArrowRight aria-hidden className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </Card>
            )}
          </motion.section>
        </AnimatePresence>
      </div>
    </div>
  )
}
