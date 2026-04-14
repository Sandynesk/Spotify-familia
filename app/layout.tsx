import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/ui/Toast'

export const metadata: Metadata = {
  title: 'SpotiFamília — Gerenciador do Plano Família Spotify',
  description: 'Controle quem usa as vagas, quanto cada membro deve pagar e o histórico de cobranças do seu Plano Família Spotify.',
  keywords: ['spotify', 'plano família', 'gestão', 'pagamentos'],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
