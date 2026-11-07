import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'
import { BRAND_CAPSULES, BRAND_COLORS, BRAND_ROUND, BRAND_VIEW } from '@/components/landing/brand'
import { formatCurrency } from '@/lib/utils/currency'
import { formatMonthYear } from '@/lib/utils/date'

interface ReceiptPayment {
  id: string
  status: string
  mes_referencia: string
  valor: number
  data_pagamento: string | null
  membros: { nome: string } | null
}

export async function GET(_request: Request, { params }: { params: Promise<{ pagamentoId: string }> }) {
  const { pagamentoId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Not found', { status: 404 })

  const { data, error } = await supabase
    .from('pagamentos')
    .select('id,status,mes_referencia,valor,data_pagamento,membros!inner(user_id,nome)')
    .eq('id', pagamentoId)
    .eq('membros.user_id', user.id)
    .maybeSingle()

  if (error || !data) return new Response('Not found', { status: 404 })
  const pagamento = data as unknown as ReceiptPayment
  if (pagamento.status !== 'pago' || !pagamento.data_pagamento || !pagamento.membros?.nome) {
    return new Response('Not found', { status: 404 })
  }

  const nomeMes = formatMonthYear(pagamento.mes_referencia)
  const dataPagamento = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Bahia',
  }).format(new Date(pagamento.data_pagamento))
  const valor = formatCurrency(Number(pagamento.valor))

  return new ImageResponse(
    (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '76px 80px 62px',
        color: '#f5f5f7',
        backgroundImage: 'radial-gradient(circle at 16% 10%, rgba(72, 229, 178, .24), transparent 35%), radial-gradient(circle at 92% 42%, rgba(65, 178, 154, .14), transparent 34%), linear-gradient(180deg, #101715 0%, #050605 52%, #000000 100%)',
        fontFamily: 'Arial, sans-serif',
      }}>
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
            <svg width="54" height="54" viewBox={`0 0 ${BRAND_VIEW} ${BRAND_VIEW}`}>
              {BRAND_CAPSULES.map((path, index) => (
                <path key={index} d={path} fill={BRAND_COLORS.accent} stroke={BRAND_COLORS.accent} strokeWidth={BRAND_ROUND * 2} strokeLinejoin="round" />
              ))}
            </svg>
            <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>SpotiFamília</span>
          </div>
          <span style={{ border: '1px solid rgba(72,229,178,.42)', borderRadius: 999, padding: '11px 18px', color: BRAND_COLORS.accent, fontSize: 18, letterSpacing: 1.2, textTransform: 'uppercase' }}>Recibo</span>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '54px 48px', borderRadius: 36, border: '1px solid rgba(255,255,255,.11)', background: 'rgba(14,14,16,.62)' }}>
          <div style={{ width: 84, height: 84, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 42, border: '1px solid rgba(72,229,178,.4)', background: 'rgba(72,229,178,.12)', marginBottom: 30 }}>
            <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke={BRAND_COLORS.accent} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 12 4 4L19 6" />
            </svg>
          </div>
          <div style={{ display: 'flex', color: '#a1a1a6', fontSize: 20, letterSpacing: 2, textTransform: 'uppercase' }}>Pagamento recebido</div>
          <div style={{ display: 'flex', marginTop: 18, fontSize: 38, fontWeight: 700, letterSpacing: -1.2 }}>{pagamento.membros.nome}</div>
          <div style={{ display: 'flex', marginTop: 12, color: '#a1a1a6', fontSize: 22 }}>{nomeMes}</div>
          <div style={{ display: 'flex', marginTop: 34, color: BRAND_COLORS.accent, fontSize: 76, fontWeight: 700, letterSpacing: -3 }}>{valor}</div>
          <div style={{ display: 'flex', marginTop: 24, color: '#a1a1a6', fontSize: 20 }}>Recebido em {dataPagamento}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 11, color: '#8e8e93', fontSize: 18 }}>
          <span>Uma família em dia, uma playlist mais tranquila.</span>
        </div>
      </div>
    ),
    { width: 1080, height: 1350 },
  )
}
