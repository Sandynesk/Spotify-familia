'use client'

import { useState } from 'react'
import { ArrowUpRight, Bell, ChevronRight, Clock3, CreditCard, Plus, Search, Settings2, Sparkles, UsersRound } from 'lucide-react'
import { Avatar, AvatarStack } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Confetti } from '@/components/ui/Confetti'
import { EmptyState } from '@/components/ui/EmptyState'
import { IconButton } from '@/components/ui/IconButton'
import { Input, Textarea } from '@/components/ui/Input'
import { Kbd } from '@/components/ui/Kbd'
import { ListGroup, ListRow } from '@/components/ui/ListGroup'
import { NumberTicker } from '@/components/ui/NumberTicker'
import { PageHeader } from '@/components/ui/PageHeader'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { Sheet } from '@/components/ui/Sheet'
import { Skeleton } from '@/components/ui/Skeleton'
import { SlotsRing } from '@/components/ui/SlotsRing'
import { SwipeRow } from '@/components/ui/SwipeRow'
import { useToast } from '@/components/ui/Toast'
import { formatCurrency } from '@/lib/utils/currency'
import { haptic } from '@/components/ui/haptics'

const examples = [
  { nome: 'Ana Costa', cor: '#48E5B2', status: 'paid' as const },
  { nome: 'Bruno Lima', cor: '#64A8FF', status: 'pending' as const },
  { nome: 'Caio Alves', cor: '#FFB340', status: 'overdue' as const },
  { nome: 'Dani Souza', cor: '#B8A0FF' },
  { nome: 'Elisa Reis', cor: '#FF8294' },
]

/** Component catalog for visual review of the shared v2 design system. */
export function KitShowcase() {
  const [period, setPeriod] = useState<'mês' | 'ano'>('mês')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [confettiTrigger, setConfettiTrigger] = useState(0)
  const { show, success } = useToast()

  return (
    <div className="space-y-9 pb-6">
      <PageHeader
        eyebrow="Fundação visual"
        title="Kit do app"
        subtitle="Componentes compartilhados do SpotiFamília v2."
        actions={<Button variant="secondary" size="sm" icon={<ArrowUpRight />} onClick={() => show({ message: 'Você está vendo a vitrine completa do kit.' })}>Abrir vitrine</Button>}
      />

      <Card variant="hero" padding="lg" className="app-noise min-h-[240px]">
        <Confetti trigger={confettiTrigger} />
        <div className="relative z-10 flex flex-col justify-between gap-8 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <p className="text-sm font-medium text-app-muted">Plano Família · novembro</p>
            <p className="mt-3 flex items-baseline gap-2 text-app-muted">
              <span className="text-xs">já pagaram</span>
              <NumberTicker value={4} className="text-5xl font-semibold tracking-[-0.04em] text-app-text sm:text-6xl" />
              <span className="text-sm">de 6 pagamentos</span>
            </p>
            <p className="mt-3 text-sm text-app-muted">Tudo certo por aqui. Mais duas pessoas fecham o mês.</p>
          </div>
          <div className="flex items-center gap-5 sm:gap-6">
            <ProgressRing value={67} size={82} strokeWidth={7} label="67%" caption="recebido" />
            <div className="text-center">
              <SlotsRing occupied={5} paid={4} size={64} />
              <p className="mt-1 text-[11px] text-app-muted">vagas</p>
            </div>
          </div>
        </div>
        <div className="relative z-10 mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <span className="text-xs text-app-muted">Total recebido</span>
          <NumberTicker value={139.6} decimals={2} format={formatCurrency} className="text-lg font-semibold text-app-text" />
        </div>
      </Card>

      <section>
        <SectionHeader title="Botões e atalhos" actionLabel="Ver ações" href="/configuracoes" />
        <Card className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button icon={<Plus />}>Primário</Button>
            <Button variant="secondary">Secundário</Button>
            <Button variant="ghost">Discreto</Button>
            <Button variant="danger">Perigo</Button>
            <Button variant="glass">Glass</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm">Pequeno</Button>
            <Button size="md">Médio</Button>
            <Button size="lg">Grande</Button>
            <Button loading>Salvando</Button>
            <Button disabled>Desativado</Button>
            <Button variant="secondary" onClick={() => haptic('success')}>Testar toque</Button>
            <IconButton aria-label="Buscar" icon={<Search />} />
            <IconButton aria-label="Notificações" icon={<Bell />} variant="glass" />
            <IconButton aria-label="Configurações" icon={<Settings2 />} variant="ghost" />
            <IconButton aria-label="Remover" icon={<ChevronRight />} variant="danger" />
          </div>
          <div className="flex items-center gap-2 text-sm text-app-muted"><span>Atalho</span><Kbd>⌘</Kbd><Kbd>K</Kbd></div>
        </Card>
      </section>

      <section>
        <SectionHeader title="Superfícies" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Card variant="interactive" padding="sm" role="button" tabIndex={0} onClick={() => success('Cartão interativo selecionado.')} onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              success('Cartão interativo selecionado.')
            }
          }}>
            <p className="text-sm font-semibold text-app-text">Cartão interativo</p>
            <p className="mt-1 text-xs text-app-muted">Hover e pressão com movimento leve.</p>
          </Card>
          <Card padding="none" className="flex min-h-20 items-center justify-between px-4 py-3">
            <span className="text-sm text-app-text">Cartão sem padding</span>
            <ChevronRight className="h-4 w-4 text-app-subtle" />
          </Card>
        </div>
      </section>

      <section>
        <SectionHeader title="Resumo e seleção" />
        <Card className="space-y-5">
          <SegmentedControl
            aria-label="Período"
            options={[{ value: 'mês', label: 'Este mês' }, { value: 'ano', label: 'Este ano' }]}
            value={period}
            onChange={setPeriod}
          />
          <div className="flex flex-wrap items-center gap-6">
            <ProgressRing value={100} label="100%" caption="pago" />
            <ProgressRing value={42} size={72} strokeWidth={6} label="42%" caption="em aberto" color="var(--color-app-warn)" />
            <div>
              <p className="text-xs text-app-muted">Economia do grupo</p>
              <NumberTicker value={84.5} decimals={2} format={formatCurrency} className="mt-1 block text-3xl font-semibold text-app-text" />
            </div>
          </div>
        </Card>
      </section>

      <section>
        <SectionHeader title="Pessoas e estados" description="Status aparece com ícone e texto." />
        <Card className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge status="pago" />
            <Badge status="pendente" />
            <Badge status="atrasado" />
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <Avatar nome="Ana Costa" cor="#48E5B2" size="sm" />
            <Avatar nome="Bruno Lima" cor="#64A8FF" size="md" status="pending" />
            <Avatar nome="Caio Alves" cor="#FFB340" size="lg" status="overdue" />
            <Avatar nome="Dani Souza" cor="#B8A0FF" size="xl" />
            <AvatarStack avatars={examples} max={4} />
          </div>
        </Card>
      </section>

      <section>
        <SectionHeader title="Lista agrupada" actionLabel="Editar" onAction={() => show({ message: 'Lista pronta para editar.', type: 'success' })} />
        <ListGroup footer="Atualizado há poucos instantes.">
          <ListRow title="Membros ativos" description="Pessoas no seu plano" icon={<UsersRound />} value="5" chevron href="/membros" />
          <ListRow title="Próximo vencimento" description="Dia 10 de dezembro" icon={<Clock3 />} value="R$ 34,90" chevron href="/historico" />
          <ListRow title="Método de pagamento" description="Plano Família do Spotify" icon={<CreditCard />} trailing={<Badge status="pago" />} />
        </ListGroup>
      </section>

      <section>
        <SectionHeader title="Ação por gesto" description="Deslize para revelar ou use o botão acessível pelo teclado." />
        <SwipeRow actionLabel="Marcar pago" onAction={() => success('Pagamento marcado como pago.')}>
          <div className="flex min-h-[76px] items-center gap-3 rounded-app border border-app-line bg-app-surface px-4">
            <Avatar nome="Bruno Lima" cor="#64A8FF" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-app-text">Bruno Lima</p>
              <p className="mt-0.5 text-xs text-app-muted">vence hoje</p>
            </div>
            <span className="tabular text-sm font-semibold text-app-text">R$ 34,90</span>
          </div>
        </SwipeRow>
      </section>

      <section>
        <SectionHeader title="Campos" />
        <Card className="grid gap-5 sm:grid-cols-2">
          <Input label="Nome do membro" placeholder="Ex.: Ana Costa" hint="Como aparece na lista" />
          <Input label="Valor mensal" type="number" prefix="R$" defaultValue="34.90" />
          <Input label="E-mail" type="email" placeholder="ana@email.com" error="Confira o formato do e-mail." />
          <Textarea label="Observação" placeholder="Escreva um lembrete curto" hint="Opcional" />
        </Card>
      </section>

      <section>
        <SectionHeader title="Carregando e vazio" />
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="space-y-4" aria-label="Estado carregando">
            <div className="flex items-center gap-3"><Skeleton variant="circle" className="h-10 w-10" /><div className="flex-1 space-y-2"><Skeleton variant="text" className="h-4 w-36" /><Skeleton variant="text" className="h-3 w-24" /></div></div>
            <Skeleton className="h-24 w-full" />
            <Skeleton variant="circle" className="h-8 w-8" />
          </Card>
          <EmptyState
            title="Ainda não há cobranças"
            description="Quando chegar a hora, você encontra tudo por aqui."
            action={<Button icon={<Plus />}>Adicionar membro</Button>}
          />
        </div>
      </section>

      <section>
        <SectionHeader title="Avisos e celebração" />
        <Card className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => show({ message: 'Pagamento confirmado.', type: 'success' })}>Toast positivo</Button>
          <Button variant="secondary" onClick={() => show({ message: 'Há uma vaga perto do vencimento.', type: 'warning' })}>Toast de atenção</Button>
          <Button variant="secondary" onClick={() => show({ message: 'Não foi possível salvar agora.', type: 'error' })}>Toast de erro</Button>
          <Button variant="secondary" onClick={() => show({ message: 'Pagamento marcado como pago.', type: 'success', action: { label: 'Desfazer', onClick: () => success('Ação desfeita.') } })}>Com Desfazer</Button>
          <Button icon={<Sparkles />} onClick={() => setConfettiTrigger((trigger) => trigger + 1)}>Soltar confete</Button>
          <Button variant="glass" onClick={() => setSheetOpen(true)} icon={<ChevronRight />}>Abrir sheet</Button>
        </Card>
      </section>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Cobrança do grupo" description="Veja como a folha modal apresenta um próximo passo.">
        <div className="space-y-4">
          <ListGroup>
            <ListRow title="Valor pendente" value="R$ 34,90" icon={<CreditCard />} />
            <ListRow title="Vencimento" value="Hoje" icon={<Clock3 />} />
          </ListGroup>
          <Button className="w-full" onClick={() => { setSheetOpen(false); success('Mensagem copiada.') }}>Copiar mensagem</Button>
        </div>
      </Sheet>
    </div>
  )
}
