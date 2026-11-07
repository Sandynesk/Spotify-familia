# Worker: lógica (Codex)

Projeto: `C:\Users\esmsa\Desktop\Organização\Projetos\Spotify-familia`, um app Next.js 16 + Supabase que gerencia o Plano Família do Spotify. Leia antes:
- `docs/app/DESIGN.md`, seção "Regras de trabalho para os workers", que vale para você também;
- `supabase-schema.sql` e `supabase-migration-2026-11-configuracoes.sql`;
- `types/database.ts`;
- `lib/utils/payments.ts` e `lib/utils/date.ts`.

## Seus arquivos (só estes)

- `lib/actions/configuracoes.ts`
- `lib/actions/relatorio.ts`
- `lib/actions/membros.ts`: **só** implemente `arquivarMembro`, `reativarMembro` e `getMembrosArquivados`. Não mude o resto.
- `lib/actions/pagamentos.ts`: implemente `quitarPendencias` e preencha `devedores` e `custo` em `getDashboardData`. Não mude as outras funções nem as assinaturas.
- `lib/utils/relatorio.ts`
- novo: `lib/utils/relatorio.test.ts`
- novo, se ajudar a testar: funções puras em `lib/utils/devedores.ts`, com teste em `lib/utils/devedores.test.ts`

Hoje todos os stubs fazem `throw new Error('TODO(codex)...')`. As assinaturas e os comentários JSDoc são o contrato, consumido em paralelo pelos workers de interface: **não mude nomes, parâmetros nem tipos de retorno**.

## O que implementar

Padrões a seguir, como nas actions já existentes:
- `const supabase = await createClient()` de `@/lib/supabase/server`;
- `supabase.auth.getUser()`; sem usuário, retorne `{ error: 'Não autenticado' }` (ou `[]`/`null` nas leituras);
- sempre filtre por `user_id` além do RLS;
- depois de escrever, `revalidatePath('/', 'layout')`;
- erros de banco retornam `{ error: mensagem }` e nunca lançam.

1. **`getConfiguracoes` / `salvarConfiguracoes`** (tabela `configuracoes`, PK `user_id`).
   - Salvar é um upsert por `user_id`.
   - Valide no servidor: `valor_plano` é `null` ou um número finito entre 0 e 10000, arredondado a 2 casas. `chave_pix` passa por trim, vazio vira `null`, máximo de 140 caracteres.
   - Se a tabela não existir (SQL ainda não rodado), devolva `{ error }` com mensagem clara: "Rode supabase-migration-2026-11-configuracoes.sql". `getConfiguracoes` devolve `null` nesse caso, sem quebrar a página.

2. **`getDashboardData`**: preencha os campos.
   - **`devedores: Devedor[]`**: para cada membro ativo, as cobranças com `status !== 'pago'` e `mes_referencia <= getCurrentMonthISO()`. Busque todas as do usuário, não só as do mês atual.
     - `meses` em ordem crescente; `total` é a soma de `valor`; `temAtraso` é true se algum mês < mês atual.
     - Inclua só membros com pelo menos uma cobrança em aberto. Ordene por `temAtraso` primeiro, depois `total` decrescente, depois nome.
   - **`custo: ResumoCusto`**:
     - `valorPlano` vem de `configuracoes`, ou `null`;
     - `previstoMes` é a soma dos `valor` das cobranças do mês atual dos membros ativos;
     - `arrecadadoMes` é a parte paga disso;
     - `diferenca = previstoMes - valorPlano`, ou `null`.
   - Mantenha `summary`, `membros` e `pagamentosMes` como estão.
   - Prefira extrair o cálculo para funções puras testáveis (`lib/utils/devedores.ts`).

3. **`quitarPendencias(membroId)`**:
   - confirme que o membro é do usuário;
   - faça um único `update` com `status: 'pago'` e `data_pagamento: now`, para `membro_id = membroId`, `status <> 'pago'` e `mes_referencia <= mês atual`;
   - retorne `quitadas` com o número de linhas afetadas (`.select('id')`).

4. **`arquivarMembro` / `reativarMembro` / `getMembrosArquivados`**: comportamento descrito no JSDoc.
   - Arquivar: `ativo = false` e apagar as cobranças **não pagas** com `mes_referencia > mês atual`. O histórico fica.
   - Reativar: `ativo = true` e `data_entrada = hoje` (formato `YYYY-MM-DD`). Depois chame `garantirPagamentos(supabase, user.id)`.

5. **`gerarTextoRelatorio`**: função pura, formato exato do JSDoc.
   - **Título:** `🎵 *Spotify Família — <Mês por extenso, inicial maiúscula>*` (ex.: "Novembro").
   - **Linhas por grupo**, nesta ordem e com nomes em ordem alfabética (pt-BR) dentro de cada grupo:
     - em dia: `✅ Nome — em dia`;
     - só o mês do relatório em aberto: `⏳ Nome — R$ 6,50 (nov)`;
     - com algum mês anterior: `⚠️ Nome — R$ 13,00 (out, nov)`.
   - **Meses:** abreviações minúsculas jan, fev, mar, abr, mai, jun, jul, ago, set, out, nov, dez. Mês de ano diferente do relatório leva o ano curto, ex.: `dez/25`.
   - **Valores:** `formatCurrency`. Atenção ao espaço não separável do `Intl` (troque por espaço normal no texto final).
   - **Rodapé:** linha em branco; `PIX: <chave>` só se houver chave; `Quem já mandou, só me avisar! 💚`.
   - Se **todos** estiverem em dia: título, linha em branco, `Todo mundo em dia este mês! 🎉 Valeu, pessoal 💚`.

6. **`getRelatorio()`**: monta o `RelatorioInput` do mês atual (membros ativos, pendências até o mês atual, chave PIX das configurações) e retorna `{ texto }`.

## Testes (obrigatório)

`lib/utils/relatorio.test.ts` (e `devedores.test.ts`, se criar), com `node:test` + `node:assert/strict`, rodando com `npx -y tsx --test lib/utils/*.test.ts`. Cubra:
- os 3 tipos de linha e a ordenação;
- mês de outro ano;
- sem chave PIX;
- todos em dia;
- valores com centavos;
- cálculo de `devedores` e `custo`.

## Evidência de conclusão

- Saída dos testes passando.
- `npx tsc --noEmit` sem erros nos seus arquivos.
- `npx eslint lib` limpo.
- Resumo do que fez e de qualquer suposição.

Exit code diferente de zero em testes, tsc ou eslint significa que a tarefa falhou.
