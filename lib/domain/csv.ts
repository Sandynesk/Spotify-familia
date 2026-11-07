import type { ColunaCsv } from '../../types/domain'

function descreverColuna<T extends object>(coluna: ColunaCsv<T>): { chave: keyof T; titulo: string } {
  return typeof coluna === 'object' ? { chave: coluna.chave, titulo: coluna.titulo } : { chave: coluna, titulo: String(coluna) }
}

function escapar(valor: unknown): string {
  const texto = valor === null || valor === undefined
    ? ''
    : valor instanceof Date
      ? valor.toISOString()
      : typeof valor === 'number'
        ? new Intl.NumberFormat('pt-BR', { useGrouping: false, maximumFractionDigits: 20 }).format(valor)
        : String(valor)
  return /[;"\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto
}

/** Gera CSV para Excel pt-BR, com BOM UTF-8, ponto e vírgula e campos escapados. */
export function gerarCsv<T extends object>(linhas: T[], colunas: ColunaCsv<T>[]): string {
  const descritas = colunas.map(descreverColuna)
  const registros = [
    descritas.map(c => escapar(c.titulo)).join(';'),
    ...linhas.map(linha => descritas.map(c => escapar(linha[c.chave])).join(';')),
  ]
  return `\uFEFF${registros.join('\r\n')}`
}
