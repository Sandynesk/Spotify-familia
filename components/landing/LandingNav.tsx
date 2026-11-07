// STUB da fundação — o agente responsável substitui a implementação mantendo o export.
import Link from 'next/link'
import { LINKS } from './data'

export function LandingNav() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between px-6">
      <span className="font-semibold">SpotiFamília</span>
      <Link href={LINKS.cadastro}>Começar grátis</Link>
    </nav>
  )
}
