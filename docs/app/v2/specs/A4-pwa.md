# A4 — PWA instalável (app de verdade na tela inicial) + ícones da marca

Leia antes: `docs/app/v2/_REGRAS.md` e `docs/app/v2/DESIGN-V2.md` §3.
Porta para testes: **3204**.

## Objetivo
Transformar o SpotiFamília num app instalável no iPhone/Android/desktop, com ícone da marca (anel de 6 cápsulas menta `#48E5B2` sobre preto), tela de abertura, atalhos e funcionamento offline básico.

## Arquivos que são seus
- `app/layout.tsx` (metadata, viewport, `themeColor`, `appleWebApp`, links)
- `app/manifest.ts` (novo — use a convenção de metadata do Next 16; leia o guia em `node_modules/next/dist/docs/`)
- `app/icon.tsx` (existente — trocar pelo símbolo da marca), `app/apple-icon.tsx` (novo), ícones extras em `app/` ou `public/icons/**` conforme o guia do Next
- `public/sw.js` (novo), `public/icons/**` (novo)
- `app/offline/**` (novo — página `/offline`)
- `components/pwa/**` (novo)

Para desenhar o símbolo, importe (sem editar) `BRAND_CAPSULES`, `BRAND_VIEW`, `BRAND_ROUND`, `brandSymbolSvg` de `@/components/landing/brand`.

## O que fazer
1. **Manifest**: name "SpotiFamília", short_name "SpotiFamília", description, `start_url: '/dashboard'`, `scope: '/'`, `display: 'standalone'`, `background_color: '#000000'`, `theme_color: '#000000'`, `lang: 'pt-BR'`, `categories: ['finance','productivity']`, ícones 192/512 (normal e `maskable` com área segura), **shortcuts**: "Cobrar" (`/cobrar`), "Marcar pagamento" (`/dashboard`), "Novo membro" (`/membros/novo`), "Agenda" (`/agenda`).
2. **Ícones** gerados com `next/og` (`ImageResponse`) ou SVG estático: favicon, apple-touch-icon 180, 192, 512, maskable 512. Visual: fundo preto, símbolo menta centralizado (≈ 62% no normal, ≈ 50% no maskable).
3. **Layout raiz**: `viewport.themeColor = '#000000'`, `appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'SpotiFamília' }`, `formatDetection: { telephone: false }`, metadata com `applicationName`, Open Graph básico (título/descrição em pt-BR). Mantenha `ToastProvider` e `lang="pt-BR"`. Não altere o visual de `/` (landing).
4. **Service worker** (`public/sw.js`, sem dependências): pré-cache da página `/offline` e dos ícones; para navegação: network-first com fallback para `/offline`; para estáticos `/_next/static/*`: cache-first; **nunca** cachear respostas de server actions (POST), `/api/*`, `/demo*`, `/sair`, nem HTML autenticado (não guarde navegações no cache; só use o fallback offline). Versione o cache e limpe versões antigas no `activate`.
5. **Registro**: `components/pwa/ServiceWorkerRegister.tsx` (client) registra `/sw.js` só em produção (`process.env.NODE_ENV === 'production'`) e fora de iframes; inclua-o no `app/layout.tsx`.
6. **Convite para instalar**: `components/pwa/InstallPrompt.tsx` (client) — usa `beforeinstallprompt` (Android/desktop) e, no iOS Safari não instalado, mostra instrução "Toque em Compartilhar → Adicionar à Tela de Início". Visual: cartão glass compacto com símbolo, título "Instale o SpotiFamília", botão "Instalar"/"Como instalar" e fechar (lembra a escolha em `localStorage`). Use `useSyncExternalStore` para ler estado do navegador (não faça setState em efeito). **Não** o encaixe em telas (outro worker vai colocar na página "Mais"); exporte e documente.
7. **/offline**: página simples e bonita (fundo preto, símbolo, "Você está sem internet", "Seus dados aparecem assim que a conexão voltar", botão "Tentar de novo" que recarrega).

## Critérios de aceite
- `npm run build` e `npx next start -p 3204`: `GET /manifest.webmanifest` válido; ícones respondem 200 com o tamanho certo; `/offline` renderiza; `sw.js` servido.
- `tsc`, `eslint app/layout.tsx app/manifest.ts app/icon.tsx app/apple-icon.tsx app/offline components/pwa public/sw.js` verdes (se o eslint reclamar de globals do SW, use comentário `/* eslint-env serviceworker */` ou `self` tipado).
- Relatório com a lista de URLs geradas e como testar a instalação.
