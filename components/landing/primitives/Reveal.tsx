'use client'

import { motion, useReducedMotion } from 'framer-motion'

interface RevealProps {
  children: React.ReactNode
  /** atraso em segundos, para escalonar irmãos */
  delay?: number
  /** deslocamento vertical inicial em px */
  y?: number
  className?: string
  as?: 'div' | 'li' | 'span'
}

/** Entrada suave ao aparecer na tela. Com reduced-motion, o conteúdo já nasce visível. */
export function Reveal({ children, delay = 0, y = 24, className, as = 'div' }: RevealProps) {
  const reduced = useReducedMotion()
  const Tag = motion[as]

  if (reduced) {
    const Static = as
    return <Static className={className}>{children}</Static>
  }

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Tag>
  )
}
