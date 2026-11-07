'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import { Button, Card, ListGroup, ListRow, SegmentedControl, Sheet } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { reajustarValores } from '@/lib/actions/lote'
import { salvarConfiguracoes } from '@/lib/actions/configuracoes'
import { dividirPlano, reajuste } from '@/lib/domain/divisao'
import { formatCurrency } from '@/lib/utils/currency'
import { parseMoneyInput } from '@/components/configuracoes/money'
import type { Membro } from '@/types/database'
import type { MembroDominio } from '@/types/domain'

type Estrategia = 'igual' | 'proporcional'
type AplicarDesde = 'mesAtual' | 'proximoMes'

interface ReajusteSheetProps {
  open: boolean
  onClose: () => void
  membros: Membro[]
  valorPlanoAtual: string
  chavePix: string
  donoPaga: boolean
  onApplied: (novoValor: number) => void
}

export function ReajusteSheet({ open, onClose, membros, valorPlanoAtual, chavePix, donoPaga, onApplied }: ReajusteSheetProps) {
  const router = useRouter()
  const toast = useToast()
  const [pending, startTransition] = useTransition()
  const [novoValorTexto, setNovoValorTexto] = useState(valorPlanoAtual || '40,90')
  const [estrategia, setEstrategia] = useState<Estrategia>('igual')
  const [aplicarDesde, setAplicarDesde] = useState<AplicarDesde>('mesAtual')

  const novoValor = parseMoneyInput(novoValorTexto)
  const ativos = useMemo(() => membros.map((membro): MembroDominio => ({
    id: membro.id,
    nome: membro.nome,
    valor_mensal: Number(membro.valor_mensal),
    dia_vencimento: membro.dia_vencimento,
    ativo: membro.ativo,
    data_entrada: membro.data_entrada,
  })), [membros])
  const preview = useMemo(() => {
    if (novoValor === null || novoValor > 10000) return []
    const parteDono = donoPaga && ativos.length > 0
      ? dividirPlano(novoValor, ativos.length, { donoPaga: true }).parteDono
      : 0
    return reajuste(ativos, Math.max(0, novoValor - parteDono), estrategia)
  }, [ativos, donoPaga, estrategia, novoValor])
  const parteDono = donoPaga && novoValor !== null && ativos.length > 0
    ? dividirPlano(novoValor, ativos.length, { donoPaga: true }).parteDono
    : 0
  const valorValido = novoValor !== null && novoValor <= 10000

  function aplicar() {
    if (!valorValido || novoValor === null) {
      toast.error('Digite um valor de plano válido.')
      return
    }
    const periodo = aplicarDesde === 'mesAtual' ? 'a partir do mês atual' : 'a partir do próximo mês'
    const confirmado = window.confirm(`Aplicar ${formatCurrency(novoValor)} ${periodo} e atualizar os valores de ${preview.length} ${preview.length === 1 ? 'membro' : 'membros'}?`)
    if (!confirmado) return

    startTransition(async () => {
      try {
        const resultado = await reajustarValores(
          preview.map((item) => ({ membroId: item.membroId, novoValor: item.novoValor })),
          { aplicarDesde },
        )
        if ('error' in resultado && resultado.error) {
          toast.error(resultado.error)
          return
        }

        const config = await salvarConfiguracoes({ valor_plano: novoValor, chave_pix: chavePix.trim() || null })
        if ('error' in config && config.error) {
          toast.show({ message: `Valores dos membros atualizados, mas o plano não foi salvo: ${config.error}`, type: 'warning', duration: 7000 })
          return
        }

        onApplied(novoValor)
        toast.success('Novo valor aplicado com sucesso!')
        onClose()
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Não foi possível aplicar o reajuste.')
      }
    })
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Reajustar valores"
      description="Veja como o novo preço fica para cada pessoa antes de aplicar."
      className="sm:max-w-2xl"
    >
      <div className="space-y-5">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-app-text">Novo valor do plano</span>
          <span className="flex min-h-12 items-center gap-2 rounded-app-sm border border-app-line bg-app-elevated px-4 focus-within:border-app-accent focus-within:ring-1 focus-within:ring-app-accent/60">
            <span className="text-sm text-app-muted">R$</span>
            <input
              value={novoValorTexto}
              onChange={(event) => setNovoValorTexto(event.target.value)}
              inputMode="decimal"
              aria-label="Novo valor do plano"
              className="min-w-0 flex-1 bg-transparent py-3 text-base text-app-text outline-none placeholder:text-app-subtle"
              placeholder="40,90"
            />
          </span>
        </label>

        <div className="space-y-2">
          <p className="text-sm font-medium text-app-text">Como dividir entre os membros?</p>
          <SegmentedControl
            aria-label="Estratégia do reajuste"
            value={estrategia}
            onChange={setEstrategia}
            options={[
              { value: 'igual', label: 'Dividir igual' },
              { value: 'proporcional', label: 'Manter proporção' },
            ]}
          />
          <p className="text-xs text-app-subtle">
            {estrategia === 'igual' ? 'Cada pessoa fica com uma parte igual.' : 'Os valores mantêm a proporção atual entre os membros.'}
          </p>
        </div>

        <Card padding="sm" className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-app-text">Parte do dono</p>
            <p className="text-xs text-app-muted">{donoPaga ? 'Incluída como uma vaga pagante' : 'O dono não entra na divisão'}</p>
          </div>
          <p className="shrink-0 text-sm font-semibold tabular text-app-text">{formatCurrency(parteDono)}</p>
        </Card>

        <div className="space-y-2">
          <p className="text-sm font-medium text-app-text">Prévia por membro</p>
          {preview.length ? (
            <ListGroup>
              {preview.map((item) => {
                const Icon = item.diferenca > 0 ? ArrowUp : item.diferenca < 0 ? ArrowDown : Minus
                const tone = item.diferenca > 0 ? 'text-app-warn' : item.diferenca < 0 ? 'text-app-accent' : 'text-app-muted'
                return (
                  <ListRow
                    key={item.membroId}
                    title={item.nome}
                    description={`${formatCurrency(item.valorAnterior)} → ${formatCurrency(item.novoValor)}`}
                    value={(
                      <span className={`inline-flex items-center gap-1 tabular ${tone}`}>
                        <Icon aria-hidden className="h-3.5 w-3.5" />
                        {item.diferenca > 0 ? '+' : ''}{formatCurrency(item.diferenca)}
                      </span>
                    )}
                  />
                )
              })}
            </ListGroup>
          ) : (
            <Card padding="sm"><p className="text-sm text-app-muted">Ainda não há membros ativos para ajustar.</p></Card>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-app-text">Quando começa?</p>
          <SegmentedControl
            aria-label="Início do reajuste"
            value={aplicarDesde}
            onChange={setAplicarDesde}
            options={[
              { value: 'mesAtual', label: 'Mês atual' },
              { value: 'proximoMes', label: 'Próximo mês' },
            ]}
          />
          <p className="text-xs text-app-subtle">Pagamentos já marcados como pagos não mudam.</p>
        </div>

        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={pending}>Cancelar</Button>
          <Button onClick={aplicar} loading={pending} disabled={!valorValido}>
            Aplicar reajuste
          </Button>
        </div>
      </div>
    </Sheet>
  )
}
