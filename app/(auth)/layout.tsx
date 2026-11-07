import type { Metadata } from 'next'
import { Geist } from 'next/font/google'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' })

export const metadata: Metadata = {
  title: {
    default: 'Acesse sua conta | SpotiFamília',
    template: '%s | SpotiFamília',
  },
  robots: { index: false, follow: false },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${geist.variable} min-h-dvh bg-app-bg font-app text-app-text antialiased`}>{children}</div>
}
