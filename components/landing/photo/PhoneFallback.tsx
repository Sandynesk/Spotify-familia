'use client'

// STUB da fundação — o agente "photo" substitui a implementação mantendo PhoneFallbackProps e o export.
export interface PhoneFallbackProps {
  /** tela HTML do beat atual, a ser encaixada na foto hero-fallback */
  screen: React.ReactNode
}

export function PhoneFallback({ screen }: PhoneFallbackProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center md:justify-end md:pr-[12vw]">
      <div className="origin-center scale-[0.6]">{screen}</div>
    </div>
  )
}
