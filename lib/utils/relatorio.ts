import { formatCurrency } from './currency'

export interface RelatorioLinha {
  nome: string
  /** mes_referencia ('YYYY-MM-01') das cobranças em aberto até o mês do relatório; [] = em dia */
  meses: string[]
  /** soma das cobranças em aberto */
  total: number
}

export interface RelatorioInput {
  /** mês do relatório, 'YYYY-MM-01' */
  mesReferencia: string
  linhas: RelatorioLinha[]
  chavePix: string | null
}

/**
 * Texto pronto para colar no grupo do WhatsApp (formatação do WhatsApp: *negrito*).
 * Formato aprovado pelo usuário:
 *
 *   🎵 *Spotify Família — Novembro*
 *
 *   ✅ Ana — em dia
 *   ✅ Bruno — em dia
 *   ⏳ Carla — R$ 6,50 (nov)
 *   ⚠️ Diego — R$ 13,00 (out, nov)
 *
 *   PIX: seuemail@gmail.com
 *   Quem já mandou, só me avisar! 💚
 */
export function gerarTextoRelatorio(input: RelatorioInput): string {
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  const [ano, mes] = input.mesReferencia.slice(0, 7).split('-').map(Number)
  const titulo = new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long' })
  const nomeMes = titulo.charAt(0).toLocaleUpperCase('pt-BR') + titulo.slice(1)
  const linhas = input.linhas.map(l => ({ ...l, meses: [...l.meses].sort() }))
  const formatMonths = (xs: string[]) => xs.map(x => {
    const [y, m] = x.slice(0, 7).split('-').map(Number)
    return `${meses[m - 1]}${y !== ano ? `/${String(y).slice(-2)}` : ''}`
  }).join(', ')
  const currency = (value: number) => formatCurrency(value).replace(/\u00a0/g, ' ')
  const header = `🎵 *Spotify Família — ${nomeMes}*`
  const ordena = (a: RelatorioLinha, b: RelatorioLinha) => a.nome.localeCompare(b.nome, 'pt-BR')
  const emDia = linhas.filter(l => l.meses.length === 0).sort(ordena)
  if (emDia.length === linhas.length) return `${header}\n\nTodo mundo em dia este mês! 🎉 Valeu, pessoal 💚`
  const soAtual = linhas.filter(l => l.meses.length && l.meses.every(m => m.slice(0, 7) === input.mesReferencia.slice(0, 7))).sort(ordena)
  const atrasados = linhas.filter(l => l.meses.some(m => m.slice(0, 7) < input.mesReferencia.slice(0, 7))).sort(ordena)
  const output = [header, '', ...emDia.map(l => `✅ ${l.nome} — em dia`), ...soAtual.map(l => `⏳ ${l.nome} — ${currency(l.total)} (${formatMonths(l.meses)})`), ...atrasados.map(l => `⚠️ ${l.nome} — ${currency(l.total)} (${formatMonths(l.meses)})`), '']
  if (input.chavePix) output.push(`PIX: ${input.chavePix}`)
  output.push('Quem já mandou, só me avisar! 💚')
  return output.join('\n')
}
