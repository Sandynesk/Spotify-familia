import Link from 'next/link'
import {
  CalendarDays,
  Clock3,
  Info,
  LogOut,
  Settings2,
  Smartphone,
  Sparkles,
} from 'lucide-react'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'
import { ShortcutListRow } from '@/components/command/ShortcutListRow'
import { BrandSymbol } from '@/components/landing/BrandMark'
import { Card } from '@/components/ui/Card'
import { ListGroup, ListRow } from '@/components/ui/ListGroup'
import { PageHeader } from '@/components/ui/PageHeader'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { getConfiguracoes } from '@/lib/actions/configuracoes'
import { getMembros } from '@/lib/actions/membros'
import { isDemo } from '@/lib/demo/session'
import { getSession } from '@/lib/auth'

export default async function MaisPage() {
  const [membros, configuracoes, demo, session] = await Promise.all([
    getMembros(),
    getConfiguracoes(),
    isDemo(),
    getSession(),
  ])
  const occupiedSlots = Math.min(membros.length + 1, 6)
  const name = session?.user.user_metadata?.name
  const displayName = typeof name === 'string' && name.trim() ? name : 'Seu grupo Família'

  return (
    <div className="space-y-6 pb-5">
      <PageHeader title="Mais" subtitle="Tudo que ajuda a cuidar do seu grupo." />

      <Card variant="hero" padding="lg" className="overflow-hidden">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-app-line bg-app-surface/75">
            <BrandSymbol size={28} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-app-muted">Plano Família</p>
            <h2 className="mt-1 truncate text-[19px] font-semibold tracking-[-0.02em] text-app-text">{displayName}</h2>
            <p className="mt-1 text-sm text-app-muted">{membros.length} {membros.length === 1 ? 'membro ativo' : 'membros ativos'}</p>
          </div>
          <ProgressRing value={(occupiedSlots / 6) * 100} size={76} strokeWidth={6} label={occupiedSlots} caption="de 6 vagas" />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-app-line pt-4">
          <div>
            <p className="text-xs text-app-muted">Vagas usadas</p>
            <p className="mt-1 text-sm font-semibold text-app-text">{occupiedSlots} de 6</p>
          </div>
          <div>
            <p className="text-xs text-app-muted">Total do plano</p>
            <p className="mt-1 text-sm font-semibold text-app-text tabular">{formatMoney(configuracoes?.valor_plano ?? null)}</p>
          </div>
        </div>
      </Card>

      <ListGroup title="Planejar">
        <ListRow title="Agenda" description="Próximos vencimentos" icon={<CalendarDays />} href="/agenda" />
        <ListRow title="Histórico" description="Atividade do seu grupo" icon={<Clock3 />} href="/historico" />
        <ListRow title="Retrospectiva" description="Relembre o ano do plano" icon={<Sparkles />} href="/retrospectiva" />
      </ListGroup>

      <ListGroup title="Conta">
        <ListRow title="Ajustes" description="Plano, PIX e preferências" icon={<Settings2 />} href="/configuracoes" />
      </ListGroup>

      <ListGroup title="App">
        <ListRow
          title="Instalar app"
          description="Adicione o SpotiFamília à tela inicial"
          icon={<Smartphone />}
          href="#instalar-app"
        />
        <div id="instalar-app" className="border-t border-app-line p-3">
          <InstallPrompt />
          <p className="px-2 py-2 text-xs text-app-subtle">A opção de instalação aparece quando seu navegador oferece suporte.</p>
        </div>
      </ListGroup>

      <ListGroup title="Ajuda e conta">
        <ShortcutListRow />
        <ListRow title="Sobre" description="Versão do SpotiFamília" icon={<Info />} value="v2" />
        <form action="/sair" method="post">
          <button type="submit" className="flex min-h-[64px] w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-app-elevated/70 focus-visible:relative focus-visible:outline-none">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-app-xs bg-app-elevated text-app-danger"><LogOut aria-hidden className="h-[18px] w-[18px]" strokeWidth={1.75} /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-medium text-app-danger">Sair</span>
              <span className="mt-0.5 block text-xs text-app-muted">Encerrar esta sessão</span>
            </span>
          </button>
        </form>
      </ListGroup>

      {demo && (
        <Card padding="md" className="space-y-3">
          <div>
            <h2 className="text-[15px] font-semibold text-app-text">Gostou da demonstração?</h2>
            <p className="mt-1 text-sm text-app-muted">Recomece com dados limpos ou crie sua conta para começar.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/demo/reset" className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-app-line-strong bg-app-elevated px-4 text-sm font-semibold text-app-text transition-colors hover:bg-app-raised">
              Recomeçar demonstração
            </Link>
            <Link href="/cadastro" className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-app-accent px-4 text-sm font-semibold text-app-accent-ink transition-colors hover:bg-app-accent-hover">
              Criar minha conta
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}

function formatMoney(value: number | null) {
  if (value === null) return 'Não informado'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
