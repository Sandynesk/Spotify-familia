# SpotiFamília PWA

## Componentes

`ServiceWorkerRegister` é incluído no layout raiz e registra `/sw.js` apenas no build de produção, fora de iframes. `InstallPrompt` fica exportado em `components/pwa/InstallPrompt.tsx` para o dono da tela **Mais** encaixar quando a integração estiver pronta; ele não foi incluído em nenhuma tela nesta entrega.

## URLs geradas

| URL | Conteúdo |
| --- | --- |
| `/manifest.webmanifest` | Manifesto com escopo, atalhos e ícones instaláveis |
| `/icon` | Favicon PNG gerado pelo Next, 32 × 32 |
| `/apple-icon` | Apple touch icon PNG gerado pelo Next, 180 × 180 |
| `/icons/favicon.svg` | Favicon SVG, 32 × 32 |
| `/icons/apple-touch-icon.svg` | Ícone Apple SVG, 180 × 180 |
| `/icons/icon-192.svg` | Ícone normal, 192 × 192 |
| `/icons/icon-512.svg` | Ícone normal, 512 × 512 |
| `/icons/icon-maskable-192.svg` | Ícone maskable, 192 × 192 |
| `/icons/icon-maskable-512.svg` | Ícone maskable, 512 × 512 |
| `/sw.js` | Service worker de cache offline básico |
| `/offline` | Página exibida quando uma navegação falha sem rede |

## Testar a instalação

1. Rode `npm run build` e depois `npx next start -p 3204`.
2. Abra `http://localhost:3204/manifest.webmanifest` e confira os dados e as URLs dos ícones. Verifique se os SVGs acima e `/sw.js` respondem com status 200; as dimensões estão declaradas no `width`, `height` e `viewBox` de cada SVG.
3. Em Chrome/Edge no desktop ou Android, abra o app em `http://localhost:3204`, aguarde o evento de instalação e escolha **Instalar** no menu do navegador. O `beforeinstallprompt` só aparece quando o navegador aceita os critérios de instalação; para testar o cartão, monte `<InstallPrompt />` em uma tela interna como **Mais**.
4. Em iPhone/iPad, abra o endereço em HTTPS no Safari, toque em **Compartilhar → Adicionar à Tela de Início** e confira o nome e o ícone. O cartão traz a mesma instrução e não aparece quando a página já está instalada.
5. Para testar o modo offline, visite `/offline` uma vez com rede, desligue a conexão e navegue para outra rota; o service worker usa a página `/offline` como fallback sem guardar HTML autenticado.

## Decisões e pendências

- Os PNGs de favicon e Apple touch icon usam `ImageResponse`; os tamanhos do manifesto são SVGs estáticos, com o símbolo derivado da geometria da marca. O ícone normal ocupa cerca de 62% da tela e o maskable mantém área segura central de cerca de 50%.
- A navegação usa rede primeiro e só recebe `/offline` como fallback. HTML de navegação nunca entra no Cache Storage; somente arquivos de `/_next/static/` são gravados em cache, além do offline e dos ícones pré-carregados.
- O registro do service worker roda apenas em produção e fora de iframe. O convite lê o estado do navegador com `useSyncExternalStore`, reconhece Safari no iOS e salva a dispensa em `localStorage`.
- O botão de tentar novamente é um formulário GET sem JavaScript para continuar funcional quando a página offline for exibida sem os scripts do app.
- **Pendência para o CEO:** montar `<InstallPrompt />` na página **Mais** quando ela estiver disponível; o componente foi exportado e não foi encaixado em nenhuma tela.

## Verificação desta entrega

- `npx tsc --noEmit`: passou sem saída.
- `npx eslint app/layout.tsx app/manifest.ts app/icon.tsx app/apple-icon.tsx app/offline components/pwa public/sw.js`: passou sem erros.
- `npm run build`: passou; Next 16.4.5 compilou e gerou `/manifest.webmanifest`, `/icon`, `/apple-icon` e `/offline`.
- Com `npx next start -p 3204`, o manifesto, as duas rotas PNG (32 × 32 e 180 × 180), os seis SVGs, `/sw.js` e `/offline` responderam HTTP 200. O servidor foi encerrado depois da checagem.
