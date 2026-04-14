import { TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import type { Pagamento } from '@/types/database'

interface MemberStatsProps {
  pagamentos: Pagamento[]
}

export function MemberStats({ pagamentos: pags }: MemberStatsProps) {
  const total = pags.length
  if (total === 0) return null

  const pagos     = pags.filter(p => p.status === 'pago').length
  const atrasados = pags.filter(p => p.status === 'atrasado').length
  const pendentes = pags.filter(p => p.status === 'pendente').length
  const pct = Math.round((pagos / total) * 100)

  const stats = [
    { label: 'Em dia',    value: pagos,     icon: CheckCircle,  color: '#1DB954' },
    { label: 'Pendente',  value: pendentes,  icon: Clock,        color: '#F59B23' },
    { label: 'Atrasado',  value: atrasados,  icon: AlertCircle,  color: '#E22134' },
  ]

  return (
    <div className="bg-[#181818] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-[#1DB954]" />
        <h3 className="text-white font-semibold text-sm">Estatísticas</h3>
      </div>

      {/* Donut-like % display */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-white text-3xl font-bold">{pct}%</p>
          <p className="text-[#535353] text-xs">pagamentos em dia</p>
        </div>
        {/* Small progress arc (simple bar version) */}
        <div className="w-24 h-24 relative flex items-center justify-center">
          <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#282828" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15.9" fill="none"
              stroke="#1DB954" strokeWidth="3"
              strokeDasharray={`${pct} ${100 - pct}`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-xs font-bold text-white">{pct}%</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="text-center">
            <Icon className="w-4 h-4 mx-auto mb-1" style={{ color }} />
            <p className="text-white font-bold text-lg">{value}</p>
            <p className="text-[#535353] text-xs">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
