export function getMonthStart(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

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

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  d.setDate(1)
  return d
}
