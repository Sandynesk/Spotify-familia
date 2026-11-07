# Regras para TODO worker do SpotiFamília v2 (leia antes de começar)

Você é um worker. Um coordenador (CEO) dividiu o trabalho em tarefas com **donos de arquivos**. Outros workers trabalham **ao mesmo tempo**, em outras worktrees, em outros arquivos. Depois o CEO junta tudo na branch `app/v2`.

## Antes de codar
1. Você está numa worktree própria criada a partir da branch `app/v2`. Confirme com `git branch --show-current` e `git log --oneline -1`.
2. Instale dependências: `npm ci --no-audit --no-fund`.
3. Copie as variáveis: `Copy-Item "C:\Users\esmsa\Desktop\Organização\Projetos\sf-v2\.env.local" .` (PowerShell). **Nunca** commite `.env.local`.
4. Leia `docs/app/v2/DESIGN-V2.md` (inteiro) e a sua spec.
5. Este é o **Next.js 16** (App Router). Antes de usar qualquer API do Next que você não tenha certeza, leia o guia em `node_modules/next/dist/docs/`. `params`/`searchParams` de página são `Promise`. O middleware se chama `proxy.ts` (função `proxy`).
6. React 19 + `eslint-config-next`: são proibidos `setState` síncrono dentro de `useEffect` (`react-hooks/set-state-in-effect`), mutar valores durante render (`react-hooks/immutability`), ler `ref.current` durante render. Use valor derivado, `useSyncExternalStore`, handlers ou `useRef` em efeitos.
7. framer-motion v12: use `undefined` (não `false`) em `initial/animate/exit` condicionais.

## Durante
- Edite **somente** os arquivos/pastas que a sua spec diz que são seus. Pode **criar** arquivos dentro das suas pastas. Precisa mudar algo de outro dono? Não mude: anote em "Pendências para o CEO" no relatório (ou use `orca orchestration ask` se for bloqueante).
- **Sem dependências novas**, a não ser que a spec mande.
- **Nunca** rode SQL nem altere o banco Supabase de produção, nunca crie contas, nunca rode `git push`, `git merge`, `git rebase`, `git reset --hard`, nem mexa em outras branches/worktrees.
- Use os tokens e componentes do design system (`components/ui`). Nada de hex solto em telas (exceção: arquivos do design system e imagens geradas por `next/og`).
- Copy em pt-BR. Mobile first (375 px), sem rolagem horizontal em 360 px.
- Acessibilidade conforme DESIGN-V2 §10.
- **Modo demonstração**: depois da fase A, abrir `http://localhost:<porta>/demo` entra no app com dados fictícios, sem login. Use para testar suas telas com `npx next dev -p <porta>` (escolha uma porta livre entre 3200 e 3299, ex.: a da sua spec). Pare o servidor ao terminar.

## Verificação (obrigatória, nesta ordem)
```
npx tsc --noEmit
npx eslint <suas pastas/arquivos>
npm run build
```
Passa quando: `tsc` sem saída; eslint sem "error"; build com "Compiled successfully". Se um erro for de arquivo de outro dono, não conserte — relate.

## Entrega
1. `git add -A` (confira com `git status` que **não** há `.env.local`, `.next`, `node_modules`, prints) e `git commit -m "feat(v2): <resumo>"` na SUA branch. Pode fazer vários commits.
2. Termine com `worker_done` contendo:
   - arquivos criados/alterados;
   - saída resumida de tsc / eslint / build;
   - 3–8 bullets das decisões de UX/arquitetura;
   - "Pendências para o CEO" (integrações em arquivos de outros donos, coisas que precisam do usuário).
