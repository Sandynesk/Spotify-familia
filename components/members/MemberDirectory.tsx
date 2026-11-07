'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Search, UserRoundPlus } from 'lucide-react'
import { MemberCard } from '@/components/members/MemberCard'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { SlotsRing } from '@/components/ui/SlotsRing'
import type { Membro, Pagamento } from '@/types/database'
import type { ResumoPontualidade } from '@/types/domain'

export interface MemberDirectoryItem {
  membro: Membro
  pagamento: Pagamento | null
  pontualidade: ResumoPontualidade
}

type MemberFilter = 'todos' | 'devendo' | 'em-dia'

const filters = [
  { value: 'todos', label: 'Todos' },
  { value: 'devendo', label: 'Devendo' },
  { value: 'em-dia', label: 'Em dia' },
] as const

export function MemberDirectory({ membros, vagasOcupadas, vagasPagas }: {
  membros: MemberDirectoryItem[]
  vagasOcupadas: number
  vagasPagas: number
}) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<MemberFilter>('todos')

  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR')
    return membros.filter(({ membro, pagamento }) => {
      const matchesName = !normalizedQuery || membro.nome.toLocaleLowerCase('pt-BR').includes(normalizedQuery)
      const matchesStatus = filter === 'todos'
        || (filter === 'devendo' && pagamento?.status !== 'pago')
        || (filter === 'em-dia' && pagamento?.status === 'pago')
      return matchesName && matchesStatus
    })
  }, [filter, membros, query])

  const showInvites = filter === 'todos' && query.trim() === ''
  const vagasLivres = showInvites ? Math.max(0, 5 - membros.length) : 0

  return (
    <section className="space-y-5" aria-label="Lista de membros">
      <div className="flex items-center gap-3 sm:gap-4">
        <SlotsRing
          occupied={vagasOcupadas}
          paid={vagasPagas}
          size={54}
          label={`${vagasOcupadas} de 6 vagas ocupadas. Você mais ${Math.max(0, 5 - membros.length)} vagas livres.`}
        />
        <div className="min-w-0 flex-1">
          <Input
            label="Buscar por nome"
            id="member-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ex.: Ana"
            prefix={<Search aria-hidden className="h-4 w-4" />}
            autoComplete="off"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedControl
          options={filters}
          value={filter}
          onChange={setFilter}
          aria-label="Filtrar membros por pagamento"
          className="w-full sm:max-w-md"
        />
        <p className="text-xs text-app-subtle sm:text-right">
          Você + 5 pessoas podem dividir o plano.
        </p>
      </div>

      {membros.length === 0 && query.trim() === '' && filter === 'todos' ? (
        <EmptyState
          title="Seu plano começa com quem está por perto"
          description="Convide até cinco pessoas e acompanhe cada contribuição por aqui."
          action={(
            <Link href="/membros/novo" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-app-accent px-5 text-sm font-semibold text-app-accent-ink transition-colors hover:bg-app-accent-hover">
              <UserRoundPlus aria-hidden className="h-4 w-4" />
              Adicionar primeiro membro
            </Link>
          )}
        />
      ) : null}

      {filteredMembers.length === 0 && !(membros.length === 0 && filter === 'todos' && query.trim() === '') ? (
        <EmptyState
          title={query.trim() ? 'Nenhum nome encontrado' : 'Nenhum membro neste filtro'}
          description={query.trim() ? 'Confira a busca ou tente outro nome.' : 'Escolha outro filtro para ver seus membros.'}
          action={(
            <button
              type="button"
              onClick={() => { setQuery(''); setFilter('todos') }}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-app-line bg-app-elevated px-5 text-sm font-semibold text-app-text transition-colors hover:bg-app-raised"
            >
              Limpar filtros
            </button>
          )}
        />
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-live="polite">
        {filteredMembers.map((item) => (
          <MemberCard key={item.membro.id} {...item} />
        ))}

        {Array.from({ length: vagasLivres }, (_, index) => (
          <Link key={`slot-${index}`} href="/membros/novo" className="block h-full rounded-app focus-visible:outline-none">
            <Card
              variant="interactive"
              className="flex h-full min-h-52 flex-col items-center justify-center gap-3 border-dashed px-5 py-6 text-center text-app-muted"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-app-line-strong bg-app-elevated text-app-accent">
                <UserRoundPlus aria-hidden className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold text-app-text">Vaga livre</span>
              <span className="inline-flex items-center gap-1 text-xs">
                Convidar alguém <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
