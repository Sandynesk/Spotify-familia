# SpotiFamília v2 — Linguagem visual e de produto (fonte da verdade)

> Vale para TODAS as telas internas (dashboard, membros, cobrar, insights, agenda, histórico, retrospectiva, configurações, onboarding) e para login/cadastro.
> A landing (`/`, `components/landing/**`) já segue esta marca e **não** deve ser redesenhada.
> Substitui `docs/app/DESIGN.md` onde houver conflito.

## 1. A dor (por que o app existe)

Uma pessoa (o **dono do plano**) paga sozinha o Spotify Família (6 vagas) e precisa receber de até 5 pessoas todo mês. Quase sempre pelo **celular**, com o **polegar**.

| Dor | Resposta do v2 |
|---|---|
| Marcar pagamento é lento | 1 toque / deslizar para marcar, **modo seleção** para vários, **Desfazer** em toast |
| Difícil ver quem deve o quê | Tela **Hoje** responde em 2 s: quanto falta, quem deve, há quanto tempo |
| Cobrar dá trabalho e é constrangedor | **Central de Cobrança**: mensagem pronta (gentil / direta / divertida), WhatsApp em 1 toque, **PIX copia-e-cola + QR** com o valor exato, **recibo** bonito para mandar |
| Visual confuso | Um sistema único (este documento), componentes compartilhados, hierarquia de Apple |
| Esquece datas | **Agenda** de vencimentos + exportar para o calendário do celular (.ics) |
| Não sabe se está no lucro/prejuízo | **Insights**: saldo do plano, previsão, pontualidade de cada um |
| Chato | **Retrospectiva** anual estilo "Wrapped", selos de pontualidade, comemoração quando o mês fecha |

## 2. Princípios

1. **Clareza antes de enfeite.** Cada tela tem UMA pergunta principal e a responde no topo, em número grande.
2. **Um momento-assinatura por tela.** Pode haver um "show" (aurora de luz, anel animado, contador, confete), mas só um, e nunca atrapalhando a leitura.
3. **Polegar primeiro.** Ações frequentes na metade de baixo da tela; alvos ≥ 44×44 px.
4. **Física, não efeitos.** Movimentos com mola (spring), curtos, interrompíveis. Tudo respeita `prefers-reduced-motion` (sem movimento → troca instantânea / fade).
5. **Consistência total.** Use SEMPRE os tokens e os componentes de `components/ui`. Nada de hex solto, nada de recriar botão/cartão.

## 3. Marca

- Nome: **SpotiFamília**. Símbolo: anel hexagonal de **6 cápsulas** (as 6 vagas) — `components/landing/BrandMark.tsx` e a geometria em `components/landing/brand.ts` (`BRAND_CAPSULES`, `BRAND_VIEW`, `BRAND_ROUND`).
- Cor de destaque da marca: **menta `#48E5B2`** (a mesma da landing). O verde Spotify `#1DB954` **sai** das telas internas.
- Não usar o logo do Spotify como marca do app (só menções em texto, ex.: "plano Família do Spotify").

## 4. Tokens (Tailwind v4, em `app/globals.css`, bloco `@theme`)

Os nomes `app-*` continuam (não quebre telas antigas); os valores mudam e entram tokens novos.

| Token | Valor | Uso |
|---|---|---|
| `--color-app-bg` | `#000000` | fundo |
| `--color-app-surface` | `#0e0e10` | cartões |
| `--color-app-elevated` | `#1a1a1d` | inputs, hover, chips, linhas selecionadas |
| `--color-app-raised` | `#242428` | elemento sobre elevated (thumb do segmented, tooltip) |
| `--color-app-line` | `rgb(255 255 255 / 0.08)` | bordas finas (hairline) |
| `--color-app-line-strong` | `rgb(255 255 255 / 0.14)` | borda de foco suave / divisores fortes |
| `--color-app-text` | `#f5f5f7` | texto principal |
| `--color-app-muted` | `#a1a1a6` | secundário |
| `--color-app-subtle` | `#8e8e93` | legendas (≥ 12 px) |
| `--color-app-accent` | `#48E5B2` | destaque, ação primária, "pago" (texto **preto** sobre ele) |
| `--color-app-accent-hover` | `#6cf0c4` | hover do primário |
| `--color-app-accent-ink` | `#04261b` | texto sobre fundo menta |
| `--color-app-warn` | `#ffb340` | pendente |
| `--color-app-danger` | `#ff5a4e` | atrasado / perigo |
| `--color-app-info` | `#64a8ff` | informação neutra (raro) |
| `--radius-app` | `24px` | cartões |
| `--radius-app-sm` | `14px` | inputs, chips, linhas |
| `--radius-app-xs` | `10px` | ícones em caixa |
| `--ease-app` | `cubic-bezier(0.22, 1, 0.36, 1)` | curvas CSS |
| `--shadow-app-float` | `0 10px 40px -10px rgb(0 0 0 / 0.8), 0 0 0 1px rgb(255 255 255 / 0.06)` | barras flutuantes, sheets |

Utilitários CSS globais (criados pelo dono do design system, use por nome):
- `.app-glass` — fundo `rgb(14 14 16 / 0.72)` + `backdrop-filter: blur(20px) saturate(160%)` + hairline. Para tab bar, headers fixos, sheets.
- `.app-aurora` — fundo com 2–3 gradientes radiais menta/ciano muito suaves, animados devagar (20 s), para **um** cartão-herói por tela. Parado em reduced-motion.
- `.app-noise` — textura de ruído sutil (SVG inline, opacidade ≤ 0.04) opcional sobre a aurora.
- `.tabular` — `font-variant-numeric: tabular-nums`.
- Foco: `:focus-visible` com anel menta 2 px + offset 2 px (global).

## 5. Tipografia (Geist, via `font-app`)

| Papel | Classes |
|---|---|
| Título grande da página (iOS large title) | `text-[34px] leading-[1.1] font-semibold tracking-[-0.02em]` |
| Número-herói | `text-5xl sm:text-6xl font-semibold tracking-[-0.03em] tabular` |
| Título de seção | `text-[13px] font-medium uppercase tracking-[0.08em] text-app-subtle` |
| Título de cartão | `text-[17px] font-semibold tracking-[-0.01em]` |
| Corpo | `text-[15px] text-app-text` |
| Secundário | `text-sm text-app-muted` |
| Legenda | `text-xs text-app-subtle` |

Valores monetários sempre com `formatCurrency` e `tabular`. Centavos podem ser menores e em `text-app-muted` no número-herói.

## 6. Movimento

- framer-motion. Mola padrão: `{ type: 'spring', stiffness: 420, damping: 34, mass: 0.8 }`. Exportada como `springs.snappy` em `components/ui/motion.ts` (com `springs.soft` e `springs.bouncy`).
- Entradas de lista: fade + 8 px para cima, escalonadas em 30 ms, no máximo 8 itens animados.
- Troca de aba/segmento: indicador com `layoutId`.
- Números: `NumberTicker` (conta até o valor em ~600 ms).
- Sempre `useReducedMotion()` → sem deslocamento.
- Feedback tátil: `haptic('light'|'success'|'warning')` em `components/ui/haptics.ts` (usa `navigator.vibrate` quando existir; no-op no resto).

## 7. Componentes (todos em `components/ui`, exportados por nome)

| Componente | Notas |
|---|---|
| `Button` | variantes `primary` (menta, texto ink), `secondary` (elevated), `ghost`, `danger`, `glass`; tamanhos `sm` (36px) `md` (44px) `lg` (52px); `loading`; `icon`; forma de pílula; escala 0.97 ao pressionar |
| `IconButton` | quadrado/redondo 44 px, `aria-label` obrigatório |
| `Card` | `variant`: `default`, `interactive` (hover/press), `hero` (com `.app-aurora`) ; `padding` |
| `Sheet` | já existe (`<dialog>`); manter API, refinar visual (alça, glass, título) |
| `SegmentedControl` | estilo iOS com thumb deslizante (`layoutId`) |
| `ProgressRing` | SVG, `value` 0–100, tamanho, espessura, rótulo central |
| `NumberTicker` | anima número; `format` opcional (ex.: moeda) |
| `StatusBadge` (`Badge`) | pago / pendente / atrasado — sempre ícone + texto |
| `Avatar`, `AvatarStack` | iniciais + cor; anel de status opcional |
| `ListGroup` + `ListRow` | lista agrupada estilo Ajustes do iPhone (ícone à esquerda, valor/chevron à direita) |
| `SwipeRow` | deslizar para revelar ação (ex.: "Pago"); acessível por botão alternativo |
| `EmptyState` | símbolo de cápsulas, título, texto, ação |
| `Skeleton` | já existe |
| `Toast` | `useToast()` mantém `success/error/warning/toast`; NOVO: `show({ message, type?, action?: { label, onClick }, duration? })` para **Desfazer** |
| `PageHeader` | título grande + subtítulo + ações à direita; no celular encolhe para barra glass ao rolar |
| `SectionHeader` | título de seção + ação opcional ("Ver tudo") |
| `SlotsRing` | o anel de 6 cápsulas com N vagas ocupadas/pagas (usa `BRAND_CAPSULES`), animado |
| `Confetti` | explosão curta de cápsulas menta (canvas leve, sem dependência), só quando chamado |
| `Kbd` | tecla de atalho |

## 8. Estrutura de navegação

- **Celular:** tab bar flutuante (`.app-glass`, cantos 28 px, margem 12 px, respeita `safe-area-inset-bottom`) com 5 abas: **Hoje** (`/dashboard`), **Membros** (`/membros`), **Cobrar** (`/cobrar`), **Insights** (`/visao-geral`), **Mais** (`/mais`). Aba ativa: ícone preenchido menta + rótulo.
- **Desktop (`lg:`):** sidebar de 264 px, símbolo + "SpotiFamília", grupos: *Principal* (Hoje, Membros, Cobrar, Insights), *Planejar* (Agenda `/agenda`, Histórico `/historico`, Retrospectiva `/retrospectiva`), *Conta* (Configurações `/configuracoes`, Sair). No rodapé: cartão do plano (vagas usadas, valor). Atalho `⌘K` visível.
- Conteúdo: largura máx. `max-w-5xl` centralizada, padding `px-5 sm:px-8`, topo `pt-[max(env(safe-area-inset-top),16px)]`.

## 9. Estados obrigatórios

Toda tela/lista: **carregando** (Skeleton com a forma final), **vazio** (`EmptyState` com ação), **erro** (mensagem + "Tentar de novo"). Toda ação: progresso (loading/disabled) e resultado (toast; quando reversível, toast com **Desfazer**).

## 10. Acessibilidade

Contraste AA; texto ≥ 12 px; status nunca só por cor; botões de ícone com `aria-label`; foco visível; diálogos via `Sheet`; ordem de tab lógica; `lang="pt-BR"`; nada de rolagem horizontal da página em 360 px.

## 11. Copy

pt-BR, curta, calorosa, sem jargão. Fale com o dono do plano por "você". Ex.: "Tudo certo por aqui", "Faltam R$ 13,64 para fechar o mês", "Cobrar Bruno no WhatsApp".
