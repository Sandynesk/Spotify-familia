import { gerarIcs } from '@/lib/domain/agenda'
import { createClient } from '@/lib/supabase/server'
import type { Membro } from '@/types/database'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return new Response('Faça login para baixar seu calendário.', {
      status: 401,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'private, no-store' },
    })
  }

  const { data, error } = await supabase
    .from('membros')
    .select('*')
    .eq('user_id', user.id)
    .eq('ativo', true)
    .order('nome')
  if (error) {
    return new Response('Não foi possível gerar o calendário agora.', {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'private, no-store' },
    })
  }

  const ate = new Date()
  ate.setMonth(ate.getMonth() + 12)
  const membros = ((data ?? []) as Membro[]).map((membro) => ({
    id: membro.id,
    nome: membro.nome,
    telefone: membro.telefone,
    valor_mensal: Number(membro.valor_mensal),
    dia_vencimento: membro.dia_vencimento,
    cor_avatar: membro.cor_avatar,
    ativo: membro.ativo,
    data_entrada: membro.data_entrada,
  }))
  const calendario = gerarIcs({ membros, ate, nomeCalendario: 'SpotiFamília — vencimentos' })

  return new Response(calendario, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="spotifamilia-vencimentos.ics"',
      'Cache-Control': 'private, no-store',
    },
  })
}
