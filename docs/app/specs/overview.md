# Worker: Visão Geral (Gemini)

Projeto: `C:\Users\esmsa\Desktop\Organização\Projetos\Spotify-familia`, um app Next.js 16 + Supabase. **Leia primeiro `docs/app/DESIGN.md` inteiro**: tokens, componentes e regras de trabalho são obrigatórios.

## Seus arquivos (só estes)

- `app/(dashboard)/visao-geral/page.tsx`
- `components/dashboard/OverviewGrid.tsx`, `components/dashboard/OverviewChart.tsx`
- novos arquivos em `components/dashboard/` com prefixo `Overview` (ex.: `OverviewMemberCard.tsx`, `OverviewYearSwitcher.tsx`)

## Objetivo

A Visão Geral é o calendário do ano: cada membro × 12 meses. Hoje os quadradinhos só exibem. O usuário quer **marcar ou desmarcar pagamentos direto aqui** e **quitar vários meses atrasados de uma vez**, no celular.

## Dados e ações

`getVisaoGeralData(ano)` (`lib/actions/pagamentos.ts`) retorna `{ membros, pagamentos, ano }`. Os pagamentos já vêm com status efetivo, e cada cobrança tem `id`. Meses sem cobrança (antes do membro entrar) não têm registro; hoje aparecem como "Sem cobrança".

Ações (todas server actions já exportadas):
- `marcarPago(pagamentoId)`;
- `desfazerPagamento(pagamentoId, mesReferencia)`;
- `quitarPendencias(membroId)` → `{ success, quitadas } | { error }`, que quita tudo em aberto até o mês atual.

## O que construir

1. **Seletor de ano** no topo (‹ 2026 ›), via `?ano=` (`searchParams` é Promise no Next 16). Desabilite o "›" no ano atual. Valide o parâmetro: número inteiro entre 2000 e o ano atual + 1; senão use o ano atual.
2. **Celular: um card por membro.**
   - Cabeçalho do card: avatar, nome, valor mensal e quanto deve no ano.
   - Grade 6×2 com os meses (Jan–Jun / Jul–Dez); cada célula tem ≥ 44 px, sigla do mês e cor ou ícone do status (pago ✓, pendente, atrasado !, sem cobrança apagado). O mês atual tem anel de destaque.
   - **Tocar numa célula:**
     - não paga → marca como paga, com feedback otimista (`useOptimistic` ou estado local) e reversão + toast em caso de erro;
     - paga → abre um `Sheet` "Desfazer pagamento de Ana — Mar/2026?" e chama `desfazerPagamento` ao confirmar;
     - sem cobrança → nada (`aria-disabled`).
   - Se o membro tem meses em aberto até o mês atual, mostre o botão **"Quitar N meses"**: `Sheet` de confirmação com o total, depois `quitarPendencias`.
3. **Desktop (`lg:`):** a tabela atual (membros × 12 meses) pode continuar, restilizada com os tokens e com as mesmas interações nas células (botões acessíveis com `aria-label` "Ana, março de 2026, pago. Toque para desfazer").
4. **Gráfico (OverviewChart):**
   - restilize com os tokens: barras verde/laranja/vermelho, grid discreto, tooltip escuro, eixos com `text-app-subtle`;
   - os 3 totais do ano (Recebido, Pendente, Atrasado) numa faixa compacta acima do gráfico, sem 3 cards grandes;
   - no celular, o gráfico vem **depois** dos cards dos membros: a ação é mais importante que o gráfico.
5. **Legenda** clara e estados de vazio e erro.

## Evidência de conclusão

Veja a seção "Regras de trabalho" do DESIGN.md e reporte com `worker_done`.
