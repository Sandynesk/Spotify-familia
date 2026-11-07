# A1 — Design system v2 + casca do app (shell)

Leia antes: `docs/app/v2/_REGRAS.md` e `docs/app/v2/DESIGN-V2.md` (este último é a sua bíblia; você o implementa).
Porta para testes: **3201**.

## Objetivo
Construir a fundação visual "nível Apple" do SpotiFamília v2: tokens, utilitários CSS, a biblioteca de componentes `components/ui` e a casca de navegação (sidebar desktop + tab bar flutuante no celular + cabeçalho de página). Todas as outras telas serão refeitas DEPOIS, por outros workers, usando o que você entregar — então a API dos componentes precisa ser limpa, tipada, documentada (JSDoc curto) e estável.

## Arquivos que são seus
- `app/globals.css`
- `components/ui/**` (editar os existentes e criar novos)
- `components/layout/**` (pode apagar `FAB.tsx` se não for mais usado)
- `app/(dashboard)/layout.tsx`
- `app/(dashboard)/kit/**` (novo — vitrine de componentes)

Não toque em `components/landing/**`, `app/page.tsx`, telas em `app/(dashboard)/*/page.tsx`, `lib/**`.

## O que fazer
1. **Tokens** (`app/globals.css`): aplique a tabela do DESIGN-V2 §4 (mantendo os nomes `app-*` e acrescentando os novos). Mantenha os tokens `sp-*` e estilos usados pela landing/login (não quebre `/`, `/login`, `/cadastro`). Crie `.app-glass`, `.app-aurora` (animação lenta; parada em reduced-motion), `.app-noise`, `.tabular`, foco global menta. Refine `dialog.app-sheet`. Remova keyframes que ficarem órfãos só se tiver certeza.
2. **Componentes** (DESIGN-V2 §6–7): `motion.ts` (springs), `haptics.ts`, `Button`, `IconButton`, `Card`, `Sheet` (mesma API pública atual; só melhore), `SegmentedControl`, `ProgressRing`, `NumberTicker`, `Badge`/`StatusBadge`, `Avatar` + `AvatarStack`, `ListGroup` + `ListRow`, `SwipeRow`, `EmptyState`, `Skeleton`, `Toast` (manter `success/error/warning/toast` e adicionar `show({message,type,action,duration})` com botão de ação, empilhamento e auto-dismiss; posicionado acima da tab bar no celular), `PageHeader`, `SectionHeader`, `SlotsRing` (importe `BRAND_CAPSULES`, `BRAND_VIEW`, `BRAND_ROUND` de `@/components/landing/brand` — só importar, não editar), `Confetti` (canvas, sem dependência, dispara via função/prop, respeita reduced-motion), `Kbd`, `Input` (refinar: label flutuante ou label acima, erro, ajuda, prefixo "R$"). Exporte também um `components/ui/index.ts` com tudo.
   - **Compatibilidade:** telas antigas importam `Button`, `Card`, `Badge`, `Avatar`, `Input`, `Sheet`, `Skeleton`, `Toast`, `SpotifyLogo` com as props atuais. Elas DEVEM continuar compilando e funcionando (pode mudar o visual; não remova props usadas — rode `npx tsc --noEmit` para conferir).
3. **Casca** (DESIGN-V2 §8):
   - `Sidebar` desktop (264 px; `lg:` em diante): símbolo da marca (use `BrandSymbol`/`BrandMark` de `@/components/landing/BrandMark` — só importar) + "SpotiFamília"; grupos Principal / Planejar / Conta com as rotas do §8; item ativo com fundo elevated + barra menta; dica "⌘K Buscar" (só visual por enquanto, com `data-command-trigger` no botão para o worker do command palette ligar depois); rodapé com cartão do plano (vagas usadas de 6, total mensal) — busque os dados no layout (server) com as actions existentes `getMembros()` de `@/lib/actions/membros` e `getConfiguracoes()` de `@/lib/actions/configuracoes` e passe por props.
   - `BottomNav` celular: tab bar flutuante glass com 5 abas (Hoje, Membros, Cobrar, Insights, Mais), indicador animado com `layoutId`, `safe-area-inset-bottom`, esconde em `lg:`.
   - **Sair**: use `<form action="/sair" method="post">` com um botão (a rota `/sair` é criada por outro worker). Não use o cliente Supabase no shell.
   - Remova o FAB flutuante antigo (a ação "Novo membro" passa a viver nas telas/command palette). Se `Header.tsx` ficar sem uso, mantenha-o compilando (outras telas ainda o importam) mas pode reestilizá-lo para ser um alias fino de `PageHeader`.
   - `app/(dashboard)/layout.tsx`: aplica `font-app`, fundo, sidebar, tab bar, área de conteúdo (`lg:ml-[264px]`, `pb-32 lg:pb-12`), mantém o redirecionamento quando não há sessão (`getSession`).
4. **Vitrine** `app/(dashboard)/kit/page.tsx`: página que mostra TODOS os componentes em todos os estados/variantes (é o que o CEO vai fotografar para aprovar o sistema). Inclua um cartão `hero` com aurora + `NumberTicker` + `ProgressRing` + `SlotsRing` (ex.: 4 de 6 pagas), lista agrupada, swipe row, toasts de exemplo (com Desfazer), estados vazio/skeleton, botões, segmented control.

## Barra de qualidade (o CEO vai reprovar se não atingir)
- Parece Apple Wallet / Apple Fitness / Revolut: preto profundo, hairlines, glass, números grandes, ritmo de espaçamento consistente (múltiplos de 4), cantos generosos, ícones lucide 20 px com traço 1.75.
- Nada de bordas grossas, sombras pesadas, gradientes berrantes, emojis como ícone.
- Funciona em 360 px sem rolagem horizontal; foco visível; reduced-motion respeitado.

## Critérios de aceite
- `tsc`, `eslint app/globals.css components/ui components/layout "app/(dashboard)/layout.tsx" "app/(dashboard)/kit"` e `npm run build` verdes.
- Rotas antigas (`/dashboard`, `/membros`, `/visao-geral`, `/historico`, `/configuracoes`) continuam compilando e renderizando com o novo visual dos tokens.
- `/kit` mostra a vitrine completa.
- Relatório com a API de cada componente (1 linha cada) — os próximos workers vão ler isso.
