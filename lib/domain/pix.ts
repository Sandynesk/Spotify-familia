/** Dados usados para montar um BR Code PIX estático com valor definido. */
export interface GerarPixCopiaEColaInput {
  chave: string
  valor: number
  nome: string
  cidade: string
  txid?: string
  descricao?: string
}

export type TipoChavePix = 'telefone' | 'cpf' | 'cnpj' | 'email' | 'aleatoria'

function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, '')
}

function cpfValido(cpf: string): boolean {
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false
  const digito = (tamanho: number) => {
    const soma = cpf.slice(0, tamanho).split('').reduce((total, numero, indice) => total + Number(numero) * (tamanho + 1 - indice), 0)
    const resto = (soma * 10) % 11
    return (resto === 10 ? 0 : resto) === Number(cpf[tamanho])
  }
  return digito(9) && digito(10)
}

/** Identifica o tipo de chave PIX por formato e normaliza apenas o invólucro. */
export function detectarTipoChave(chave: string): TipoChavePix {
  const limpa = chave.trim()
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpa)) return 'email'
  const digitos = somenteDigitos(limpa)
  if (/^\+?55\s?\(?\d{2}\)?\s?\d{4,5}[- ]?\d{4}$/.test(limpa) || digitos.length === 10 || ((digitos.length === 12 || digitos.length === 13) && digitos.startsWith('55'))) return 'telefone'
  if (digitos.length === 11) return cpfValido(digitos) ? 'cpf' : 'telefone'
  if (digitos.length === 14) return 'cnpj'
  return 'aleatoria'
}

function normalizarChave(chave: string): string {
  const limpa = chave.trim()
  const tipo = detectarTipoChave(limpa)
  if (tipo === 'email') return limpa.toLocaleLowerCase('pt-BR')
  if (tipo === 'cpf' || tipo === 'cnpj') return somenteDigitos(limpa)
  if (tipo === 'telefone') {
    const digitos = somenteDigitos(limpa)
    return `+${digitos.startsWith('55') ? digitos : `55${digitos}`}`
  }
  return limpa
}

function asciiSemAcento(valor: string): string {
  return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7E]/g, '')
}

function campo(id: string, valor: string): string {
  const tamanho = new TextEncoder().encode(valor).length
  if (tamanho > 99) throw new Error(`Campo PIX ${id} excede 99 bytes`)
  return `${id}${String(tamanho).padStart(2, '0')}${valor}`
}

/** CRC-16/CCITT-FALSE: polinômio 0x1021, inicialização 0xFFFF, sem reflexão. */
export function crc16CcittFalse(texto: string): string {
  let crc = 0xffff
  for (const byte of new TextEncoder().encode(texto)) {
    crc ^= byte << 8
    for (let bit = 0; bit < 8; bit++) crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

/**
 * Gera um BR Code EMV PIX estático. Nome/cidade são transliterados para ASCII e
 * limitados ao tamanho permitido pelo padrão; o valor é sempre arredondado a centavos.
 */
export function gerarPixCopiaECola(input: GerarPixCopiaEColaInput): string {
  if (!input.chave.trim()) throw new Error('A chave PIX é obrigatória')
  if (!Number.isFinite(input.valor) || input.valor < 0) throw new Error('O valor PIX deve ser um número não negativo')
  const nome = asciiSemAcento(input.nome).trim().slice(0, 25) || 'SpotiFamilia'
  const cidade = asciiSemAcento(input.cidade).trim().slice(0, 15) || 'BRASIL'
  const chave = normalizarChave(input.chave)
  const descricao = input.descricao ? asciiSemAcento(input.descricao).slice(0, 72) : ''
  const conta = campo('00', 'br.gov.bcb.pix') + campo('01', chave) + (descricao ? campo('02', descricao) : '')
  const valor = (Math.round(input.valor * 100) / 100).toFixed(2)
  const txid = asciiSemAcento(input.txid ?? '').replace(/[^A-Za-z0-9]/g, '').slice(0, 25) || '***'
  const payload = [
    campo('00', '01'),
    campo('26', conta),
    campo('52', '0000'),
    campo('53', '986'),
    campo('54', valor),
    campo('58', 'BR'),
    campo('59', nome),
    campo('60', cidade),
    campo('62', campo('05', txid)),
    '6304',
  ].join('')
  return `${payload}${crc16CcittFalse(payload)}`
}
