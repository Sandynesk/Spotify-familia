# B1 — Tela "Hoje" (dashboard) — o coração do app

Leia antes: `docs/app/v2/_REGRAS.md`, `docs/app/v2/DESIGN-V2.md`, `docs/app/v2/B-contratos.md`.
Porta: **3211**.

## Pergunta que a tela responde em 2 segundos
"Quanto ainda falta receber este mês, de quem, e qual é a próxima coisa que eu faço?"

## Arquivos que são seus
- `app/(dashboard)/dashboard/**`
- `components/dashboard/DashboardCustoCard.tsx`, `DashboardMonthHeader.tsx`, `DashboardSkeleton.tsx`, `DevedoresCard.tsx`, `MemberList.tsx`, `MemberRow.tsx`, `ProgressBar.tsx`, `SummaryCards.tsx` (pode apagar os que ficarem sem uso — confira com grep que nenhum outro arquivo importa)
- `components/hoje/**` (novo)
- `lib/actions/hoje.ts` (novo, se precisar)

## Layout (mobile first)
1. **Cabeçalho**: saudação contextual ("Boa noite" + mês por extenso), avatar/atalho de busca à direita.
2. **Cartão-herói** (`Card variant="hero"`, aurora — o momento-assinatura): número grande "R$ X recebidos de R$ Y" com `NumberTicker`; `SlotsRing` mostrando as 6 vagas (ocupadas × pagas este mês); frase de estado ("Faltam R$ 13,64 de 2 pessoas" / "Mês fechado. Tudo pago 🎉" — sem emoji no texto do app; use ícone); saldo do plano (sobra/falta vs valor do plano, de `lib/domain/insights`).
   - Quando **todos pagaram**: dispara `Confetti` uma vez por mês (guarde em `localStorage` a chave do mês) + `haptic('success')`.
3. **Ações rápidas** (linha de pílulas roláveis): "Cobrar pendentes" → `/cobrar`, "Marcar vários" (entra no modo seleção), "Novo membro" → `/membros/novo`, "Agenda" → `/agenda`.
4. **Pendentes deste mês** (lista principal): cada membro com avatar, nome, valor, vencimento ("vence dia 10" / "venceu há 3 dias"), `StatusBadge`. Interações:
   - Botão circular "marcar pago" à direita (44 px) **e** `SwipeRow` (deslizar para a esquerda → "Pago"). Ao marcar: otimista, `haptic('light')`, toast "Ana marcada como paga" com **Desfazer** (usa `desfazerPagamento` / `desfazerVarios`).
   - **Modo seleção**: checkboxes, barra inferior flutuante glass "Marcar 3 como pagos · R$ 20,46" (`marcarVariosPagos`), com Desfazer.
   - Tocar na linha → `/membros/<id>`.
5. **Em atraso (meses anteriores)**: cartão de devedores com meses em aberto e total; ação "Quitar" (existente `quitarPendencias`) com confirmação via `Sheet`, e "Cobrar" → `/cobrar?membro=<id>`.
6. **Já pagaram**: lista compacta recolhível com data do pagamento ("pagou dia 4, 2 dias antes").
7. **Próximos vencimentos** (3 itens, de `lib/domain/agenda`), link "Ver agenda".
8. **Primeira vez** (0 membros): `EmptyState` grande "Vamos montar sua família" → `/boas-vindas` e "Adicionar membro".
- **Desktop:** grid 12 colunas: herói + ações (8 col) | próximos vencimentos + saldo (4 col); listas lado a lado.

## Dados
Use `getDashboardData()` e o que mais precisar de `lib/actions/*` e `lib/domain/*`. Se precisar de um agregado novo (ex.: tudo da tela num só round-trip), crie `lib/actions/hoje.ts`.

## Aceite
- Em `/demo`: herói com números corretos; marcar pago/desfazer funciona; modo seleção funciona; confete ao quitar todos (teste marcando todos); 360 px sem rolagem horizontal; reduced-motion sem animações de deslocamento.
- `loading.tsx` e `error.tsx` presentes.
- `tsc`, `eslint "app/(dashboard)/dashboard" components/dashboard components/hoje lib/actions/hoje.ts`, `npm run build` verdes.
