export function formatMonthYear(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date + 'T12:00:00') : date
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

export function formatShortMonthYear(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date + 'T12:00:00') : date
  return d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('pt-BR')
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function isOverdue(mesReferencia: string, status: string): boolean {
  if (status === 'pago') return false
  const refDate = new Date(mesReferencia + 'T12:00:00')
  const now = new Date()
  // Considera atrasado se o mês de referência já passou
  return refDate < new Date(now.getFullYear(), now.getMonth(), 1)
}

export function getEffectiveStatus(mesReferencia: string, status: string): 'pendente' | 'pago' | 'atrasado' {
  if (status === 'pago') return 'pago'
  if (isOverdue(mesReferencia, status)) return 'atrasado'
  return 'pendente'
}

export function getCurrentMonthISO(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}-01`
}

/** 'YYYY-MM-01' do mês que contém a data ISO ('YYYY-MM-DD' ou timestamp). */
export function toMonthISO(isoDate: string): string {
  return `${isoDate.slice(0, 7)}-01`
}

/** Meses 'YYYY-MM-01' de `from` até `to`, inclusive. */
export function listMonths(from: string, to: string): string[] {
  const months: string[] = []
  let year = Number(from.slice(0, 4))
  let month = Number(from.slice(5, 7))
  const end = to.slice(0, 7)

  while (true) {
    const key = `${year}-${String(month).padStart(2, '0')}`
    if (key > end) break
    months.push(`${key}-01`)
    month++
    if (month > 12) {
      month = 1
      year++
    }
  }
  return months
}
