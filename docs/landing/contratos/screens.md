# Contrato: screens (telas do app em HTML)

## Seus arquivos
`components/landing/screens/**`, **exceto** `size.ts`, que não deve ser editado. Substitua o stub `PhoneScreen.tsx` e crie os arquivos que precisar nessa pasta.

## Interface (exports obrigatórios)
```ts
// PhoneScreen.tsx: a tela do celular 3D e da imagem de reserva, controlada pelo beat
export function PhoneScreen(props: { beat: Beat }): JSX.Element
// DashboardScreen.tsx: o painel do mês num momento fixo (usado nas fotos)
export function DashboardScreen(props: { moment: PanelMoment }): JSX.Element
// PlayerScreen.tsx: player de música genérico (usado nas fotos, nos celulares "da família")
export function PlayerScreen(props: { variant: 0 | 1 | 2 | 3 }): JSX.Element
```
Todas as telas medem **exatamente** `SCREEN_W × SCREEN_H` px (390 × 844), com `borderRadius: SCREEN_RADIUS`, `overflow: hidden` e fundo `#121212`. Não use unidades de viewport (`vw`/`vh`) nem media queries, porque a tela é escalada por transform. Coloque `pointer-events: none` e `select-none`, e sem hover.

## Fidelidade ao app real
Antes de começar, **leia** estes arquivos para copiar o visual (cores, espaçamentos, raios, ícones):
- `components/dashboard/SummaryCards.tsx`, `ProgressBar.tsx`, `MemberRow.tsx`, `MemberList.tsx`
- `components/ui/Avatar.tsx`, `Badge.tsx`, `Card.tsx`
- `components/layout/Header.tsx`, `BottomNav.tsx`
- `app/(dashboard)/dashboard/page.tsx`

**Não importe** desses arquivos: eles usam server actions e toasts. Recrie o visual de forma autocontida dentro da sua pasta.

Dentro das telas, use a **fonte do app**: `fontFamily: '"Outfit", sans-serif'`. A Outfit já é carregada globalmente. Isso faz a tela parecer o app de verdade, em contraste com a Geist da página.

Os dados vêm **só** de `components/landing/data.ts` (`MEMBERS`, `statusOf`, `summaryOf`, `formatBRL`, `MES_REFERENCIA`).

## Estrutura de toda tela
- **Barra de status** (54px): hora `21:30` à esquerda; sinal, wi-fi e bateria (lucide) à direita. **Deixe o centro livre**: a ilha frontal é desenhada por cima pelo 3D e pelas fotos (~126 × 37px, a 11px do topo).
- **Conteúdo** do app.
- **Barra inferior** igual ao `BottomNav` do app, com o indicador de home (pílula branca de 134 × 5px a 8px da base).

## Views do `PhoneScreen` (use `viewOf(beat)` e `momentOf(beat)`)
| view | conteúdo |
|---|---|
| `painel` | O dashboard real: Header ("Olá" + mês), `SummaryCards` 2×2 (Membros ativos, A receber, Já pago, Em atraso), `ProgressBar` (mês, %, "R$ x de R$ y") e a lista de membros com avatar, valor, badge e o botão ✓ nos pendentes e atrasados. |
| `vagas` | "Seu plano · 6 de 6 vagas": grade 3×2 de vagas. **Ao entrar nesta view**, os avatares entram um a um (stagger de 120 ms, scale 0.6→1 + opacity), cada um com o nome embaixo. |
| `valores` | A lista de membros com "R$ 7,00 · dia 10". A linha do **Vô Zé · R$ 5,00** fica destacada (fundo `#1DB954`/10%, borda verde e leve scale). |
| `lista` | "Cobranças de novembro": as 6 cobranças entram em sequência (stagger), com status do momento `inicial`. Mostre um selo discreto: "Criadas automaticamente". |

**Transição entre views:** crossfade + deslocamento de 12px (300 ms).

**Mudanças de momento** dentro do `painel` (beats `paid-*`):
- `inicial → carla-pagou`: o ✓ da Carla recebe um "toque" (círculo verde que expande e some), o badge passa para "Pago" e "Já pago" conta de R$ 26,00 → R$ 33,00. A barra anima 65% → 83% via `scaleX` com `transform-origin: left`.
- `carla-pagou → completo`: o mesmo com o Diego. "Em atraso" vai para R$ 0,00 ("tudo ok"), "Já pago" para R$ 40,00, a barra para 100% e aparece "🎉 Arrecadação completa!", exatamente como no app real.
- Se o beat voltar (scroll para cima), a animação é revertida.
- Os números contam com `animate` do framer-motion e `tabular-nums`; com reduced-motion, trocam direto.

## `DashboardScreen`
O mesmo `painel`, estático, no `moment` recebido.

## `PlayerScreen`
Player de música **genérico, sem marca**. Nada que lembre o Spotify: sem logo, sem o layout característico, sem o verde como cor do player.
- Capa grande em gradiente abstrato (4 variantes de paleta: âmbar/rosa, azul/ciano, violeta/laranja, verde-água/oliva).
- Título e artista fictícios em pt-BR:
  - `0`: "Domingo Lento" · Trio Aurora
  - `1`: "Maré Alta" · Clara Vento
  - `2`: "Rua das Flores" · Os Quintais
  - `3`: "Fim de Tarde" · Vô Zé & Netos
- Barra de progresso fixa, tempo e controles (play/pause, anterior, próxima) com ícones lucide.

## Critérios de aceite
1. Quem conhece o app reconhece o painel na hora: mesmas cores, raios, badges e hierarquia.
2. Números e status **batem 100%** com a tabela do BRIEF §3 em cada momento.
3. Exatamente 390 × 844; nada vaza; legível quando escalado a ~40%.
4. As animações rodam só quando o beat ou momento muda, e o retrocesso funciona.
5. Sem imagens externas; avatares feitos com iniciais e cor, como o `Avatar` do app.
