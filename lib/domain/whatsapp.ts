import type { MembroDominio } from '../../types/domain'

export type TomMensagem = 'gentil' | 'direto' | 'divertido'

export interface MensagemCobrancaInput {
  nome: string
  meses: string[]
  total: number
  chavePix?: string
  pixCopiaECola?: string
  tom: TomMensagem
  nomeDono?: string
}

export interface LinhaMensagemGrupo {
  nome: string
  meses: string[]
  total: number
}

export interface MensagemGrupoInput {
  mesReferencia: string
  linhas: LinhaMensagemGrupo[]
  chavePix?: string | null
  nomePlano?: string
}

const NOMES_MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

function formatarMes(mes: string): string {
  const numero = Number(mes.slice(5, 7))
  return NOMES_MESES[numero - 1] ?? mes
}

function listaNatural(itens: string[]): string {
  if (itens.length < 2) return itens[0] ?? ''
  if (itens.length === 2) return `${itens[0]} e ${itens[1]}`
  return `${itens.slice(0, -1).join(', ')} e ${itens.at(-1)}`
}

function moeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor).replace(/\u00a0/g, ' ')
}

/** Normaliza telefones brasileiros para uso no caminho de `wa.me`, sem sinal de +. */
export function normalizarTelefoneBR(tel: string | null | undefined): string | null {
  if (!tel) return null
  const digitos = tel.replace(/\D/g, '')
  if (digitos.length === 10 || digitos.length === 11) return `55${digitos}`
  if ((digitos.length === 12 || digitos.length === 13) && digitos.startsWith('55')) return digitos
  return null
}

/** Cria o link wa.me com texto codificado, usando a tela de seleção se não há telefone. */
export function linkWhatsApp(telefone: string | null, texto: string): string {
  const destino = normalizarTelefoneBR(telefone)
  const query = encodeURIComponent(texto)
  return destino ? `https://wa.me/${destino}?text=${query}` : `https://wa.me/?text=${query}`
}

/** Monta uma cobrança em pt-BR, com os meses por extenso e dados PIX no rodapé. */
export function gerarMensagemCobranca(input: MensagemCobrancaInput): string {
  const meses = listaNatural([...input.meses].sort().map(formatarMes))
  const chamada = {
    gentil: `Oi, ${input.nome}! Tudo bem? 😊 Passando com carinho para lembrar da contribuição do Spotify Família referente a ${meses}.`,
    direto: `Oi, ${input.nome}. A contribuição do Spotify Família de ${meses} está em aberto.`,
    divertido: `Oi, ${input.nome}! 🎵 A trilha sonora do mês chegou junto com a contribuição de ${meses}.`,
  }[input.tom]
  const despedida = input.nomeDono ? `Obrigado!\n${input.nomeDono}` : 'Obrigado! 💚'
  const pix = [input.chavePix ? `Chave PIX: ${input.chavePix}` : '', input.pixCopiaECola ? `PIX copia e cola:\n${input.pixCopiaECola}` : ''].filter(Boolean)
  return [chamada, `Total: ${moeda(input.total)}.`, despedida, ...pix].filter(Boolean).join('\n\n')
}

/** Resume a situação do plano para compartilhar no grupo, seguindo o relatório existente. */
export function gerarMensagemGrupo(input: MensagemGrupoInput): string {
  const mes = formatarMes(input.mesReferencia)
  const titulo = input.nomePlano ?? 'Spotify Família'
  const linhas = [...input.linhas].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  const emDia = linhas.filter(l => l.meses.length === 0)
  const abertos = linhas.filter(l => l.meses.length > 0)
  const partes = [`🎵 *${titulo} — ${mes.charAt(0).toLocaleUpperCase('pt-BR') + mes.slice(1)}*`, '']
  partes.push(...emDia.map(l => `✅ ${l.nome} — em dia`))
  partes.push(...abertos.map(l => `⏳ ${l.nome} — ${moeda(l.total)} (${listaNatural([...l.meses].sort().map(formatarMes))})`))
  if (emDia.length === linhas.length) partes.push('Todo mundo em dia este mês! 🎉 Valeu, pessoal 💚')
  else {
    if (input.chavePix) partes.push('', `PIX: ${input.chavePix}`)
    partes.push('', 'Quem já mandou, só me avisar! 💚')
  }
  return partes.join('\n')
}

/** Mensagem curta para acompanhar o comprovante de pagamento. */
export function gerarMensagemAgradecimento(input: { nome: string; mes: string; valor: number }): string {
  return `Valeu, ${input.nome}! Recebi ${moeda(input.valor)} referente a ${formatarMes(input.mes)}. Obrigado por manter o plano em dia! 💚`
}

/** Converte um nome e o mês de referência em uma linha útil para mensagens de grupo. */
export function resumoMembroParaGrupo(membro: MembroDominio, meses: string[], total: number): LinhaMensagemGrupo {
  return { nome: membro.nome, meses: [...meses], total }
}
