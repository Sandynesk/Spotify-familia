import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Chamado diariamente pelo Vercel Cron (vercel.json) para manter o projeto Supabase
 * ativo: o plano gratuito pausa o banco após 7 dias sem atividade.
 *
 * Usa a anon key, sem sessão: o RLS devolve zero linhas, mas a consulta chega ao
 * Postgres e conta como atividade. Nenhum dado é exposto.
 */
export async function GET(request: Request) {
  // A Vercel envia "Authorization: Bearer <CRON_SECRET>" quando a variável existe.
  const secret = process.env.CRON_SECRET
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  )

  const { error } = await supabase.from('membros').select('id').limit(1)

  if (error) {
    console.error('keep-alive:', error.message)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, at: new Date().toISOString() })
}
