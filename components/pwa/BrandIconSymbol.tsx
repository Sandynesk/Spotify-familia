import {
  BRAND_CAPSULES,
  BRAND_ROUND,
  BRAND_VIEW,
  brandSymbolSvg,
} from '@/components/landing/brand'

const generatedPaths = [...brandSymbolSvg().matchAll(/<path d="([^"]+)"/g)].map((match) => match[1])
const capsulePaths = generatedPaths.length === BRAND_CAPSULES.length ? generatedPaths : BRAND_CAPSULES

export function BrandIconSymbol({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${BRAND_VIEW} ${BRAND_VIEW}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {capsulePaths.map((path, index) => (
        <path
          key={index}
          d={path}
          fill="#48E5B2"
          stroke="#48E5B2"
          strokeWidth={BRAND_ROUND * 2}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
}
