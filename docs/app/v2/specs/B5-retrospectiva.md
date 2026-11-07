# B5 — Retrospectiva anual estilo "Wrapped" (`/retrospectiva`)

Leia antes: `docs/app/v2/_REGRAS.md`, `docs/app/v2/DESIGN-V2.md`, `docs/app/v2/B-contratos.md`.
Porta: **3215**.

## A ideia
O "show visual" do app. Uma experiência em **stories** (tela cheia, toque para avançar, barra de progresso no topo como Instagram/Spotify Wrapped) que conta o ano do plano família com números e animações, e termina num cartão para compartilhar no grupo.

## Arquivos que são seus
- `app/(dashboard)/retrospectiva/**`
- `components/wrapped/**` (novo)
- `app/api/retrospectiva/**` (novo)
- `lib/actions/retrospectiva.ts` (novo, se precisar)

## Experiência
- Entrada `/retrospectiva` (ano atual; `?ano=AAAA`): tela de capa com o símbolo da marca animado (as 6 cápsulas entram uma a uma e giram), título "Sua família em 2026", botão "Começar". Se houver < 2 meses de dados: estado vazio explicando.
- **Stories** (7–9, dados de `calcularRetrospectiva` em `lib/domain/wrapped.ts` / `getRetrospectivaData`):
  1. Total arrecadado no ano (número gigante com `NumberTicker`, fundo aurora).
  2. Quanto você economizou vs pagar sozinho.
  3. Meses fechados 100% (12 cápsulas acendendo uma a uma).
  4. O mais pontual (avatar grande, coroa/ícone, score).
  5. O pagamento mais rápido.
  6. O mês mais difícil.
  7. "Seu estilo de cobrador" (rótulo divertido + descrição).
  8. A família (avatares orbitando o símbolo, total de pessoas).
  9. Resumo final para compartilhar.
- Cada story tem paleta própria derivada da marca (menta, ciano, violeta suave, âmbar) com gradientes grandes e tipografia display (Geist, 56–96 px, tracking negativo) — é a única tela onde mais cor é permitida.
- Controles: tocar à direita/esquerda avança/volta, segurar pausa, setas do teclado, `Esc` fecha (volta para `/visao-geral`), botão fechar visível; progresso automático de ~6 s por story (pausa se `prefers-reduced-motion` → avanço manual, sem animações de deslocamento).
- Acessível: cada story tem texto real (não só imagem), `aria-live` ao trocar, botões com rótulo.
- **Compartilhar**: `app/api/retrospectiva/card/route.tsx` gera PNG 1080×1920 (`next/og`) com o resumo (ano, total, meses fechados, mais pontual, símbolo da marca). Botão "Compartilhar" usa `navigator.share` com o arquivo; sem suporte → download.
- Desktop: o story fica num "celular" centralizado (proporção 9:16, cantos 40 px) com o fundo desfocado da cor do story atrás.

## Aceite
- Em `/demo`: fluxo completo de ponta a ponta, sem travar; números batem com Insights; PNG do cartão válido; reduced-motion ok; funciona em 360 px e 1440 px.
- `loading.tsx`/`error.tsx`.
- `tsc`, `eslint "app/(dashboard)/retrospectiva" components/wrapped app/api/retrospectiva`, `npm run build` verdes.
