import { ImageResponse } from 'next/og'
import { BRAND_CAPSULES, BRAND_ROUND, BRAND_VIEW } from '@/components/landing/brand'
import { getRetrospectivaData } from '@/lib/actions/insights'
import { formatCurrency } from '@/lib/utils/currency'

export const dynamic = 'force-dynamic'

const CARD_SIZE = { width: 1080, height: 1920 }

export async function GET(request: Request) {
  const url = new URL(request.url)
  const ano = parseYear(url.searchParams.get('ano'))
  const result = await getRetrospectivaData(ano)

  if ('error' in result) {
    return Response.json({ error: result.error }, { status: result.error === 'Não autenticado' ? 401 : 500 })
  }

  const punctuality = result.membroMaisPontual?.nome ?? 'A família toda'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '100px 88px',
          color: '#f5f5f7',
          backgroundColor: '#050807',
          backgroundImage: 'radial-gradient(ellipse at 50% 10%, rgb(72 229 178 / 0.2), transparent 48%), radial-gradient(ellipse at 8% 92%, rgb(100 168 255 / 0.16), transparent 48%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          <svg width="52" height="52" viewBox={`0 0 ${BRAND_VIEW} ${BRAND_VIEW}`}>
            {BRAND_CAPSULES.map((path, index) => (
              <path key={index} d={path} fill="#48e5b2" stroke="#48e5b2" strokeWidth={BRAND_ROUND * 2} strokeLinejoin="round" />
            ))}
          </svg>
          <span style={{ fontSize: 29, fontWeight: 700, letterSpacing: -1 }}>SpotiFamília</span>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <span style={{ color: '#48e5b2', fontSize: 24, fontWeight: 700, letterSpacing: 6, textTransform: 'uppercase' }}>Retrospectiva da família</span>
          <div style={{ display: 'flex', marginTop: 28, fontSize: 132, fontWeight: 700, letterSpacing: -9, lineHeight: 1 }}>{ano}</div>
          <div style={{ width: 144, height: 4, marginTop: 30, borderRadius: 999, backgroundColor: '#48e5b2' }} />
          <div style={{ display: 'flex', marginTop: 70, color: '#a1a1a6', fontSize: 25, fontWeight: 600, letterSpacing: 4, textTransform: 'uppercase' }}>Entrou no plano</div>
          <div style={{ display: 'flex', marginTop: 10, color: '#48e5b2', fontSize: 100, fontWeight: 700, letterSpacing: -6, lineHeight: 1.05 }}>{formatCurrency(result.totalArrecadado)}</div>

          <div style={{ width: '100%', display: 'flex', gap: 20, marginTop: 72 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '34px 26px', borderRadius: 32, border: '1px solid rgb(255 255 255 / 0.12)', backgroundColor: 'rgb(255 255 255 / 0.045)' }}>
              <div style={{ display: 'flex', color: '#a1a1a6', fontSize: 22, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' }}>Meses completos</div>
              <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 12, color: '#c4b5fd', fontSize: 66, fontWeight: 700, letterSpacing: -4 }}>{result.mesesFechados}<span style={{ color: '#a1a1a6', fontSize: 36 }}> / 12</span></div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '34px 26px', borderRadius: 32, border: '1px solid rgb(255 255 255 / 0.12)', backgroundColor: 'rgb(255 255 255 / 0.045)' }}>
              <div style={{ display: 'flex', color: '#a1a1a6', fontSize: 22, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' }}>Mais pontual</div>
              <div style={{ display: 'flex', marginTop: 16, color: '#fcd34d', fontSize: 38, fontWeight: 700, letterSpacing: -2, textAlign: 'center' }}>{punctuality}</div>
              {result.membroMaisPontual && <div style={{ display: 'flex', marginTop: 7, color: '#f5f5f7', fontSize: 23 }}>Score {result.membroMaisPontual.score}/100</div>}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
          <svg width="114" height="114" viewBox={`0 0 ${BRAND_VIEW} ${BRAND_VIEW}`}>
            {BRAND_CAPSULES.map((path, index) => (
              <path key={index} d={path} fill="#48e5b2" stroke="#48e5b2" strokeWidth={BRAND_ROUND * 2} strokeLinejoin="round" />
            ))}
          </svg>
          <span style={{ color: '#a1a1a6', fontSize: 22, letterSpacing: 1 }}>Um plano, muita parceria.</span>
        </div>
      </div>
    ),
    {
      ...CARD_SIZE,
      headers: {
        'Cache-Control': 'private, no-store',
        'Content-Disposition': `inline; filename="spotifamilia-${ano}.png"`,
      },
    },
  )
}

function parseYear(rawYear: string | null): number {
  const currentYear = new Date().getFullYear()
  if (!rawYear || !/^\d{4}$/.test(rawYear)) return currentYear

  const year = Number(rawYear)
  return Number.isInteger(year) && year >= 2000 && year <= currentYear + 1 ? year : currentYear
}
