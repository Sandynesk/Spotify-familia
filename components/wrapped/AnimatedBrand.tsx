'use client'

import { motion } from 'framer-motion'
import { BRAND_CAPSULES, BRAND_ROUND, BRAND_VIEW } from '@/components/landing/brand'

export function AnimatedBrand({ reducedMotion = false, size = 118 }: { reducedMotion?: boolean; size?: number }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={`0 0 ${BRAND_VIEW} ${BRAND_VIEW}`}
      role="img"
      aria-label="Símbolo SpotiFamília, seis cápsulas formando um anel"
      className="drop-shadow-[0_0_30px_rgb(72_229_178_/_0.2)]"
      initial={reducedMotion ? undefined : 'hidden'}
      animate={reducedMotion ? undefined : 'visible'}
      variants={{
        hidden: {},
        visible: {},
      }}
    >
      {BRAND_CAPSULES.map((path, index) => (
        <motion.path
          key={path}
          d={path}
          fill="var(--color-app-accent)"
          stroke="var(--color-app-accent)"
          strokeWidth={BRAND_ROUND * 2}
          strokeLinejoin="round"
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          initial={reducedMotion ? undefined : { opacity: 0, scale: 0.28, rotate: -65 }}
          animate={reducedMotion ? undefined : { opacity: 1, scale: 1, rotate: 0 }}
          transition={reducedMotion ? undefined : { type: 'spring', stiffness: 250, damping: 20, delay: index * 0.11 }}
        />
      ))}
    </motion.svg>
  )
}
