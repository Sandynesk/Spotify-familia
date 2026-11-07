'use client'

import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Download,
  ExternalLink,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react'
import {
  Button,
  Card,
  ListGroup,
  ListRow,
  PageHeader,
  SegmentedControl,
} from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { PixQrPreview } from '@/components/configuracoes/PixQrPreview'
import { ReajusteSheet } from '@/components/configuracoes/ReajusteSheet'
import { formatMoneyInput, parseMoneyInput } from '@/components/configuracoes/money'
import { useLocalStorageState } from '@/components/configuracoes/useLocalStorageState'
import { salvarConfiguracoes } from '@/lib/actions/configuracoes'
import { exportarCsv } from '@/lib/actions/exportar'
import { dividirPlano } from '@/lib/domain/divisao'
import { detectarTipoChave, gerarPixCopiaECola, type TipoChavePix } from '@/lib/domain/pix'
import { gerarMensagemCobranca, type TomMensagem } from '@/lib/domain/whatsapp'
import { formatCurrency } from '@/lib/utils/currency'
import type { Membro } from '@/types/database'
import type { Configuracoes } from '@/types/database'

interface ConfiguracoesScreenProps {
  initialConfig: Configuracoes | null
  membros: Membro[]
  email: string
  isDemo: boolean
  initialError?: string | null
}

const tipoChaveLabel: Record<TipoChavePix, string> = {
  telefone: 'Telefone',
  cpf: 'CPF',
  cnpj: 'CNPJ',
  email: 'E-mail',
  aleatoria: 'Aleatória',
}

function monthReference() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
}

function downloadCsv(nome: string, conteudo: string) {
  const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nome
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function ConfiguracoesScreen({ initialConfig, membros, email, isDemo, initialError }: ConfiguracoesScreenProps) {
  const router = useRouter()
  const toast = useToast()
  const [valorPlano, setValorPlano] = useState(initialConfig?.valor_plano == null ? '' : formatMoneyInput(Number(initialConfig.valor_plano)))
  const [chavePix, setChavePix] = useState(initialConfig?.chave_pix ?? '')
  const [nomeRecebedor, setNomeRecebedor] = useLocalStorageState('sf:pix-recebedor-nome', '')
  const [cidadeRecebedor, setCidadeRecebedor] = useLocalStorageState('sf:pix-recebedor-cidade', 'BRASIL')
  const [donoPaga, setDonoPaga] = useLocalStorageState('sf:dono-paga', false)
  const [tom, setTom] = useLocalStorageState<TomMensagem>('sf:tom-cobranca', 'gentil')
  const [assinatura, setAssinatura] = useLocalStorageState('sf:assinatura-cobranca', '')
  const [simuladorPessoas, setSimuladorPessoas] = useState('5')
  const [arredondamento, setArredondamento] = useState<'centavo' | 'cima10'>('centavo')
  const [anoExportacao, setAnoExportacao] = useState(String(new Date().getFullYear()))
  const [reajusteOpen, setReajusteOpen] = useState(false)
  const [savingPlan, startSavingPlan] = useTransition()
  const [savingPix, startSavingPix] = useTransition()
  const [exporting, startExporting] = useTransition()

  const valorNumerico = parseMoneyInput(valorPlano)
  const valorParaSimular = valorNumerico ?? 40.9
  const chaveNormalizada = chavePix.trim()
  const tipoChave = chaveNormalizada ? tipoChaveLabel[detectarTipoChave(chaveNormalizada)] : null
  const divisao = useMemo(() => dividirPlano(valorParaSimular, Number(simuladorPessoas), {
    donoPaga,
    arredondar: arredondamento,
  }), [arredondamento, donoPaga, simuladorPessoas, valorParaSimular])
  const valorPrevia = divisao.valores[donoPaga ? 1 : 0] ?? divisao.valores[0] ?? 0
  const pixTeste = useMemo(() => {
    if (!chaveNormalizada) return ''
    try {
      return gerarPixCopiaECola({
        chave: chaveNormalizada,
        valor: valorPrevia,
        nome: nomeRecebedor || 'SpotiFamilia',
        cidade: cidadeRecebedor || 'BRASIL',
        txid: 'TESTE123',
        descricao: 'Prévia de teste',
      })
    } catch {
      return ''
    }
  }, [chaveNormalizada, cidadeRecebedor, nomeRecebedor, valorPrevia])
  const mes = monthReference()
  const mensagemPrevia = useMemo(() => gerarMensagemCobranca({
    nome: 'Ana',
    meses: [mes],
    total: valorPrevia,
    chavePix: chaveNormalizada || undefined,
    tom,
    nomeDono: assinatura.trim() ? (assinatura.trim().startsWith('—') ? assinatura.trim() : `— ${assinatura.trim()}`) : undefined,
  }), [assinatura, chaveNormalizada, mes, tom, valorPrevia])

  function savePlan() {
    if (valorPlano.trim() && (valorNumerico === null || valorNumerico > 10000)) {
      toast.error('Digite um valor entre R$ 0,00 e R$ 10.000,00.')
      return
    }
    startSavingPlan(async () => {
      try {
        const result = await salvarConfiguracoes({ valor_plano: valorNumerico, chave_pix: chaveNormalizada || null })
        if ('error' in result) {
          toast.error(result.error)
          return
        }
        toast.success('Ajustes do plano salvos!')
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Não foi possível salvar o plano.')
      }
    })
  }

  function savePix() {
    if (valorPlano.trim() && (valorNumerico === null || valorNumerico > 10000)) {
      toast.error('Confira o valor do plano antes de salvar o PIX.')
      return
    }
    startSavingPix(async () => {
      try {
        const result = await salvarConfiguracoes({ valor_plano: valorNumerico, chave_pix: chaveNormalizada || null })
        if ('error' in result) {
          toast.error(result.error)
          return
        }
        toast.success('Dados do PIX salvos!')
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Não foi possível salvar o PIX.')
      }
    })
  }

  function exportCsv(tipo: 'pagamentos' | 'membros') {
    const ano = Number(anoExportacao)
    if (tipo === 'pagamentos' && (!Number.isInteger(ano) || ano < 2000 || ano > 9999)) {
      toast.error('Digite um ano válido para exportar os pagamentos.')
      return
    }
    startExporting(async () => {
      try {
        const result = await exportarCsv(tipo, ano)
        if ('error' in result) {
          toast.error(result.error)
          return
        }
        downloadCsv(result.nome, result.conteudo)
        toast.success('CSV baixado. Ele já está pronto para abrir no Excel.')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Não foi possível exportar os dados.')
      }
    })
  }

  const tomOptions = [
    { value: 'gentil', label: 'Gentil' },
    { value: 'direto', label: 'Direto' },
    { value: 'divertido', label: 'Divertido' },
  ] as const

  return (
    <div className="space-y-6 pb-8">
      <PageHeader title="Configurações" subtitle="Tudo do seu plano em um só lugar." />

      {initialError && (
        <Card padding="sm" className="border-app-warn/30 bg-app-warn/10">
          <p role="alert" className="text-sm text-app-warn">Não foi possível carregar algumas configurações: {initialError}</p>
        </Card>
      )}

      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <section className="min-w-0 space-y-3">
          <ListGroup title="Plano" footer="O valor salvo também aparece no resumo do seu plano.">
            <ListRow
              title={<label htmlFor="valor-plano">Valor do plano</label>}
              description="Assinatura mensal do Spotify Família"
              trailing={(
                <span className="flex w-32 shrink-0 items-center gap-1 rounded-app-xs border border-app-line bg-app-elevated px-2.5 focus-within:border-app-accent focus-within:ring-1 focus-within:ring-app-accent/60">
                  <span className="text-xs text-app-muted">R$</span>
                  <input
                    id="valor-plano"
                    value={valorPlano}
                    onChange={(event) => setValorPlano(event.target.value)}
                    inputMode="decimal"
                    placeholder="40,90"
                    aria-label="Valor do plano em reais"
                    className="min-w-0 w-full bg-transparent py-2.5 text-right text-sm tabular text-app-text outline-none placeholder:text-app-subtle"
                  />
                </span>
              )}
            />
            <ListRow title="Vagas" description="O plano Família tem até seis pessoas" value="6" />
            <ListRow
              title="Dono também paga?"
              description="Usado só no simulador de divisão"
              trailing={(
                <label className="relative inline-flex h-11 w-12 shrink-0 cursor-pointer items-center" aria-label="Dono também paga no simulador">
                  <input
                    type="checkbox"
                    role="switch"
                    checked={donoPaga}
                    onChange={(event) => setDonoPaga(event.target.checked)}
                    className="peer sr-only"
                    aria-label="Dono também paga no simulador"
                  />
                  <span aria-hidden="true" className="relative h-7 w-12 rounded-full bg-app-raised transition-colors peer-checked:bg-app-accent peer-checked:[&>span]:translate-x-5 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-app-accent">
                    <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-app-text shadow transition-transform" />
                  </span>
                </label>
              )}
            />
          </ListGroup>
          <Button onClick={savePlan} loading={savingPlan} className="w-full sm:w-auto">Salvar ajustes do plano</Button>
        </section>

        <section className="min-w-0 space-y-3">
          <ListGroup title="Receber" footer="O nome e a cidade ficam salvos só neste dispositivo.">
            <ListRow
              title={<label htmlFor="chave-pix">Chave PIX</label>}
              description={tipoChave ? `Tipo detectado: ${tipoChave}` : 'CPF, telefone, e-mail ou aleatória'}
              trailing={(
                <input
                  id="chave-pix"
                  value={chavePix}
                  onChange={(event) => setChavePix(event.target.value)}
                  autoComplete="off"
                  placeholder="Sua chave"
                  aria-label="Chave PIX"
                  className="w-[38vw] min-w-24 max-w-44 rounded-app-xs border border-app-line bg-app-elevated px-2.5 py-2.5 text-right text-sm text-app-text outline-none placeholder:text-app-subtle focus:border-app-accent focus:ring-1 focus:ring-app-accent/60"
                />
              )}
            />
            <ListRow
              title={<label htmlFor="pix-nome">Nome no PIX</label>}
              trailing={(
                <input
                  id="pix-nome"
                  value={nomeRecebedor}
                  onChange={(event) => setNomeRecebedor(event.target.value)}
                  placeholder="Seu nome"
                  aria-label="Nome do recebedor do PIX"
                  className="w-[38vw] min-w-24 max-w-44 rounded-app-xs border border-app-line bg-app-elevated px-2.5 py-2.5 text-right text-sm text-app-text outline-none placeholder:text-app-subtle focus:border-app-accent focus:ring-1 focus:ring-app-accent/60"
                />
              )}
            />
            <ListRow
              title={<label htmlFor="pix-cidade">Cidade no PIX</label>}
              trailing={(
                <input
                  id="pix-cidade"
                  value={cidadeRecebedor}
                  onChange={(event) => setCidadeRecebedor(event.target.value)}
                  placeholder="Sua cidade"
                  aria-label="Cidade do recebedor do PIX"
                  className="w-[38vw] min-w-24 max-w-44 rounded-app-xs border border-app-line bg-app-elevated px-2.5 py-2.5 text-right text-sm text-app-text outline-none placeholder:text-app-subtle focus:border-app-accent focus:ring-1 focus:ring-app-accent/60"
                />
              )}
            />
          </ListGroup>
          <Card padding="md" className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
            {pixTeste ? (
              <PixQrPreview value={pixTeste} />
            ) : (
              <div className="grid h-40 w-40 shrink-0 place-items-center rounded-app-sm border border-dashed border-app-line-strong bg-app-elevated px-3 text-xs text-app-muted">
                {chaveNormalizada ? 'Confira os dados para gerar o QR.' : 'Adicione uma chave PIX para ver o QR de teste.'}
              </div>
            )}
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-semibold text-app-text">Prévia do QR de teste</p>
              <p className="text-xs leading-relaxed text-app-muted">Valor de {formatCurrency(valorPrevia)}. Não use este QR para receber pagamentos reais.</p>
            </div>
          </Card>
          <Button onClick={savePix} loading={savingPix} variant="secondary" className="w-full sm:w-auto">Salvar dados do PIX</Button>
        </section>
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <section className="min-w-0 space-y-3">
          <ListGroup title="Mensagens" footer="A tela Cobrar usa o mesmo tom salvo neste dispositivo.">
            <div className="p-4">
              <SegmentedControl
                aria-label="Tom padrão das mensagens de cobrança"
                value={tom}
                onChange={setTom}
                options={tomOptions}
              />
            </div>
            <ListRow
              title={<label htmlFor="assinatura">Assinatura</label>}
              description="Opcional, aparece no fim da mensagem"
              trailing={(
                <input
                  id="assinatura"
                  value={assinatura}
                  onChange={(event) => setAssinatura(event.target.value)}
                  placeholder="Sandy"
                  aria-label="Assinatura opcional da mensagem"
                  className="w-[38vw] min-w-24 max-w-44 rounded-app-xs border border-app-line bg-app-elevated px-2.5 py-2.5 text-right text-sm text-app-text outline-none placeholder:text-app-subtle focus:border-app-accent focus:ring-1 focus:ring-app-accent/60"
                />
              )}
            />
          </ListGroup>
          <Card padding="md">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-app-subtle">Prévia ao vivo</p>
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-app-text">{mensagemPrevia}</p>
          </Card>
          <Button variant="secondary" onClick={() => toast.success('Preferências de mensagem salvas neste dispositivo.')} className="w-full sm:w-auto">
            Salvar preferências de mensagem
          </Button>
        </section>

        <section className="min-w-0 space-y-3">
          <ListGroup title="Reajuste de preço" footer="Os pagamentos já marcados como pagos são preservados.">
            <ListRow
              title="O Spotify mudou o preço?"
              description="Simule e aplique novos valores por membro"
              trailing={<Button size="sm" variant="secondary" icon={<SlidersHorizontal />} onClick={() => setReajusteOpen(true)}>Simular</Button>}
            />
          </ListGroup>

          <ListGroup title="Simulador de divisão" footer={donoPaga ? `Parte do dono: ${formatCurrency(divisao.parteDono)} · Sobra: ${formatCurrency(divisao.sobra)}` : `Total dividido: ${formatCurrency(divisao.totalCobrado)}`}>
            <ListRow
              title="Pessoas na divisão"
              description="De 2 a 6 participantes"
              trailing={(
                <select
                  value={simuladorPessoas}
                  onChange={(event) => setSimuladorPessoas(event.target.value)}
                  aria-label="Quantidade de pessoas no simulador"
                  className="min-h-10 rounded-app-xs border border-app-line bg-app-elevated px-3 text-sm text-app-text outline-none focus:border-app-accent focus:ring-1 focus:ring-app-accent/60"
                >
                  {[2, 3, 4, 5, 6].map((pessoas) => <option key={pessoas} value={pessoas}>{pessoas}</option>)}
                </select>
              )}
            />
            <ListRow
              title="Arredondamento"
              trailing={(
                <select
                  value={arredondamento}
                  onChange={(event) => setArredondamento(event.target.value as 'centavo' | 'cima10')}
                  aria-label="Arredondamento do simulador"
                  className="min-h-10 max-w-40 rounded-app-xs border border-app-line bg-app-elevated px-2 text-xs text-app-text outline-none focus:border-app-accent focus:ring-1 focus:ring-app-accent/60"
                >
                  <option value="centavo">Centavos</option>
                  <option value="cima10">Próximo R$ 10</option>
                </select>
              )}
            />
          </ListGroup>
          <Card variant="hero" padding="md" className="flex min-w-0 items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-app-muted">Cada pessoa paga</p>
              <p className="mt-1 break-all text-3xl font-semibold tracking-[-0.03em] tabular text-app-text">{formatCurrency(divisao.valores[donoPaga ? 1 : 0] ?? divisao.valores[0] ?? 0)}</p>
              <p className="mt-1 text-xs text-app-muted">Plano de {formatCurrency(valorParaSimular)} ÷ {divisao.quantidadePagantes} pagantes</p>
            </div>
            <span className="shrink-0 rounded-full border border-app-line bg-app-surface/70 px-3 py-1.5 text-xs font-medium text-app-muted">{arredondamento === 'centavo' ? 'Exato' : 'Arredondado'}</span>
          </Card>
        </section>
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <section className="min-w-0 space-y-3">
          <ListGroup title="Exportar" footer="Os arquivos usam UTF-8 com BOM e separador compatível com Excel pt-BR.">
            <ListRow
              title="Pagamentos do ano"
              description="CSV com status e valores"
              trailing={(
                <div className="flex items-center gap-2">
                  <input
                    value={anoExportacao}
                    onChange={(event) => setAnoExportacao(event.target.value)}
                    inputMode="numeric"
                    aria-label="Ano dos pagamentos para exportar"
                    className="w-20 rounded-app-xs border border-app-line bg-app-elevated px-2 py-2.5 text-center text-sm tabular text-app-text outline-none focus:border-app-accent focus:ring-1 focus:ring-app-accent/60"
                  />
                  <Button size="sm" variant="secondary" icon={<Download />} loading={exporting} onClick={() => exportCsv('pagamentos')} aria-label="Baixar CSV de pagamentos">Baixar</Button>
                </div>
              )}
            />
            <ListRow
              title="Membros"
              description="CSV com nomes, valores e vencimentos"
              trailing={<Button size="sm" variant="secondary" icon={<Download />} loading={exporting} onClick={() => exportCsv('membros')} aria-label="Baixar CSV de membros">Baixar</Button>}
            />
          </ListGroup>
          {exporting && <p className="text-xs text-app-muted" role="status">Preparando seu arquivo…</p>}
        </section>

        <section className="min-w-0 space-y-3">
          <ListGroup title="App">
            <ListRow
              title="Instalar na tela inicial"
              description="Veja as instruções para instalar o app"
              href="/mais"
              icon={<ExternalLink />}
            />
            <ListRow
              title="Refazer a introdução"
              description="Revise os passos iniciais quando quiser"
              href="/boas-vindas"
              icon={<RotateCcw />}
            />
          </ListGroup>
          <p className="px-1 text-xs leading-relaxed text-app-subtle">No iPhone: abra o menu Compartilhar no Safari e toque em “Adicionar à Tela de Início”.</p>
        </section>
      </div>

      <section className="min-w-0 space-y-3">
        <ListGroup title="Conta">
          <ListRow title="E-mail" value={email || 'Não disponível'} />
          <ListRow
            title="Sair"
            description="Encerrar esta sessão"
            trailing={(
              <form action="/sair" method="post">
                <Button type="submit" variant="ghost">Sair</Button>
              </form>
            )}
          />
          {isDemo && (
            <ListRow
              title="Recomeçar demonstração"
              description="Limpar as mudanças desta sessão demo"
              trailing={(
                <Link href="/demo/reset" className="inline-flex min-h-10 items-center gap-1 rounded-full px-3 text-sm font-semibold text-app-accent hover:bg-app-accent/10 focus-visible:outline-offset-2">
                  Recomeçar <ArrowRight aria-hidden className="h-4 w-4" />
                </Link>
              )}
            />
          )}
        </ListGroup>
        {isDemo && <p className="px-1 text-xs text-app-subtle">A demonstração usa dados fictícios e pode ser recomeçada a qualquer momento.</p>}
      </section>

      <ReajusteSheet
        key={valorPlano || '40,90'}
        open={reajusteOpen}
        onClose={() => setReajusteOpen(false)}
        membros={membros}
        valorPlanoAtual={valorPlano || '40,90'}
        chavePix={chavePix}
        donoPaga={donoPaga}
        onApplied={(novoValor) => setValorPlano(formatMoneyInput(novoValor))}
      />
    </div>
  )
}
