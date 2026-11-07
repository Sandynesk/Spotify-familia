'use server'

import { createClient } from '@/lib/supabase/server'
import { garantirPagamentos } from '@/lib/utils/payments'
import { calcularDevedores } from '@/lib/utils/devedores'
import { getCurrentMonthISO } from '@/lib/utils/date'
import { gerarPixCopiaECola } from '@/lib/domain/pix'
import { gerarQrSvg } from '@/lib/domain/qrcode'
import { gerarMensagemCobranca, normalizarTelefoneBR, type TomMensagem } from '@/lib/domain/whatsapp'
import type { Membro, Pagamento } from '@/types/database'

export interface ItemCobranca {
  membroId: string
  nome: string
  telefone: string | null
  telefoneWhatsApp: string | null
  meses: string[]
  total: number
  temAtraso: boolean
  mensagens: Record<TomMensagem, string>
  pixCopiaECola: string | null
  qrSvg: string | null
}

/**
 * Dados de cobrança com mensagens nos três tons e PIX individual. O recebedor
 * padrão usa nome `SpotiFamilia` e cidade `BRASIL`, conforme limites do BR Code.
 */
export async function getCobrancaData(): Promise<{ cobrancas: ItemCobranca[] } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }
  await garantirPagamentos(supabase, user.id)
  const { data: membros, error } = await supabase.from('membros').select('*').eq('user_id', user.id).eq('ativo', true).order('nome')
  if (error) return { error: error.message }
  const membrosLista = (membros ?? []) as Membro[]
  const ids = membrosLista.map(m => m.id)
  const { data: pagamentos, error: pagamentosError } = ids.length
    ? await supabase.from('pagamentos').select('*').in('membro_id', ids).lte('mes_referencia', getCurrentMonthISO())
    : { data: [], error: null }
  if (pagamentosError) return { error: pagamentosError.message }
  const { data: configuracoes, error: configError } = await supabase.from('configuracoes').select('chave_pix').eq('user_id', user.id).maybeSingle()
  if (configError) return { error: configError.message }
  const chavePix = configuracoes?.chave_pix ?? null
  const devedores = calcularDevedores(membrosLista, (pagamentos ?? []) as Pagamento[], getCurrentMonthISO())
  const cobrancas: ItemCobranca[] = []
  try {
    for (const devedor of devedores) {
      const pixCopiaECola = chavePix ? gerarPixCopiaECola({ chave: chavePix, valor: devedor.total, nome: 'SpotiFamilia', cidade: 'BRASIL', txid: devedor.membro.id.slice(0, 25) }) : null
      const mensagens = Object.fromEntries((['gentil', 'direto', 'divertido'] as const).map(tom => [tom, gerarMensagemCobranca({ nome: devedor.membro.nome, meses: devedor.meses, total: devedor.total, chavePix: chavePix ?? undefined, pixCopiaECola: pixCopiaECola ?? undefined, tom })])) as Record<TomMensagem, string>
      cobrancas.push({
        membroId: devedor.membro.id,
        nome: devedor.membro.nome,
        telefone: devedor.membro.telefone,
        telefoneWhatsApp: normalizarTelefoneBR(devedor.membro.telefone),
        meses: devedor.meses,
        total: devedor.total,
        temAtraso: devedor.temAtraso,
        mensagens,
        pixCopiaECola,
        qrSvg: pixCopiaECola ? await gerarQrSvg(pixCopiaECola) : null,
      })
    }
  } catch (erro) {
    return { error: erro instanceof Error ? erro.message : 'Não foi possível gerar os dados PIX' }
  }
  return { cobrancas }
}
