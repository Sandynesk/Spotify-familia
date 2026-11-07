import type { Metadata } from 'next'
import { Landing } from '@/components/landing/Landing'

export const metadata: Metadata = {
  title: 'SpotiFamília — Plano Família, finalmente em ordem',
  description:
    'Quem pagou, quem falta e quanto entra no seu Plano Família, num painel que cabe no bolso. Grátis.',
}

export default function HomePage() {
  return <Landing />
}
