'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useSyncExternalStore } from 'react'
import { AlertCircle, Check, MessageCircle, Users } from 'lucide-react'
import { Avatar, Button, Card, EmptyState, SectionHeader, SegmentedControl } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { CobrancaCartao } from '@/components/cobranca/CobrancaCartao'
import { PixCobrancaSheet } from '@/components/cobranca/PixCobrancaSheet'
import { ReciboButton } from '@/components/cobranca/ReciboButton'
import { RelatorioGrupoCard } from '@/components/relatorio/RelatorioGrupoCard'
import { desfazerVarios, marcarVariosPagos } from '@/lib/actions/lote'
import type { ItemCobranca } from '@/lib/actions/cobranca'
import type { PagamentoRecenteCobranca } from '@/lib/actions/cobrar'
import { linkWhatsApp, type TomMensagem } from '@/lib/domain/whatsapp'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDateTime, formatMonthYear } from '@/lib/utils/date'

interface CentralCobrancaProps {
  cobrancas: ItemCobranca[]
  pagamentoIdsPorMembro: Record<string, string[]>
  recentes: PagamentoRecenteCobranca[]
  mensagemGrupo: string
  erroGrupo?: string
  chavePixConfigurada: boolean
  mesReferencia: string
  membroInicial?: string
  erro?: string
}

type MensagensEnviadas = Record<string, string>

const TOM_KEY = 'sf-cobrar-tom'
const EMPTY_JSON = '{}'
const EMPTY_RECORD = '{}'
const tons: { value: TomMensagem; label: string }[] = [
  { value: 'gentil', label: 'Gentil' },
  { value: 'direto', label: 'Direto' },
  { value: 'divertido', label: 'Divertido' },
]

const assinantes = new Set<() => void>()

function assinarMudancas(assinante: () => void) {
  assinantes.add(assinante)
  const ouvirStorage = (event: StorageEvent) => {
    if (!event.key || event.key.startsWith('sf-cobrar-')) assinante()
  }
  window.addEventListener('storage', ouvirStorage)
  return () => {
    assinantes.delete(assinante)
    window.removeEventListener('storage', ouvirStorage)
  }
}

function notificarMudancas() {
  assinantes.forEach(assinante => assinante())
}

function getToneSnapshot(): TomMensagem {
  try {
    const value = window.localStorage.getItem(TOM_KEY)
    return value === 'direto' || value === 'divertido' ? value : 'gentil'
  } catch {
    return 'gentil'
  }
}

function getSentKey(mesReferencia: string) {
  return `sf-cobrar-enviadas:${mesReferencia.slice(0, 7)}`
}

function getSentSnapshot(mesReferencia: string) {
  try {
    return window.localStorage.getItem(getSentKey(mesReferencia)) ?? EMPTY_JSON
  } catch {
    return EMPTY_JSON
  }
}

function parseSentSnapshot(snapshot: string): MensagensEnviadas {
  try {
    const value: unknown = JSON.parse(snapshot)
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
    return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string'))
  } catch {
    return {}
  }
}

function chaveDataLocal(data: Date) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`
}

function rotuloCobradoHoje(dataISO: string | undefined) {
  if (!dataISO) return undefined
  const data = new Date(dataISO)
  if (Number.isNaN(data.getTime()) || chaveDataLocal(data) !== chaveDataLocal(new Date())) return undefined
  const hora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(data)
  return `Cobrado às ${hora}`
}

async function copiar(texto: string) {
  try {
    await navigator.clipboard.writeText(texto)
    return true
  } catch {
    try {
      const campo = document.createElement('textarea')
      campo.value = texto
      campo.style.position = 'fixed'
      campo.style.opacity = '0'
      document.body.appendChild(campo)
      campo.select()
      const copiou = document.execCommand('copy')
      document.body.removeChild(campo)
      return copiou
    } catch {
      return false
    }
  }
}

export function CentralCobranca({
  cobrancas,
  pagamentoIdsPorMembro,
  recentes,
  mensagemGrupo,
  erroGrupo,
  chavePixConfigurada,
  mesReferencia,
  membroInicial,
  erro,
}: CentralCobrancaProps) {
  const toast = useToast()
  const router = useRouter()
  const tomSalvo = useSyncExternalStore(assinarMudancas, getToneSnapshot, () => 'gentil')
  const enviadosSnapshot = useSyncExternalStore(
    assinarMudancas,
    () => getSentSnapshot(mesReferencia),
    () => EMPTY_RECORD,
  )
  const enviados = useMemo(() => parseSentSnapshot(enviadosSnapshot), [enviadosSnapshot])
  const [mensagensEditadas, setMensagensEditadas] = useState<Record<string, string>>({})
  const [enviadosNaFila, setEnviadosNaFila] = useState<string[]>([])
  const [pagamentosMarcados, setPagamentosMarcados] = useState<string[]>([])
  const [membroSelecionado, setMembroSelecionado] = useState(membroInicial ?? null)
  const [membroProcessando, setMembroProcessando] = useState<string | null>(null)

  const tom = tomSalvo as TomMensagem
  const pendentes = cobrancas.filter(cobranca => !pagamentosMarcados.includes(cobranca.membroId))
  const fila = pendentes.filter(cobranca => !enviadosNaFila.includes(cobranca.membroId))
  const cobrancaAtual = fila[0] ?? null
  const cobrancaDaFolha = cobrancas.find(cobranca => cobranca.membroId === membroSelecionado) ?? null
  const totalAberto = pendentes.reduce((total, cobranca) => total + cobranca.total, 0)
  const mensagemAtual = (cobranca: ItemCobranca) => mensagensEditadas[cobranca.membroId] ?? cobranca.mensagens[tom]

  function trocarTom(proximo: TomMensagem) {
    try {
      window.localStorage.setItem(TOM_KEY, proximo)
    } catch {
      toast.warning('Não foi possível salvar sua preferência de tom')
    }
    notificarMudancas()
    setMensagensEditadas({})
  }

  async function copiarMensagem(cobranca: ItemCobranca) {
    const copiou = await copiar(mensagemAtual(cobranca))
    if (copiou) toast.success('Copiado')
    else toast.error('Não foi possível copiar a mensagem')
  }

  async function copiarPix(cobranca: ItemCobranca) {
    if (!cobranca.pixCopiaECola) return
    const copiou = await copiar(cobranca.pixCopiaECola)
    if (copiou) toast.success('Copiado')
    else toast.error('Não foi possível copiar o PIX')
  }

  function registrarEnvio(cobranca: ItemCobranca) {
    const dataISO = new Date().toISOString()
    try {
      const proximo = { ...enviados, [cobranca.membroId]: dataISO }
      window.localStorage.setItem(getSentKey(mesReferencia), JSON.stringify(proximo))
      notificarMudancas()
    } catch {
      toast.warning('A mensagem foi aberta, mas não foi possível salvar o horário do envio')
    }
    setEnviadosNaFila(atual => atual.includes(cobranca.membroId) ? atual : [...atual, cobranca.membroId])
  }

  function enviarWhatsApp(cobranca: ItemCobranca, daFolha = false) {
    const texto = mensagemAtual(cobranca)
    window.open(linkWhatsApp(cobranca.telefone, texto), '_blank', 'noopener,noreferrer')
    registrarEnvio(cobranca)
    toast.success('Cobrança aberta no WhatsApp')
    if (daFolha) fecharFolha()
  }

  function abrirFolha(membroId: string) {
    setMembroSelecionado(membroId)
    router.replace(`/cobrar?membro=${encodeURIComponent(membroId)}`, { scroll: false })
  }

  function fecharFolha() {
    setMembroSelecionado(null)
    router.replace('/cobrar', { scroll: false })
  }

  async function marcarPago(cobranca: ItemCobranca) {
    const ids = pagamentoIdsPorMembro[cobranca.membroId] ?? []
    if (!ids.length) {
      toast.error('Não encontramos parcelas abertas para marcar')
      return
    }
    setMembroProcessando(cobranca.membroId)
    let resultado: Awaited<ReturnType<typeof marcarVariosPagos>>
    try {
      resultado = await marcarVariosPagos(ids)
    } catch {
      toast.error('Não foi possível marcar o pagamento')
      return
    } finally {
      setMembroProcessando(null)
    }
    if ('error' in resultado) {
      toast.error(resultado.error ?? 'Não foi possível marcar o pagamento')
      return
    }

    setPagamentosMarcados(atual => atual.includes(cobranca.membroId) ? atual : [...atual, cobranca.membroId])
    router.refresh()
    toast.show({
      message: `${cobranca.nome} marcado como pago`,
      duration: 8000,
      action: {
        label: 'Desfazer',
        onClick: async () => {
          try {
            const desfeito = await desfazerVarios(ids)
            if ('error' in desfeito) {
              toast.error(desfeito.error ?? 'Não foi possível desfazer o pagamento')
              return
            }
            setPagamentosMarcados(atual => atual.filter(id => id !== cobranca.membroId))
            router.refresh()
            toast.success('Pagamento desfeito')
          } catch {
            toast.error('Não foi possível desfazer o pagamento')
          }
        },
      },
    })
  }

  if (erro) {
    return (
      <div className="space-y-5">
        <Card className="flex items-start gap-3 border-app-warn/30 bg-app-warn/5">
          <AlertCircle aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-app-warn" />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-app-text">Não foi possível carregar suas cobranças</p>
            <p className="mt-1 text-sm text-app-muted">{erro}</p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => router.refresh()}>Tentar de novo</Button>
        </Card>
        <RelatorioGrupoCard texto={mensagemGrupo} erro={erroGrupo} />
      </div>
    )
  }

  return (
    <>
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.12fr)_minmax(300px,0.88fr)] lg:items-start">
        <div className="min-w-0 space-y-4">
          <section aria-labelledby="fila-titulo" className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="fila-titulo" className="text-[13px] font-medium uppercase tracking-[0.08em] text-app-subtle">Fila de cobrança</h2>
                <p className="mt-1 text-sm text-app-muted">{pendentes.length ? `${pendentes.length} ${pendentes.length === 1 ? 'pessoa' : 'pessoas'} · ${formatCurrency(totalAberto)} em aberto` : 'Seu mês está fechado'}</p>
              </div>
              <span className="text-xs text-app-subtle">Escolha o tom da mensagem</span>
            </div>
            <SegmentedControl
              aria-label="Tom da mensagem de cobrança"
              options={tons}
              value={tom}
              onChange={trocarTom}
            />

            {!chavePixConfigurada && (
              <p className="flex items-start gap-2 rounded-app-sm border border-app-line bg-app-elevated/70 px-3.5 py-3 text-sm text-app-muted">
                <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-app-warn" />
                <span>Configure uma chave PIX para incluir QR e copia-e-cola com o valor exato. <Link className="font-medium text-app-accent hover:underline" href="/configuracoes">Configurações</Link></span>
              </p>
            )}

            {pendentes.length === 0 ? (
              <EmptyState title="Ninguém para cobrar. Que paz." description="Todo mundo já acertou a contribuição deste mês." icon={<Check aria-hidden className="h-7 w-7" />} />
            ) : cobrancaAtual ? (
              <CobrancaCartao
                cobranca={cobrancaAtual}
                tom={tom}
                mensagem={mensagemAtual(cobrancaAtual)}
                cobradoEm={rotuloCobradoHoje(enviados[cobrancaAtual.membroId])}
                posicao={Math.min(enviadosNaFila.length + 1, pendentes.length)}
                totalNaFila={pendentes.length}
                processandoPagamento={membroProcessando === cobrancaAtual.membroId}
                onMensagemChange={mensagem => setMensagensEditadas(atual => ({ ...atual, [cobrancaAtual.membroId]: mensagem }))}
                onEnviar={() => enviarWhatsApp(cobrancaAtual)}
                onCopiarMensagem={() => void copiarMensagem(cobrancaAtual)}
                onCopiarPix={() => void copiarPix(cobrancaAtual)}
                onAbrirPix={() => abrirFolha(cobrancaAtual.membroId)}
                onMarcarPago={() => void marcarPago(cobrancaAtual)}
              />
            ) : (
              <EmptyState
                title="Você já percorreu a fila."
                description="As cobranças continuam em aberto. Você pode rever a fila quando quiser."
                icon={<MessageCircle aria-hidden className="h-7 w-7" />}
                action={<Button variant="secondary" onClick={() => setEnviadosNaFila([])}>Rever cobranças</Button>}
              />
            )}
          </section>
        </div>

        <aside className="min-w-0 space-y-5">
          <RelatorioGrupoCard texto={mensagemGrupo} erro={erroGrupo} />
          <Card className="space-y-4">
            <SectionHeader title="Pagamentos recentes" />
            {recentes.length ? (
              <div className="divide-y divide-app-line">
                {recentes.map(pagamento => (
                  <div key={pagamento.id} className="flex min-w-0 items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <Avatar nome={pagamento.nome} cor={pagamento.corAvatar} size="sm" status="paid" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-app-text">{pagamento.nome}</p>
                      <p className="truncate text-xs text-app-muted">{formatCurrency(pagamento.valor)} · {formatMonthYear(pagamento.mesReferencia)}</p>
                      <p className="truncate text-xs text-app-subtle">Recebido em {formatDateTime(pagamento.dataPagamento)}</p>
                    </div>
                    <ReciboButton pagamento={pagamento} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-app-sm bg-app-elevated px-3.5 py-4 text-sm text-app-muted">Os pagamentos recebidos aparecerão aqui.</p>
            )}
          </Card>
          {pendentes.length > 0 && (
            <Card padding="sm" className="flex items-center gap-3 text-sm text-app-muted">
              <Users aria-hidden className="h-4 w-4 shrink-0 text-app-accent" />
              <span>Quando todos pagarem, a fila fecha sozinha.</span>
            </Card>
          )}
        </aside>
      </div>

      <PixCobrancaSheet
        cobranca={cobrancaDaFolha}
        mensagem={cobrancaDaFolha ? mensagemAtual(cobrancaDaFolha) : ''}
        onClose={fecharFolha}
        onMensagemChange={mensagem => {
          if (!cobrancaDaFolha) return
          setMensagensEditadas(atual => ({ ...atual, [cobrancaDaFolha.membroId]: mensagem }))
        }}
        onEnviar={() => {
          if (cobrancaDaFolha) enviarWhatsApp(cobrancaDaFolha, true)
        }}
        onCopiarPix={() => {
          if (cobrancaDaFolha) void copiarPix(cobrancaDaFolha)
        }}
      />
    </>
  )
}
