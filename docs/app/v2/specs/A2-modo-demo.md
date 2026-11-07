# A2 — Modo demonstração (app inteiro sem login, dados fictícios) + rota /sair

Leia antes: `docs/app/v2/_REGRAS.md` e `docs/app/v2/DESIGN-V2.md` §1.
Porta para testes: **3202**.

## Por quê
1. **Feature de produto:** qualquer visitante da landing pode "Experimentar sem cadastro" e ver o app funcionando com uma família fictícia.
2. **Ferramenta de trabalho:** o CEO e os outros workers precisam abrir as telas autenticadas para testar e tirar prints, **sem tocar no banco de produção**.

## Arquivos que são seus
- `lib/supabase/server.ts`, `lib/supabase/client.ts`
- `lib/auth.ts`, `proxy.ts`
- `lib/demo/**` (novo)
- `app/demo/**` (novo: rotas `/demo` e `/demo/sair` ou `/demo/reset`)
- `app/sair/**` (novo: rota `/sair`)
- `components/demo/**` (novo)
- `lib/actions/pagamentos.ts`, `lib/actions/membros.ts`, `lib/actions/relatorio.ts`, `lib/actions/configuracoes.ts`, `lib/utils/payments.ts` — **somente** se precisar ajustar algo para funcionar no modo demo (ex.: um join que o cliente fake não suporte). Não mude assinaturas exportadas.

## Como deve funcionar
- `GET /demo` → cria cookies `sf_demo=1` e `sf_demo_sid=<id aleatório>` (httpOnly, sameSite lax, 2 h) e redireciona para `/dashboard`.
- Com o cookie, **todo** o app funciona como se houvesse um usuário logado ("Você (demo)"):
  - `createClient()` em `lib/supabase/server.ts` devolve um **cliente Supabase falso em memória** (`lib/demo/client.ts`) com a mesma superfície usada no projeto: `auth.getUser()`, `auth.getSession()`, `auth.signOut()`, `from(tabela)` com `select(colunas?, { count?, head? })`, `insert`, `update`, `upsert(..., { onConflict, ignoreDuplicates })`, `delete`, filtros `eq neq gt gte lt lte in is not order limit range`, `single()`, `maybeSingle()`, `.select()` após mutação, e `then` (thenable) retornando `{ data, error, count }`. Faça um grep em `lib/`, `app/` e `components/` por `.from(` e `supabase.` para cobrir tudo o que é usado hoje — e implemente de forma genérica o suficiente para os próximos workers (filtros combinados, ordenação múltipla, projeção de colunas simples). Joins tipo `membros!inner(...)`: suporte básico OU reescreva a única consulta que usa isso de forma equivalente sem join.
  - Tipos: o cliente fake é exposto como `SupabaseClient` (cast documentado) para que o resto do código não mude.
  - **Dados fictícios** (`lib/demo/fixtures.ts`), gerados **relativos à data atual** (para nunca envelhecer): plano de **R$ 40,90**, chave PIX de exemplo `demo@spotifamilia.app`, 5 membros ativos + 1 arquivado, valores entre R$ 6,80 e R$ 8,20, `dia_vencimento` variados (5, 10, 10, 15, 20), telefones fictícios no formato `+55 11 9XXXX-XXXX`, histórico desde 14 meses atrás com padrões diferentes: uma pessoa sempre adiantada, uma sempre no dia, uma que atrasa ~1 semana, uma com 2 meses em aberto (devedora), uma que entrou há 4 meses. `data_pagamento` coerente com o padrão (será usado para calcular pontualidade). Nomes brasileiros comuns (ex.: Ana Lima, Bruno Costa, Carla Mendes, Diego Rocha, Eduarda Alves; arquivado: Felipe Souza).
  - **Mutações** (marcar pago, editar, criar membro...) funcionam e ficam guardadas em memória por `sf_demo_sid` (Map em `globalThis`, expira em 2 h). Em ambiente serverless podem se perder entre instâncias — tudo bem; documente.
- `proxy.ts`: com `sf_demo=1`, deixa passar nas rotas protegidas sem chamar o Supabase. Atualize a lista de rotas protegidas para incluir as novas: `/dashboard`, `/membros`, `/cobrar`, `/visao-geral`, `/insights`, `/agenda`, `/historico`, `/retrospectiva`, `/configuracoes`, `/mais`, `/boas-vindas`, `/kit`. Use um prefixo comum ou lista exportada em `lib/demo/routes.ts` para manter em um lugar só.
- `lib/auth.ts` `getSession()` retorna uma sessão fake no demo.
- `/sair` (POST e GET): se demo → apaga cookies demo; senão → `signOut()` do Supabase (server). Redireciona para `/` (demo) ou `/login`.
- `/demo/reset` (GET): recria os dados do sid e volta para `/dashboard`.
- `lib/demo/session.ts`: `export async function isDemo(): Promise<boolean>`.
- `components/demo/DemoBanner.tsx` (server component): se demo, mostra uma faixa discreta glass no topo — "Modo demonstração · nada é salvo de verdade" + botões "Recomeçar" (`/demo/reset`) e "Criar minha conta" (`/cadastro`). Se não for demo, retorna `null`. (O CEO vai encaixá-lo no layout.)
- **Segurança:** o modo demo NUNCA lê nem escreve no Supabase real. O cliente do navegador (`lib/supabase/client.ts`) não precisa de modo demo (login/cadastro), mas garanta que nada no navegador quebre com o cookie demo.

## Critérios de aceite
- `npx next dev -p 3202`, abrir `http://localhost:3202/demo` → cai no `/dashboard` com os dados fictícios; `/membros`, `/membros/<id>`, `/visao-geral`, `/historico`, `/configuracoes` renderizam com dados; marcar pagamento como pago funciona e persiste ao recarregar; `/sair` volta para `/`; depois disso `/dashboard` redireciona para `/login`.
- Sem cookie demo, o comportamento real (Supabase) não muda.
- Teste rápido do cliente fake com o runner nativo do Node (Node 24 roda TypeScript): `lib/demo/__tests__/client.test.ts` usando `node:test` + `node:assert`, só com imports relativos; rode `node --test lib/demo/__tests__/`. Cubra filtros, ordenação, upsert com ignoreDuplicates, update com filtro, single/maybeSingle.
- `tsc`, `eslint lib proxy.ts app/demo app/sair components/demo` e `npm run build` verdes.
