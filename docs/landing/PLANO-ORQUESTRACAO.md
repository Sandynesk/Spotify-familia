# Plano de orquestração — nova landing page "nível keynote"

Status: **planejamento** (nada executado). Atualizado em 2026-11-07.

## 1. Decisões tomadas

| Tema | Decisão |
|---|---|
| Escopo | Só a landing page principal (`/`). Login, cadastro e o sistema ficam intocados. |
| Referência | Página de lançamento da Apple (estilo iPhone Pro): fundo preto, tipografia enorme, narrativa guiada pelo scroll |
| Celulares | **Os dois combinados**: celular 3D que gira com o scroll no hero e nas seções fixas + fotos fotorrealistas geradas por IA nas outras seções |
| Tela dos celulares | Interface do painel **recriada em HTML** com dados fictícios: nítida e animável |
| Modelo 3D | **Modelado em código** (three.js/r3f): nenhum GLB realista, genérico e com licença livre confirmada foi encontrado. Isso também elimina a questão de licença e o peso do arquivo. |
| Fonte | **Geist**, só no wrapper da landing; o sistema continua com a Outfit |
| Título do hero | "Plano Família. / Finalmente em ordem." |
| Aparência do aparelho | Flagship premium **genérico**, em titânio, sem logo nem marca |
| Identidade | Keynote preto + verde `#1DB954` como cor de destaque |
| Dependências | `three`, `@react-three/fiber`, `@react-three/drei` e `lenis`, carregadas **só na landing** |
| Mobile | 3D leve em aparelhos bons; imagem de IA de reserva em aparelhos fracos ou quando o visitante pede menos movimento (`prefers-reduced-motion`) |
| Agentes de código | **Gemini 3.8 Flash High** via Antigravity (`agy`) |
| Imagens IA | **Codex** (`codex exec`, recurso `image_generation`) |
| Git | **Nada de commit na `main` nem mexer na árvore de trabalho atual**: outro agente está trabalhando nela |

## 2. Isolamento do outro agente

- Todo o trabalho acontece numa worktree separada, `../sf-landing`, no branch `landing/base` criado a partir do HEAD. A pasta atual e a `main` não são tocadas.
- Commits só nos branches `landing/*` dessa worktree. Eles não afetam a `main` nem o WIP do outro agente.
- A worktree tem `node_modules` próprio (`npm install` lá dentro) e um `.env.local` copiado. O dev server roda na porta **3100**, para não colidir com o outro agente.
- Só se criam arquivos **novos**: `components/landing/**` e `public/landing/**`. `components/public/Navbar.tsx` e `Footer.tsx` (que estão no WIP) não são editados; a landing ganha `LandingNav` e `LandingFooter` próprios.
- O único arquivo existente que muda é `app/page.tsx`, e só na **última fase**, depois que o outro agente terminar e você aprovar. Na mesma hora entra o merge do `package.json` com as dependências novas.

## 3. Ferramentas verificadas

**Gemini 3.8 Flash High (código).** O `gemini` CLI não autentica mais (`IneligibleTierError`); usamos o Antigravity:
```bash
agy -p "<prompt>" --model gemini-3.8-flash-high --mode accept-edits \
    --output-format json --print-timeout 20m
# rodada de correção: mesmo comando + --conversation <conversation_id>
# revisor somente leitura: --mode plan --json-schema <schema.json>
```
Testado: `SUCCESS` em ~38 s, com ~18,6k tokens de overhead por chamada.

**Codex (imagens).** A v0.163 está com `image_generation` ativo. Testado sem interação: gerou e salvou o PNG, com o original guardado em `~/.codex/generated_images/<sessão>/`.
```bash
codex exec --skip-git-repo-check -s workspace-write -C <pasta> "<prompt>"
```
Cuidado: no teste o Codex "consertou" a imagem redesenhando-a com código. O prompt precisa proibir isso explicitamente (ver seção 7).

## 4. Papéis

- **Claude (orquestrador):** brief e storyboard, busca e licença do GLB, fundação técnica, contratos, disparo dos agentes, integração, verificação (lint, tsc, build, capturas de tela, Lighthouse), revisão e encaixe da interface nas fotos.
- **Gemini 3.8 Flash High (trabalhadores):** um componente ou grupo de arquivos por agente, cada um em sua própria worktree. Só editam arquivos, sem rodar comandos.
- **Codex (estúdio de imagem):** gera as fotos conforme especificação, em 2 ou 3 variações por cena.
- **Você:** aprova storyboard, imagens e resultado final.

## 5. Narrativa proposta (storyboard; a confirmar em F0)

| # | Seção | Mídia | Ideia |
|---|---|---|---|
| 1 | **Hero** | 3D | Título gigante "Plano Família. Finalmente em ordem." O celular de titânio sobe girando e para de frente, com o painel vivo na tela. |
| 2 | **Seis vagas** (seção fixa) | 3D | O celular fica preso na tela enquanto a página rola, e as 6 vagas se preenchem com avatares uma a uma. "Seis vagas. Uma conta. Zero planilha." |
| 3 | **Quem pagou** (seção fixa) | 3D | O celular gira em close; os membros vão sendo marcados como pagos e o contador "a receber" cai até zero. |
| 4 | **Cada um no seu** | Foto IA | Várias mãos, cada uma com um celular, em volta de uma mesa. As telas mostram a interface encaixada. "Cada um no seu. Todos em dia." |
| 5 | **Detalhes** | Bento | Valores individuais, histórico mês a mês, visão geral em calendário + gráficos. **Só funcionalidades que já existem.** |
| 6 | **Números** | Tipografia | Os números da conta, coerentes com os mockups. |
| 7 | **CTA final** | Foto IA | Macro do celular sobre superfície escura com luz verde de recorte. "Organize seu plano agora." |
| 8 | **Rodapé** | — | Simples. |

## 6. Fases e gates

### F0 — Brief e storyboard (Claude)
- Crio `docs/landing/BRIEF.md` com tom, promessa, copy de cada seção, **um único conjunto de dados fictícios** (nomes, valores e status usados em todas as telas e números) e a lista de funcionalidades reais que podem aparecer.
- Faço um storyboard visual (wireframes das 8 seções) para você ver a sequência.
- **Gate:** você aprova a copy e a sequência.

### F1 — Assets (em paralelo)
- **Codex:** gera as 4 cenas da seção 7, com 2 ou 3 variações cada, rodando 2 Codex ao mesmo tempo. Monto uma galeria para você escolher.
- ~~GLB com licença livre~~: substituído pelo celular modelado em código (ver F3, agente **three**).
- **Claude:** em cada foto escolhida, meço os 4 cantos da tela (que vem magenta) para encaixar o HTML por `matrix3d`.
- **Gate:** você escolhe as imagens e o modelo 3D.

### F2 — Fundação (Claude, sequencial)
Na worktree `../sf-landing`, branch `landing/base`:
- instalo as dependências;
- crio a estrutura `components/landing/`;
- crio as primitivas: `SmoothScroll` (Lenis, só na landing), `Reveal`, `Section`, `useReducedMotion` e `useDeviceTier` (decide entre 3D e imagem de reserva);
- crio **stubs tipados** dos componentes compartilhados, para os agentes trabalharem em paralelo sem esperar uns pelos outros:
  - `PhoneScene({ stage })`: o 3D, controlado por estágios do scroll;
  - `Screen*`: as telas em HTML, com 390×844 lógicos;
  - `DeviceShot({ src, corners, screen })`: foto + tela encaixada.
- checo as APIs do Next 16 em `node_modules/next/dist/docs/` (carregamento dinâmico sem SSR para o 3D, `next/image`, `next/font`);
- deixo o 3D com import dinâmico: o texto do hero aparece antes e o three.js carrega depois.
- **Gate:** lint, tsc e build verdes, rota de preview `/landing-preview` funcionando com os stubs.

### F3 — Construção (6 Gemini Flash High em paralelo)
Cada agente numa worktree `../sf-<nome>`, no branch `landing/<nome>` que sai de `landing/base`:

| Agente | Dono de | Entrega |
|---|---|---|
| **three** | `components/landing/three/**` | cena r3f: **celular modelado em código** (corpo `RoundedBox`, moldura de titânio com `MeshPhysicalMaterial`, vidro com clearcoat, ilha frontal, módulo de 3 câmeras com lentes, botões laterais) e iluminação de estúdio só com `Lightformer`, sem HDR externo; iluminação de estúdio (environment + rim light verde), tela via `<Html transform>` com o componente `Screen`, keyframes de câmera e rotação por estágio, qualidade adaptativa |
| **screens** | `components/landing/screens/**` | telas em HTML (Resumo, Membros 6/6, Pagamento confirmado, Histórico) com os dados do brief e microanimações |
| **story** | `Hero.tsx`, `SixSlots.tsx`, `WhoPaid.tsx` | seções fixas com o scroll que controlam o `stage` do `PhoneScene`; tipografia keynote |
| **photo** | `DeviceShot.tsx`, `EveryoneSection.tsx`, `FinalCta.tsx` | fotos com `next/image` + interface encaixada por `matrix3d` |
| **bento** | `Details.tsx`, `Numbers.tsx` | grid bento das funcionalidades reais + seção de números |
| **chrome** | `LandingNav.tsx`, `LandingFooter.tsx` | nav translúcida estilo apple.com (blur e encolhe no scroll) + rodapé |

### F4 — Integração e revisão (Claude)
1. Merge dos 6 branches em `landing/base`. Como cada agente é dono de arquivos diferentes, não deve haver conflito.
2. Lint, tsc e build. Depois capturas de tela em 375, 768 e 1440 px, em `/landing-preview`.
3. Revisão contra o contrato. Se tiver problema, volta para o **mesmo** agente com `--conversation <id>`; no máximo 2 rodadas, depois eu corrijo.
4. Teste de desempenho com CPU 4× mais lenta (emulando celular médio): o 3D tem que manter fluidez ou cair para a imagem de reserva.
- **Gate:** você navega pelo `/landing-preview` (localhost:3100).

### F5 — Polimento
- **Revisor Gemini Flash High** em `--mode plan` com `--json-schema`: audita acessibilidade (contraste, foco, headings, alt, conteúdo acessível sem o 3D), reduced-motion e consistência de copy e dados. Só aponta; quem corrige sou eu.
- Lighthouse mobile no build de produção. Metas:

| Métrica | Meta |
|---|---|
| Performance | ≥ 85 (com 3D) |
| Acessibilidade | ≥ 95 |
| LCP | < 2,5 s, com o texto do hero como elemento LCP |
| CLS | < 0,1 |
| JS extra da landing | carregado sob demanda |

### F6 — Entrada no ar (só com o seu ok e com o outro agente já parado)
O `app/page.tsx` passa a renderizar a nova landing. Faço o merge do `package.json`, removo `/landing-preview` e você revisa o diff antes do merge na `main`.

## 7. Especificação das imagens (Codex)

Regras que vão em todo prompt:
- Fotorrealista, estilo fotografia de produto de keynote, fundo preto profundo, luz de estúdio com recorte verde sutil (`#1DB954`).
- O celular é um flagship premium genérico em titânio grafite: **sem logo, sem marca, sem texto** em lugar nenhum.
- A tela é **magenta sólido `#FF00FF`, plano, sem reflexo**. Eu substituo pelo HTML depois.
- **Proibido pós-processar, redesenhar ou "corrigir" a imagem com código.** O arquivo entregue é o original do gerador.
- Salvar em `public/landing/raw/<cena>-v<n>.png` e informar o caminho.

| Cena | Uso | Enquadramento |
|---|---|---|
| `hero-fallback` | substitui o 3D no mobile fraco e no reduced-motion | celular em 3/4, flutuando, vertical 4:5 |
| `everyone` | seção 4 | 4 ou 5 mãos com celulares sobre mesa escura, vista de cima, telas quase frontais, 16:9 |
| `macro` | CTA final | close da lateral e das câmeras, superfície escura, 16:9 |
| `pocket` | reserva para os detalhes | celular sobre tecido ou mesa, ambiente doméstico noturno, 1:1 |

## 8. Modelo de prompt para os agentes Gemini (F3)

```
Você é um trabalhador numa equipe de front-end. Implemente APENAS os arquivos: {ARQUIVOS}.

Leia antes de escrever:
- AGENTS.md (Next 16: confira APIs em node_modules/next/dist/docs/)
- docs/landing/BRIEF.md (copy e dados fictícios: use exatamente estes)
- docs/landing/contratos/{NOME}.md (seu contrato)
- components/landing/primitives/* e os stubs que você consome (não edite)

Regras:
- Não edite nada fora dos seus arquivos; não instale pacotes; não rode comandos.
- Tokens de cor do app (sp-*); verde #1DB954 só como destaque.
- Animação apenas em transform/opacity; tudo respeita useReducedMotion.
- Nenhum loop infinito sem pausa fora da viewport.
- Server component por padrão; 'use client' só onde há estado/animação.
- Texto pt-BR. Acessível: headings em ordem, alt em imagens, foco visível.

Ao terminar, responda exatamente:
RESUMO: <2-3 linhas>
ARQUIVOS: <lista>
NOTES: <o que precisa de fora do seu escopo; ou "nenhuma">
```

## 9. Riscos

| Risco | Mitigação |
|---|---|
| Visual "genérico de IA" | storyboard e copy fechados em F0, contrato com critérios visuais, revisão por captura de tela, até 2 rodadas por agente |
| GLB sem licença boa ou sem malha de tela separada | procurar antes da F2; plano B: celular modelado em código (corpo arredondado + material PBR) |
| A IA gera tela torta, logo ou texto | 2–3 variações por cena e a regra do magenta; se a tela vier ruim, ajusto os cantos manualmente |
| three.js pesa no celular | import dinâmico, `useDeviceTier`, DPR limitado, imagem de reserva |
| Next 16 com APIs diferentes | leitura obrigatória dos docs locais; tsc e build em todo gate |
| Conflito com o outro agente | worktree isolada; `app/page.tsx` e `package.json` só na F6 |
| Cota/latência do Antigravity e do Codex | no máximo 6 Gemini e 2 Codex ao mesmo tempo; prompts enxutos |
