'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Archive, ChevronDown, RotateCcw } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Sheet } from '@/components/ui/Sheet'
import { useToast } from '@/components/ui/Toast'
import { arquivarMembro, reativarMembro } from '@/lib/actions/membros'
import type { Membro } from '@/types/database'

interface ArchivedMembersProps {
  membros: Membro[]
}

export function ArchivedMembers({ membros }: ArchivedMembersProps) {
  if (membros.length === 0) return null

  return (
    <details className="group overflow-hidden rounded-app border border-app-line bg-app-surface/60">
      <summary className="flex min-h-12 cursor-pointer list-none select-none items-center justify-between p-4 transition-colors hover:bg-app-elevated/40">
        <span className="flex items-center gap-2.5 text-sm font-medium text-app-muted group-hover:text-app-text">
          <Archive aria-hidden className="h-4 w-4" /> Arquivados ({membros.length})
        </span>
        <ChevronDown aria-hidden className="h-4 w-4 text-app-subtle transition-transform duration-200 group-open:rotate-180" />
      </summary>

      <ul className="space-y-2 border-t border-app-line p-4 pt-3">
        {membros.map((membro) => <ArchivedMemberItem key={membro.id} membro={membro} />)}
      </ul>
    </details>
  )
}

function ArchivedMemberItem({ membro }: { membro: Membro }) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const { show, error } = useToast()
  const router = useRouter()

  function handleUndo() {
    startTransition(async () => {
      const result = await arquivarMembro(membro.id)
      if (result && 'error' in result && result.error) {
        error(result.error)
        return
      }
      show({ message: `${membro.nome} foi arquivado novamente.`, type: 'warning' })
      router.refresh()
    })
  }

  function handleReativar() {
    startTransition(async () => {
      try {
        const result = await reativarMembro(membro.id)
        if (result && 'error' in result && result.error) {
          error(result.error)
          return
        }
        show({ message: `${membro.nome} voltou ao plano.`, action: { label: 'Desfazer', onClick: handleUndo } })
        setOpen(false)
        router.refresh()
      } catch {
        error('Não foi possível reativar o membro.')
      }
    })
  }

  return (
    <li className="flex min-w-0 items-center justify-between gap-3 rounded-app-sm border border-app-line bg-app-elevated/40 p-3 transition-colors hover:bg-app-elevated/70">
      <Link href={`/membros/${membro.id}`} className="flex min-w-0 flex-1 items-center gap-3 rounded-full focus-visible:outline-none">
        <Avatar nome={membro.nome} cor={membro.cor_avatar} size="sm" />
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-app-muted transition-colors hover:text-app-text">{membro.nome}</span>
          <span className="block text-xs text-app-subtle">Arquivado</span>
        </span>
      </Link>

      <Button type="button" size="md" variant="secondary" icon={<RotateCcw />} aria-label={`Reativar ${membro.nome}`} onClick={() => setOpen(true)}>
        Reativar
      </Button>

      <Sheet
        open={open}
        onClose={() => !pending && setOpen(false)}
        title={`Reativar ${membro.nome}?`}
        description="As cobranças voltam a partir deste mês."
      >
        <p className="mt-4 text-sm text-app-muted">O membro voltará à lista de ativos e poderá receber cobranças mensais novamente.</p>
        <div className="mt-5 flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={() => setOpen(false)} disabled={pending}>Cancelar</Button>
          <Button type="button" className="flex-[2]" onClick={handleReativar} loading={pending}>Confirmar reativação</Button>
        </div>
      </Sheet>
    </li>
  )
}
