export function parseMoneyInput(input: string): number | null {
  const raw = input.trim().replace(/R\$/gi, '').replace(/\s/g, '')
  if (!raw) return null
  const normalized = raw.includes(',')
    ? raw.replace(/\./g, '').replace(',', '.')
    : raw
  const value = Number(normalized)
  if (!Number.isFinite(value) || value < 0) return null
  return Math.round(value * 100) / 100
}

export function formatMoneyInput(value: number): string {
  return value.toFixed(2).replace('.', ',')
}
