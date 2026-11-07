import { ImageResponse } from 'next/og'
import { BrandIconSymbol } from '@/components/pwa/BrandIconSymbol'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000000',
        }}
      >
        <BrandIconSymbol size={126} />
      </div>
    ),
    { ...size },
  )
}
