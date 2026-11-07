import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SpotiFamília',
    short_name: 'SpotiFamília',
    description: 'Organize as vagas, pagamentos e cobranças do seu Plano Família Spotify em um só lugar.',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    lang: 'pt-BR',
    categories: ['finance', 'productivity'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
    ],
    shortcuts: [
      { name: 'Cobrar', short_name: 'Cobrar', url: '/cobrar' },
      { name: 'Marcar pagamento', short_name: 'Pagamento', url: '/dashboard' },
      { name: 'Novo membro', short_name: 'Novo membro', url: '/membros/novo' },
      { name: 'Agenda', short_name: 'Agenda', url: '/agenda' },
    ],
  }
}
