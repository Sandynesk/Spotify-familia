# B8 — Casca v2: Command Palette (⌘K), atalhos, página "Mais" e integrações globais

Leia antes: `docs/app/v2/_REGRAS.md`, `docs/app/v2/DESIGN-V2.md`, `docs/app/v2/B-contratos.md`.
Porta: **3218**.

## Arquivos que são seus
- `app/(dashboard)/layout.tsx`
- `components/layout/**`
- `components/command/**` (novo)
- `app/(dashboard)/mais/**` (novo)
- `lib/actions/busca.ts` (novo, se precisar)

## O que fazer
1. **Command Palette** (`⌘K` / `Ctrl+K`, e o botão `[data-command-trigger]` da sidebar; no celular, um botão de busca no topo das telas não existe — adicione um ícone de busca na tab bar? **Não**: adicione-o no topo do conteúdo via um botão flutuante pequeno no canto superior direito do layout, só no celular, glass, 44 px). Estilo Raycast/Spotlight: `Sheet`/diálogo glass centralizado no desktop, folha de baixo no celular; campo de busca grande; resultados agrupados:
   - **Ir para**: todas as rotas do mapa (Hoje, Membros, Cobrar, Insights, Agenda, Histórico, Retrospectiva, Ajustes, Mais).
   - **Membros**: busca por nome → abre perfil; ações secundárias (Cobrar, Marcar pago do mês).
   - **Ações**: Novo membro, Cobrar pendentes, Exportar CSV, Baixar agenda (.ics → `/api/agenda/ics`), Mensagem do grupo (→ `/cobrar`).
   - Navegação por setas, Enter, Esc; destaque do termo; ranking simples (prefixo > contém); vazio "Nada encontrado".
   - Dados de membros: carregue sob demanda (server action em `lib/actions/busca.ts` com cache em memória do cliente).
2. **Atalhos de teclado** (desktop): `g` depois `h` (Hoje), `g m` (Membros), `g c` (Cobrar), `g i` (Insights), `g a` (Agenda), `n` (novo membro), `?` (abre `Sheet` com a lista de atalhos usando `Kbd`). Ignorar quando o foco está em input/textarea.
3. **Layout**: encaixe `DemoBanner` de `@/components/demo/DemoBanner` (topo, acima do conteúdo) e o provedor da palette. Revise sidebar/tab bar da fase A conforme as rotas finais do `B-contratos.md` (tudo apontando para rotas que existirão). Transição de página suave (fade 150 ms) sem quebrar o streaming/`loading.tsx`.
4. **`/mais`** (hub do celular, estilo Ajustes): cartão do perfil/plano no topo (vagas, total), grupos de `ListRow` para Agenda, Histórico, Retrospectiva, Ajustes, Instalar app (encaixe `InstallPrompt` de `@/components/pwa/InstallPrompt`), Atalhos, Sobre (versão "v2"), Sair (`<form action="/sair" method="post">`). No demo, "Recomeçar demonstração" e "Criar minha conta".
5. Página `not-found.tsx` do grupo `(dashboard)` bonita (símbolo + "Essa página não existe" + voltar para Hoje).

## Aceite
- Em `/demo`: `⌘K` abre, busca "ana" encontra a Ana, Enter abre o perfil; atalhos funcionam; `?` mostra a lista; `/mais` completa; banner do demo aparece; tab bar e sidebar levam a todas as rotas; 360 px ok.
- `tsc`, `eslint "app/(dashboard)/layout.tsx" "app/(dashboard)/mais" components/layout components/command lib/actions/busca.ts`, `npm run build` verdes.
- Observação: as telas de outros workers são feitas em paralelo; rotas delas podem não existir na sua worktree — tudo bem, só aponte os links certos.
