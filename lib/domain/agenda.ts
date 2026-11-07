import type { MembroDominio, PagamentoDominio } from '../../types/domain'

export interface ProximoVencimento {
  membroId: string
  nome: string
  telefone: string | null
  mesReferencia: string
  dataVencimento: string
  valor: number
  status: 'pendente' | 'pago' | 'atrasado'
}

function dataISO(data: Date): string {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`
}

function ultimoDiaDoMes(ano: number, mes: number): number {
  return new Date(ano, mes + 1, 0).getDate()
}

/** Lista vencimentos dos membros ativos na janela pedida, do mais próximo ao mais distante. */
export function proximosVencimentos(
  membros: MembroDominio[],
  pagamentos: PagamentoDominio[],
  hoje: Date,
  dias: number,
): ProximoVencimento[] {
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
  const fim = new Date(inicio)
  fim.setDate(fim.getDate() + Math.max(0, dias))
  const saida: ProximoVencimento[] = []
  for (const membro of membros.filter(m => m.ativo)) {
    const mesCursor = new Date(inicio.getFullYear(), inicio.getMonth(), 1)
    while (mesCursor <= fim) {
      const dataMes = new Date(mesCursor)
      const dia = Math.min(Math.max(1, membro.dia_vencimento), ultimoDiaDoMes(dataMes.getFullYear(), dataMes.getMonth()))
      const vencimento = new Date(dataMes.getFullYear(), dataMes.getMonth(), dia)
      const referencia = `${dataMes.getFullYear()}-${String(dataMes.getMonth() + 1).padStart(2, '0')}-01`
      const pagamento = pagamentos.find(p => p.membro_id === membro.id && p.mes_referencia.slice(0, 7) === referencia.slice(0, 7))
      const vencimentoEmMesAtual = dataMes.getFullYear() === inicio.getFullYear() && dataMes.getMonth() === inicio.getMonth()
      const vencimentoNoIntervalo = vencimento >= inicio && vencimento <= fim
      if (vencimentoNoIntervalo || (vencimentoEmMesAtual && vencimento < inicio && pagamento?.status !== 'pago')) {
        const status = pagamento?.status === 'pago' ? 'pago' : pagamento?.status === 'atrasado' || vencimento < inicio ? 'atrasado' : 'pendente'
        saida.push({ membroId: membro.id, nome: membro.nome, telefone: membro.telefone ?? null, mesReferencia: referencia, dataVencimento: dataISO(vencimento), valor: Number(pagamento?.valor ?? membro.valor_mensal), status })
      }
      mesCursor.setMonth(mesCursor.getMonth() + 1)
    }
  }
  return saida.sort((a, b) => a.dataVencimento.localeCompare(b.dataVencimento) || a.nome.localeCompare(b.nome, 'pt-BR'))
}

function escaparIcs(valor: string): string {
  return valor.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')
}

function dobrarLinha(linha: string): string {
  const partes: string[] = []
  let atual = ''
  let bytes = 0
  for (const caractere of linha) {
    const tamanho = new TextEncoder().encode(caractere).length
    if (bytes + tamanho > 75) {
      partes.push(atual)
      atual = ` ${caractere}`
      bytes = 1 + tamanho
    } else {
      atual += caractere
      bytes += tamanho
    }
  }
  partes.push(atual)
  return partes.join('\r\n')
}

function formatoIcsData(data: Date, incluirHora = false): string {
  const ymd = `${data.getFullYear()}${String(data.getMonth() + 1).padStart(2, '0')}${String(data.getDate()).padStart(2, '0')}`
  return incluirHora ? `${ymd}T${String(data.getHours()).padStart(2, '0')}${String(data.getMinutes()).padStart(2, '0')}00` : ymd
}

function formatoIcsUtc(data: Date): string {
  return data.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

/**
 * Cria um calendário iCalendar com recorrência mensal e lembrete no início do
 * vencimento (às 9h, hora local flutuante). Cada membro recebe UID persistente.
 */
export function gerarIcs(input: { membros: MembroDominio[]; ate: string | Date; nomeCalendario: string }): string {
  const hoje = new Date()
  const limite = input.ate instanceof Date ? new Date(input.ate) : new Date(`${input.ate.slice(0, 10)}T23:59:59`)
  const linhas = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//SpotiFamilia//Agenda de Vencimentos 2.0//PT-BR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    `X-WR-CALNAME:${escaparIcs(input.nomeCalendario)}`,
  ]
  for (const membro of input.membros.filter(m => m.ativo)) {
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), Math.min(membro.dia_vencimento, ultimoDiaDoMes(hoje.getFullYear(), hoje.getMonth())), 9)
    if (inicio < hoje) inicio.setMonth(inicio.getMonth() + 1, Math.min(membro.dia_vencimento, ultimoDiaDoMes(inicio.getFullYear(), inicio.getMonth())))
    if (inicio > limite) continue
    const fim = new Date(inicio)
    fim.setHours(fim.getHours() + 1)
    const uidId = membro.id.replace(/[^A-Za-z0-9._-]/g, '-')
    linhas.push(
      'BEGIN:VEVENT',
      `UID:vencimento-${uidId}@spotifamilia`,
      `DTSTAMP:${formatoIcsUtc(new Date())}`,
      `DTSTART:${formatoIcsData(inicio, true)}`,
      `DTEND:${formatoIcsData(fim, true)}`,
      `RRULE:FREQ=MONTHLY;BYMONTHDAY=${membro.dia_vencimento};UNTIL=${formatoIcsData(limite, true)}`,
      `SUMMARY:${escaparIcs(`Vencimento de ${membro.nome}`)}`,
      `DESCRIPTION:${escaparIcs(`Cobrança mensal de ${membro.valor_mensal.toFixed(2)} para ${membro.nome}.`)}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'TRIGGER:PT0S',
      `DESCRIPTION:${escaparIcs(`Lembrete: vencimento de ${membro.nome} às 9h.`)}`,
      'END:VALARM',
      'END:VEVENT',
    )
  }
  linhas.push('END:VCALENDAR')
  return `${linhas.map(dobrarLinha).join('\r\n')}\r\n`
}
