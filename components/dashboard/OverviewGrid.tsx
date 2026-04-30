'use client'

import { useMemo } from 'react'
import type { Membro, Pagamento, PagamentoStatus } from '@/types/database'

interface OverviewGridProps {
  membros: Membro[]
  pagamentos: Pagamento[]
  ano: number
}

const MESES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
]

const STATUS_COLORS: Record<PagamentoStatus, string> = {
  pago: 'bg-[#1DB954]',
  pendente: 'bg-[#FFA500]',
  atrasado: 'bg-[#FF4444]',
}

const STATUS_LABELS: Record<PagamentoStatus, string> = {
  pago: 'Pago',
  pendente: 'Pendente',
  atrasado: 'Atrasado',
}

function getStatusColor(status: string): string {
  return STATUS_COLORS[status as PagamentoStatus] || 'bg-[#535353]'
}

function getStatusLabel(status: string): string {
  return STATUS_LABELS[status as PagamentoStatus] || status
}

export function OverviewGrid({ membros, pagamentos, ano }: OverviewGridProps) {
  const gridData = useMemo(() => {
    const map = new Map<string, Pagamento>()

    pagamentos.forEach(p => {
      const key = `${p.membro_id}-${p.mes_referencia}`
      map.set(key, p)
    })

    return membros.map(membro => {
      const meses = MESES.map((_, index) => {
        const mesRef = `${ano}-${String(index + 1).padStart(2, '0')}-01`
        const pagamento = map.get(`${membro.id}-${mesRef}`)
        return {
          mes: mesRef,
          status: pagamento?.status || 'pendente',
          valor: pagamento?.valor || membro.valor_mensal,
          pagamentoId: pagamento?.id,
        }
      })

      return {
        membro,
        meses,
      }
    })
  }, [membros, pagamentos, ano])

  return (
    <div className="space-y-4">
      {/* Legenda */}
      <div className="flex items-center gap-4 text-xs text-[#B3B3B3]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[#1DB954]" />
          <span>Pago</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[#FFA500]" />
          <span>Pendente</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[#FF4444]" />
          <span>Atrasado</span>
        </div>
      </div>

      {/* Grid com scroll horizontal */}
      <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#0a0a0a]">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-white/5">
              <th className="sticky left-0 z-10 bg-[#0a0a0a] text-left px-4 py-3 text-xs font-medium text-[#B3B3B3] uppercase tracking-wider w-[160px]">
                Membros
              </th>
              {MESES.map(mes => (
                <th key={mes} className="px-2 py-3 text-center text-xs font-medium text-[#B3B3B3] uppercase tracking-wider min-w-[70px]">
                  {mes}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {gridData.map(({ membro, meses }) => (
              <tr key={membro.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                <td className="sticky left-0 z-10 bg-[#0a0a0a] px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                      style={{ backgroundColor: membro.cor_avatar || '#535353' }}
                    >
                      {membro.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{membro.nome}</p>
                      <p className="text-xs text-[#B3B3B3]">
                        R$ {membro.valor_mensal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </td>
                {meses.map(({ mes, status, valor }) => (
                  <td key={mes} className="px-2 py-3 text-center">
                    <div
                      className={`w-8 h-8 mx-auto rounded-lg ${getStatusColor(status)} cursor-pointer hover:scale-110 transition-transform duration-200`}
                      title={`${membro.nome} - ${MESES[new Date(mes + 'T12:00:00').getMonth()]} - ${getStatusLabel(status)} - R$ ${valor.toFixed(2)}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
