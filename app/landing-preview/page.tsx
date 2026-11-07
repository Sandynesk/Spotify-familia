import type { Metadata } from 'next'
import { Landing } from '@/components/landing/Landing'

// Rota temporária de desenvolvimento da nova landing. Removida na F6, quando app/page.tsx passa a usar <Landing />.
export const metadata: Metadata = {
  title: 'SpotiFamília — Plano Família, finalmente em ordem',
  robots: { index: false },
}

export default function LandingPreviewPage() {
  return <Landing />
}
