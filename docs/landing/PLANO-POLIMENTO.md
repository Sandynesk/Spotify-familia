# Plano de polimento da landing (F5) — para o próximo orquestrador

> **Orquestrador (CEO): comece por `docs/landing/CEO.md`**: é o roteiro passo a passo, com comandos exatos, as perguntas ao usuário e as specs prontas em `docs/landing/specs/`. Este arquivo é a referência de arquitetura, invariantes e lições.

Data: 2026-11-07. Estado de partida: a nova landing está **no ar** em `/` (branch `main`), com build, lint e tsc verdes, revisada por capturas de tela em desktop (1440), mobile (390) e reduced-motion.

Leia este documento inteiro antes de disparar qualquer agente. Ele descreve a arquitetura, as invariantes que não podem quebrar, as tarefas pendentes com critérios de aceite e as lições da rodada anterior.

---

## 0. Antes de tudo

1. **Leia a skill de orquestração do Orca:** `orca skills get orchestration` e `orca skills get orca-cli`. O usuário acompanha os agentes pelo painel do Orca, então **todo agente precisa ser disparado de um jeito que apareça ali** (ver §5). Não use processos headless escondidos.
2. **Leia** `docs/landing/BRIEF.md`, a fonte única de copy, dados e tom; `docs/landing/contratos/_regras.md`, com as regras comuns dos agentes; e o contrato do agente cuja área você vai mexer.
3. **Escopo:** só a landing (`/`). O sistema (dashboard, login, cadastro) **não** muda de visual sem o usuário pedir.
4. **Decisões passam pelo usuário** com perguntas de múltipla escolha (AskUserQuestion), sempre que forem dele: visual, marca, conteúdo e qualquer coisa jurídica.

---

## 1. Arquitetura (o que existe)

```
app/page.tsx                         → renderiza <Landing /> (server)
components/landing/
  Landing.tsx                        → composição + fonte Geist (só aqui) + CSS var --landing-accent
  data.ts                            → ÚNICA fonte dos dados fictícios (6 membros, R$ 40,00, momentos)
  brand.ts / BrandMark.tsx           → logo vetorial (anel de 6 cápsulas, #48E5B2)
  LandingNav.tsx / LandingFooter.tsx
  Details.tsx + Bento*.tsx           → bento "Pensado nos detalhes"
  Numbers.tsx                        → 6 · 1 toque · 0
  primitives/                        → Reveal, Section, SmoothScroll (Lenis), useDeviceTier, homography
  story/                             → narrativa 3D presa no scroll
    beats.ts                         → 7 beats: hero, slots-1..3, paid-1..3 (+ momentOf / viewOf)
    StoryStage.tsx                   → useScroll → progress + beat; camada sticky com o celular
    PhoneStage.tsx                   → decide 3D × foto de reserva (useDeviceTier)
    BeatBlock.tsx                    → bloco de texto de altura EXATA 100svh
    HeroBeat / SlotsBeats / PaidBeats / StoryText
  three/                             → celular modelado em código (r3f) + projeção da tela HTML
  screens/                           → telas do app em HTML (390×844): PhoneScreen, DashboardScreen, PlayerScreen
  photo/                             → DeviceShot (foto + tela encaixada por homografia), PhoneFallback, Everyone, FinalCta, shots.ts
public/landing/                      → fotos IA (webp sem perda) + logo-symbol.svg
docs/landing/tools/                  → shoot.cjs (capturas), corners.cjs (medir telas magenta), regras-imagem-codex.txt
```

### Invariantes — não quebre
| Invariante | Por quê |
|---|---|
| Exatamente 7 `<BeatBlock>`, na ordem de `BEAT_ORDER`, cada um com `h-[100svh]` | O mapeamento scroll → beat depende disso (`beats.ts`) |
| Toda tela HTML mede `SCREEN_W × SCREEN_H` (390 × 844) e é escalada por transform | O 3D e as fotos projetam esse retângulo; viewport units quebram tudo |
| Dados só de `data.ts`. "A receber" = **total do mês** (como no app real) | Coerência com o app (`lib/actions/pagamentos.ts`) |
| Na landing, verde de destaque só via `var(--landing-accent)` / `BRAND.accent` (#48E5B2) | Identidade própria, separada do Spotify |
| Nas telas do app (`screens/`), o verde é `#1DB954` e a fonte é Outfit | Fidelidade ao app atual |
| A tela do celular 3D é uma camada DOM **irmã do Canvas**, posicionada por `quadToMatrix3d` a cada frame | O `<Html transform>` do drei **não renderiza** neste setup (Next 16 + React 19); não volte a usá-lo |
| A camada sticky do celular fica dentro de um wrapper `absolute inset-0` | Com margem negativa, o sticky passava do contêiner e invadia a seção seguinte |
| Cantos das telas em `photo/shots.ts` vêm de `docs/landing/tools/corners.cjs` | Medidos por ajuste de retas; não editar à mão |
| Animação só em transform/opacity; tudo respeita `prefers-reduced-motion` | Desempenho e acessibilidade |

### Como verificar (gate de toda rodada)
```bash
npx tsc --noEmit
npx eslint components/landing app/page.tsx
npm run build
npx next start -p 3100            # em outro terminal
# capturas (precisa de playwright-core numa pasta temporária: npm i playwright-core)
node docs/landing/tools/shoot.cjs <saida>/desktop desktop
node docs/landing/tools/shoot.cjs <saida>/mobile mobile
node docs/landing/tools/shoot.cjs <saida>/reduced desktop reduced
```
O `shoot.cjs` usa o Chrome instalado (`channel: 'chrome'`, WebGL via SwiftShader), percorre os 7 beats e as seções seguintes e informa overflow horizontal e erros de console. **Olhe as imagens**: lint verde não garante que a página está certa.

---

## 2. Tarefas

Ordem sugerida: P1 → P2 → P3 → P4 → P5. As tarefas P1 e P2 podem rodar em paralelo, porque cada agente é dono de arquivos diferentes.

### P1 — Capas de música reais no player (pedido do usuário)
**Pedido:** nos celulares laterais da seção "Cada um ouve no seu" (`photo/Everyone.tsx` → `screens/PlayerScreen.tsx`), trocar os quadrados de gradiente por **músicas reais de Matuê e PumaPJL**, com as capas dos álbuns.

**⚠️ Pergunte ao usuário antes de executar.** Capas de álbum são obras protegidas e nomes de artistas são marcas. Em página pública, isso pode sugerir associação e, em tese, gerar pedido de remoção. Para um projeto pessoal o risco costuma ser baixo, mas a decisão é do usuário. Ofereça:
- (a) capas reais, com crédito discreto ("Capas: © respectivos artistas") no rodapé;
- (b) só título e artista reais, com capas em gradiente;
- (c) manter o fictício.

**Se ele confirmar a opção (a):**
1. Escolha 4 faixas: 2 do Matuê e 2 do PumaPJL. **Confirme cada faixa e o álbum dela numa fonte real** antes de usar; não invente títulos. Mostre a lista ao usuário para aprovar.
2. Obtenha a capa pela **oEmbed pública do Spotify**, sem autenticação: `https://open.spotify.com/oembed?url=<URL da faixa/álbum>`, que devolve `thumbnail_url`. Baixe para `public/landing/covers/<slug>.jpg`, em ~640px. Não faça hotlink.
3. Crie `components/landing/screens/tracks.ts` com `{ title, artist, album, cover, duration }` × 4. Em `PlayerScreen`, `variant` 0–3 passa a indexar esse array; mantenha a assinatura `PlayerScreen({ variant })`. Use `<img>` simples (a tela é DOM transformado) com `alt=""`, porque o conjunto já é `aria-hidden`.
4. Atualize o BRIEF §5 ("player genérico") para refletir a decisão, e adicione o crédito no `LandingFooter` se for a opção (a).
5. **O player continua sem marca de streaming:** nada de logo do Spotify nem do layout característico dele. Só capa, título, artista e controles genéricos.

**Aceite:** as 4 capas aparecem nítidas nas fotos (1440px e 390px), os títulos estão corretos e o build está verde.

### P2 — Mobile: celular do hero encosta no eyebrow
Em 390 × 844, a base do celular (3D e foto de reserva) encosta no eyebrow "SpotiFamília" acima do `h1`.
- No 3D, ajuste a pose mobile em `three/poses.ts` (y mais alto e/ou escala ~0,75); na foto, ajuste `photo/PhoneFallback.tsx` (altura ~52svh).
- Alternativa no texto: esconder o eyebrow no mobile (`hidden md:inline-flex` em `story/HeroBeat.tsx`), já que a nav já mostra a marca.
- **Aceite:** entre a base do aparelho e o primeiro texto ficam ≥ 16px, em 360, 390 e 430px de largura, nos dois modos (3D e reduced-motion).

### P3 — Aviso do three.js (`THREE.Clock` obsoleto)
O console mostra `THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.`
- Verifique a origem: `grep -rn "new THREE.Clock\|new Clock" components/landing node_modules/@react-three/fiber/dist | head`.
- Se for no nosso código, troque por `delta` do `useFrame`.
- Se for interno do `@react-three/fiber` 9.x com `three` 0.187, **não faça gambiarra**: registre no relatório e verifique se há uma versão do r3f que já corrigiu. Só atualize com tsc, lint, build e capturas verdes.
- **Aceite:** o aviso sumiu, ou ficou documentado como dependência externa.

### P4 — Auditoria de acessibilidade e desempenho
1. **Lighthouse mobile** no build de produção:
   ```bash
   npx lighthouse http://localhost:3100/ --form-factor=mobile --screenEmulation.mobile --only-categories=performance,accessibility,best-practices,seo --output=html --output-path=./lh.html
   ```
   Metas:

   | Métrica | Meta |
   |---|---|
   | Performance | ≥ 85 |
   | Acessibilidade | ≥ 95 |
   | LCP | < 2,5 s, com o `h1` do hero como LCP |
   | CLS | < 0,1 |
2. **JS da landing:** o three.js só deve ser baixado quando `useDeviceTier` disser `high`/`low` (`next/dynamic` com `ssr:false` em `PhoneStage`). Confirme no Network que o chunk do three **não** baixa com reduced-motion.
3. **Imagens:** `sizes` coerentes em todo `DeviceShot`; só o `PhoneFallback` tem `priority`. As fotos-fonte em `public/landing` são webp sem perda (1–1,6 MB). Se o Lighthouse reclamar, gere versões com perda (q≈88) e mantenha as originais fora do `public`.
4. **Acessibilidade:** um único `h1`; ordem dos headings; foco visível em todos os links e botões; contraste AA (o cinza `#86868B` sobre preto em texto pequeno é limítrofe, então verifique); `aria-hidden` em tudo que é decorativo (canvas, telas encaixadas); o conteúdo inteiro faz sentido sem o 3D; navegação por teclado pela página toda; leitor de tela (NVDA) lendo o hero e as seções na ordem.
5. Um agente revisor pode fazer a auditoria em modo somente leitura (`--mode plan`) com relatório estruturado. **Quem corrige é o dono do arquivo** ou o orquestrador.

**Aceite:** metas atingidas, ou cada desvio justificado no relatório.

### P5 — Revisão visual final e detalhes
- Rode as 3 capturas e compare com o storyboard (https://claude.ai/artifact/JGLcX7Cbi3TtM8TPDSe8ib).
- Pontos a observar:
  - quebra do título "Cada um ouve no seu." no mobile (hoje "Cada um / ouve no seu.");
  - o giro de 360° entre hero e slots-1 deve mostrar as câmeras com clareza;
  - nenhuma franja magenta em nenhuma largura (360–1920);
  - o 3D sem jank em CPU 4× mais lenta (DevTools → Performance).
- Mostre as capturas ao usuário antes de fechar.

### Fora do escopo (só com pedido explícito do usuário)
- Aplicar a logo nova e o verde #48E5B2 no sistema (favicon `app/icon.tsx`, dashboard, login).
- Renomear o produto (o usuário decidiu **manter** "SpotiFamília").

---

## 3. Como disparar os agentes (Gemini 3.8 Flash High)

- **CLI:** use o **Antigravity (`agy`)**. O `gemini` CLI não autentica mais nesta conta (`IneligibleTierError`).
- **Modelo:** `gemini-3.8-flash-high`.
- **Worktree:** cada agente trabalha numa worktree e branch próprias (`landing/<nome>`), criadas a partir da `main` atualizada. Ligue `node_modules` por junção do PowerShell: `New-Item -ItemType Junction -Path <wt>\node_modules -Target <repo>\node_modules`. Pelo `cmd mklink` falha por causa do "ç" no caminho.
- **Prompt:** curto, apontando para os arquivos de regras, contrato e BRIEF. O detalhe fica nos arquivos, não na linha de comando.
- **Rodada de correção:** retome o mesmo agente com `--conversation <id>`. O `conversation_id` sai do JSON da primeira execução ou aparece no terminal. Limite: 2 rodadas por agente; depois, o orquestrador corrige.
- **Codex** (imagens) também está disponível: `codex exec ... < /dev/null`. Use o modelo padrão ou `-m gpt-6.1-sol -c model_reasoning_effort=medium`. **Nunca o `gpt-6-astra`**: o usuário reclamou do consumo. As regras de imagem estão em `docs/landing/tools/regras-imagem-codex.txt` (tela magenta `#FF00FF`, proibido pós-processar).

---

## 4. Lições da rodada anterior (evite repetir)

1. **`stdin` aberto trava CLIs headless.** O `codex exec` sem `< /dev/null` ficou ~20 min parado em "Reading additional input from stdin". O mesmo vale para `python -`.
2. **Aspas duplas no prompt quebram o PowerShell 5.1** ao passar argumento para executável nativo: `agy -i (Get-Content ...)` falhou com `unexpected argument`. Tire as aspas duplas do arquivo de prompt (ou passe por stdin) e use `Get-Content -Raw -Encoding UTF8`, porque sem `-Encoding` os acentos viram mojibake.
3. **O Antigravity interativo pede confiança da pasta** na primeira vez em cada worktree. Leia o terminal e envie Enter (`orca terminal send --enter`).
4. **Confira se o agente realmente começou** logo depois de disparar. Não espere às cegas.
5. **Agentes reescrevem arquivos inteiros** e podem desfazer correções feitas pelo orquestrador no mesmo arquivo. Exemplo: o `JSX.Element` → `React.JSX.Element` voltou duas vezes. Rode tsc e lint depois de cada rodada.
6. **Regras de lint do React 19 que os agentes mais violaram:** `react-hooks/set-state-in-effect` (setState síncrono em efeito) e `react-hooks/immutability` (mutar valor de `useMemo`; para buffers por frame use `useRef`). Em `framer-motion`, `exit`/`animate` não aceitam `false`.
7. **Servidor de produção antigo** continua servindo o build anterior, e o resultado são erros 500 nos chunks. Mate o processo da porta antes de `next start`: `Get-NetTCPConnection -LocalPort 3100 | Stop-Process`.
8. **Revisão por captura de tela é obrigatória.** O bug da tela preta do 3D, o magenta no bento e o celular invadindo a seção seguinte passaram em tsc, lint e build e só apareceram nas imagens.

---

## 5. Orca: tornar os agentes visíveis

O usuário acompanha pelo painel do Orca. Use a CLI `orca` (`C:\Users\esmsa\AppData\Local\Programs\orca\resources\bin\orca`):
- `orca repo set --repo path:<repo> --external-worktree-visibility show`: mostra worktrees criadas fora do Orca. Já está ligado neste repo.
- `orca terminal create --worktree path:<wt> --shell powershell.exe --title "Gemini · <nome> (<rodada>)" --command "agy ... -i (Get-Content -Raw -Encoding UTF8 '<prompt>')"`: cria um terminal visível com o agente.
- `orca terminal read --terminal <handle>`, `orca terminal wait --for tui-idle` e `orca terminal send --enter`: acompanham e interagem com o terminal.
- `orca terminal close --terminal <handle>` ao terminar a rodada.
- **Antes de usar, leia a skill `orchestration` do Orca** (`orca skills get orchestration`). Ela descreve o jeito nativo de criar workers, runs e mensagens entre agentes (`orchestration run-create`, `orchestration send`), que pode substituir o disparo manual acima. O usuário pediu explicitamente para seguir esse caminho.

---

## 6. Ao terminar

1. Junte as branches dos agentes numa branch de integração, rode o gate (§1) e as capturas.
2. Mostre o resultado ao usuário e só então faça o merge na `main` e o `git push`. **O push na `main` publica em produção (Vercel).**
3. Remova as worktrees de agentes (`git worktree remove`) e as branches `landing/*` já integradas. Nunca remova sem conferir que tudo foi integrado.
4. Atualize este documento com o que foi feito.

---

## Histórico
| Data | O que | Quem |
|---|---|---|
| 2026-11-07 | Landing nova publicada em produção (commit 9ddc74a) | Claude (orquestrador) + 6 workers Gemini 3.8 Flash High |
| 2026-11-07 | Manual do CEO + specs T1–T4 escritos para o próximo ciclo | Claude |
