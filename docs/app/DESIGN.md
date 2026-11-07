# SpotiFamília — guia das telas internas

Vale para dashboard, membros, visão geral, histórico e configurações. A landing (`/`), o login e o cadastro **não** fazem parte deste trabalho.

## Quem usa e como

Uma pessoa só (o dono do plano), **quase sempre pelo celular**. O uso típico é:
- abrir o app;
- ver quem deve;
- marcar pagamentos;
- mandar a cobrança no grupo do WhatsApp.

Tudo deve ser rápido de fazer com o polegar.

Dores relatadas:
1. Marcar pagamento é lento.
2. É difícil ver quem deve o quê.
3. O visual é confuso e inconsistente.
4. Cobrar as pessoas dá trabalho: hoje a mensagem é escrita à mão no grupo.

## Linguagem visual ("keynote", alinhada à nova landing)

- Fundo preto puro. Superfícies escuras discretas e um único destaque: o verde Spotify.
- Tipografia Geist, já aplicada pelo layout via `font-app`. Títulos grandes e enxutos (`text-3xl font-semibold tracking-tight`); números com `tabular-nums`.
- Espaço generoso, hierarquia clara, pouca decoração: nada de gradientes chamativos, glows ou sombras pesadas.

### Tokens (definidos em `app/globals.css`; use SEMPRE estes, nunca hex soltos)

| Uso | Classe |
|---|---|
| Fundo da página | `bg-app-bg` |
| Cartão/superfície | `bg-app-surface` + `border border-app-line` + `rounded-[var(--radius-app)]` |
| Elemento elevado, hover, input | `bg-app-elevated` |
| Texto principal | `text-app-text` |
| Texto secundário | `text-app-muted` |
| Texto terciário, legendas | `text-app-subtle` |
| Destaque, ação primária, "pago" | `bg-app-accent` / `text-app-accent` (texto preto sobre o verde); hover `bg-app-accent-hover` |
| Pendente | `text-app-warn` / `bg-app-warn/15` |
| Atrasado, perigo | `text-app-danger` / `bg-app-danger/15` |
| Raio menor (chips, inputs) | `rounded-[var(--radius-app-sm)]` |
| Curva de animação | `ease-[var(--ease-app)]` |

### Componentes prontos (use-os; não recrie)

- `components/ui/Sheet.tsx`: diálogo modal (folha que sobe da base no celular). Use para confirmações e painéis.
- `components/ui/Badge.tsx`: status pago, pendente ou atrasado.
- `components/ui/Card.tsx`: superfície padrão.
- `components/ui/Avatar.tsx`, `components/ui/Skeleton.tsx`, `components/ui/Toast.tsx` (`useToast()` → `success`/`error`).
- `lib/utils/currency.ts` (`formatCurrency`) e `lib/utils/date.ts` (`formatShortMonthYear`, `getCurrentMonthISO`, `getEffectiveStatus`...).
- Ícones: somente `lucide-react`. Animação: `framer-motion` com moderação, sempre respeitando `prefers-reduced-motion`.

### Regras obrigatórias

- **Mobile first (375 px).** Ao subir para desktop (`lg:`), a sidebar ocupa 256 px à esquerda. Sem rolagem horizontal da página. Exceção: uma tabela larga dentro de um contêiner com `overflow-x-auto`.
- **Toque:** alvos clicáveis com no mínimo 44×44 px. Ações frequentes ao alcance do polegar.
- **Texto:** no mínimo 12 px; contraste AA; `text-app-subtle` só para legendas.
- **Estados:** toda lista ou tela tem estado de carregando (Skeleton), vazio (com ação sugerida) e erro. Toda ação mostra progresso (spinner/disabled) e resultado (toast).
- **Acessibilidade:** botões só com ícone têm `aria-label`; foco visível; diálogos via `Sheet`; status nunca indicado só por cor (texto ou ícone junto).
- **Copy** em pt-BR, curta e amigável.
- **Sem dependências novas.** Sem gráficos novos além do `recharts` já instalado.

## Regras de trabalho para os workers (todos)

- Edite **somente** os arquivos listados como seus na sua spec. Você pode criar arquivos novos dentro das pastas indicadas. Se precisar mudar um arquivo de outro dono, **pergunte ao coordenador** (`ask`) em vez de editar.
- Este é um **Next.js 16**: antes de usar uma API do Next, leia o guia em `node_modules/next/dist/docs/`. `params` e `searchParams` de página são `Promise`.
- **Não rode** `git` (commit, checkout, stash, reset), `npm install`, `npm run build` nem `next dev`: outros workers usam a mesma pasta e o mesmo `.next`.
- **Verificação:** `npx tsc --noEmit` e `npx eslint <seus arquivos>`. Erros de tsc em arquivos de outros donos podem ser deles, que estão trabalhando em paralelo: não os conserte, só mencione.
- As server actions novas ainda são stubs, implementadas em paralelo pelo worker de lógica. Use as **assinaturas** exatamente como estão; não as altere.
- Ao terminar, reporte com `worker_done`:
  - os arquivos alterados ou criados;
  - a saída do tsc e do eslint;
  - as decisões de UX em 3 a 6 bullets;
  - o que ficou pendente.
