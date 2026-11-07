# B3 — Insights (`/visao-geral`)

Leia antes: `docs/app/v2/_REGRAS.md`, `docs/app/v2/DESIGN-V2.md`, `docs/app/v2/B-contratos.md`.
Porta: **3213**.

## Arquivos que são seus
- `app/(dashboard)/visao-geral/**`
- `components/dashboard/OverviewChart.tsx`, `OverviewGrid.tsx`, `OverviewMemberCard.tsx`, `OverviewYearSwitcher.tsx` (pode refazer/apagar — confira com grep que ninguém mais importa)
- `components/insights/**` (novo)
- `lib/actions/insights-extra.ts` (novo, se precisar)

## Pergunta da tela
"Como está a saúde do meu plano — estou no lucro ou cobrindo do bolso, e quem é confiável?"

## Conteúdo
- `PageHeader` "Insights" + seletor de ano (`SegmentedControl` ou chevrons) — mantém a navegação por ano existente.
- **Cartão-herói** (momento-assinatura): "Saldo do plano em 2026" — sobra/falta acumulada (arrecadado − valor do plano × meses), `NumberTicker`, cor/ícone/texto indicando positivo/negativo; subtítulo "Você economizou R$ X em relação a pagar sozinho".
- **KPIs** (4 cartões): Taxa de recebimento (%), Tempo médio para receber (dias), Meses fechados 100% (n de 12), Em aberto agora (R$).
- **Gráfico mensal** (recharts, já instalado): barras "previsto" vs "arrecadado" por mês, linha do valor do plano; tooltip escuro customizado; eixos discretos; cores dos tokens (menta para arrecadado, `app-elevated` para previsto, linha `app-warn`). Responsivo.
- **Grade do ano** (refazer `OverviewGrid`): membros × 12 meses, células arredondadas com estado (pago no prazo, pago atrasado, em aberto, futuro, fora do plano) com ícone/legenda acessível; tocar numa célula abre `Sheet` com detalhes e ações (marcar pago/desfazer). Em celular, rolagem horizontal **dentro** do contêiner com coluna de nomes fixa (sticky).
- **Ranking de pontualidade**: pódio com os 3 mais pontuais (score de `lib/domain/pontualidade`) + lista do resto; selos.
- **Previsão**: próximos 3 meses (`previsaoProximosMeses`).
- Cartão-convite para `/retrospectiva` ("Sua retrospectiva de 2026 está pronta").
- Desktop: grid 12 colunas bem distribuído.

## Aceite
- Em `/demo` (ano atual e anterior): números coerentes com a tela Hoje; gráfico legível; grade utilizável no celular; `Sheet` de célula funciona.
- `loading.tsx`/`error.tsx`.
- `tsc`, `eslint "app/(dashboard)/visao-geral" components/dashboard components/insights`, `npm run build` verdes. (Atenção: `components/dashboard` tem arquivos do B1 — só rode o eslint e só edite os seus `Overview*`.)
