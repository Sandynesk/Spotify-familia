'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Archive, ChevronDown, RotateCcw, Loader2 } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Sheet } from '@/components/ui/Sheet'
import { useToast } from '@/components/ui/Toast'
import { reativarMembro } from '@/lib/actions/membros'
import type { Membro } from '@/types/database'

interface ArchivedMembersProps {
  membros: Membro[]
}

export function ArchivedMembers({ membros }: ArchivedMembersProps) {
  if (membros.length === 0) return null

  return (
    <details className="group rounded-[var(--radius-app)] border border-app-line bg-app-surface/60 overflow-hidden">
      <summary className="flex items-center justify-between p-4 cursor-pointer list-none min-h-[48px] select-none hover:bg-app-elevated/40 transition-colors">
        <div className="flex items-center gap-2.5">
          <Archive className="w-4 h-4 text-app-subtle" />
          <span className="font-medium text-sm text-app-muted group-hover:text-app-text transition-colors">
            Arquivados ({membros.length})
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-app-subtle transition-transform duration-200 group-open:rotate-180" />
      </summary>

      <div className="p-4 pt-1 space-y-2 border-t border-app-line">
        {membros.map(membro => (
          <ArchivedMemberItem key={membro.id} membro={membro} />
        ))}
      </div>
    </details>
  )
}

function ArchivedMemberItem({ membro }: { membro: Membro }) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const { success, error } = useToast()
  const router = useRouter()

  function handleReativar() {
    startTransition(async () => {
      try {
        const result = await reativarMembro(membro.id)
        if (result && 'error' in result && result.error) {
          error(result.error)
        } else {
          success(`${membro.nome} foi reativado(a) no plano!`)
          setOpen(false)
          router.refresh()
        }
      } catch (err: unknown) {
        error(err instanceof Error ? err.message : 'Erro ao reativar membro')
      }
    })
  }

  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-[var(--radius-app-sm)] bg-app-elevated/40 border border-app-line hover:bg-app-elevated/70 transition-colors">
      <Link
        href={`/membros/${membro.id}`}
        className="flex items-center gap-3 min-w-0 flex-1"
      >
        <Avatar nome={membro.nome} cor={membro.cor_avatar} size="sm" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-app-muted hover:text-app-text truncate transition-colors">
            {membro.nome}
          </p>
          <span className="text-xs text-app-subtle">
            Arquivado
          </span>
        </div>
      </Link>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-[44px] px-3.5 rounded-full border border-app-line bg-app-elevated hover:bg-app-surface text-app-accent font-medium text-xs transition-colors flex items-center gap-1.5 flex-shrink-0"
        aria-label={`Reativar ${membro.nome}`}
      >
        <RotateCcw className="w-3.5 h-3.5 text-app-accent" />
        <span>Reativar</span>
      </button>

      <Sheet
        open={open}
        onClose={() => !pending && setOpen(false)}
        title={`Reativar ${membro.nome}?`}
        description="As cobranças voltam a partir deste mês."
      >
        <div className="mt-4 space-y-4">
          <div className="rounded-[var(--radius-app-sm)] border border-app-line bg-app-elevated p-4">
            <p className="text-xs text-app-muted leading-relaxed">
              O membro voltará a constar na lista de ativos e suas cobranças mensais voltarão a ser geradas automaticamente.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={pending}
              className="flex-1 min-h-[48px] rounded-full border border-app-line bg-app-elevated text-app-text font-medium hover:bg-app-surface transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleReativar}
              disabled={pending}
              className="flex-[2] min-h-[48px] rounded-full bg-app-accent hover:bg-app-accent-hover text-black font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {pending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Reativando...</span>
                </>
              ) : (
                <span>Confirmar reativação</span>
              )}
            </button>
          </div>
        </div>
      </Sheet>
    </div>
  )
}
