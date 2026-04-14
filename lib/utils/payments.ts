import { addMonths, getMonthStart } from './date'

export interface PaymentToCreate {
  membro_id: string
  mes_referencia: string
  valor: number
  status: 'pendente' | 'atrasado'
}

/**
 * Gera os 12 meses de pagamentos a partir do início do ano atual.
 */
export function generatePayments(membroId: string, valorMensal: number): PaymentToCreate[] {
  const payments: PaymentToCreate[] = []
  const now = new Date()
  const currentMonthStart = getMonthStart(now)
  const currentYearStart = new Date(now.getFullYear(), 0, 1) // 1º de Janeiro do ano atual

  for (let i = 0; i < 12; i++) {
    const month = addMonths(currentYearStart, i)
    const year = month.getFullYear()
    const m = String(month.getMonth() + 1).padStart(2, '0')
    const mesReferencia = `${year}-${m}-01`

    // Meses passados já nascem como atrasado
    const isPast = month < currentMonthStart
    payments.push({
      membro_id: membroId,
      mes_referencia: mesReferencia,
      valor: valorMensal,
      status: isPast ? 'atrasado' : 'pendente',
    })
  }

  return payments
}
