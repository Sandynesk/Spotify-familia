import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/ui/Toast'
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister'

export const metadata: Metadata = {
  applicationName: 'SpotiFamília',
  title: 'SpotiFamília — Gerenciador do Plano Família Spotify',
  description: 'Organize as vagas, pagamentos e cobranças do seu Plano Família Spotify em um só lugar.',
  keywords: ['Spotify', 'plano família', 'gestão', 'pagamentos'],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SpotiFamília',
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'SpotiFamília',
    title: 'SpotiFamília — Gerenciador do Plano Família Spotify',
    description: 'Organize as vagas, pagamentos e cobranças do seu Plano Família Spotify em um só lugar.',
  },
  icons: {
    icon: [
      { url: '/icons/favicon.svg', type: 'image/svg+xml', sizes: '32x32' },
      { url: '/icons/icon-192.svg', type: 'image/svg+xml', sizes: '192x192' },
    ],
    apple: [{ url: '/apple-icon', type: 'image/png', sizes: '180x180' }],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#000000',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <ToastProvider>
          <ServiceWorkerRegister />
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
