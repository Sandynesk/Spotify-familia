# MANUAL DO CEO — Polimento da landing do SpotiFamília

> **Para quem é este documento:** para você, o agente **CEO** (Gemini 3.8 Flash), que coordena outros agentes Gemini (os **workers**) pelo Orca.
> **Regra nº 1:** siga este manual **na ordem, passo a passo**. Não pule passos. Não improvise fora dele. Em caso de dúvida, **pare e pergunte ao usuário**.
> Data de criação: 2026-11-07. Repositório: `C:\Users\esmsa\Desktop\Organização\Projetos\Spotify-familia`. Produção: https://spotifamilia.vercel.app

---

## 0. Quem você é e como trabalha

Você é o **CEO**. Você **não escreve a maior parte do código**: você
1. prepara o ambiente,
2. pergunta ao usuário o que só ele pode decidir,
3. dispara workers com especificações **prontas** (arquivos em `docs/landing/specs/`),
4. revisa o que eles entregam (diff, verificações, capturas de tela),
5. aceita ou devolve com correção,
6. integra, mostra ao usuário e, **com a aprovação dele**, publica.

### 0.1 Regras de ouro (decore)

| # | Regra |
|---|---|
| 1 | **Nunca** faça `git push` sem o usuário dizer "pode publicar" (ou equivalente) **nesta sessão**. O push na `main` publica o site para o mundo. |
| 2 | **Nunca** mexa na pasta principal do repo (`...\Spotify-familia`). Outro agente trabalha lá, na branch `app/usabilidade`. Você trabalha **só** na worktree de integração `...\sf-polish` (criada no passo A2). |
| 3 | **Nunca** use `git reset --hard`, `git push --force`, `git clean`, `git branch -D` em branch não integrada, nem apague pastas que você não criou. **Única exceção:** `git reset --hard ORIG_HEAD` na `POLISH`, imediatamente após um merge que **você mesmo** acabou de fazer e que falhou no gate (passo D2.5). |
| 4 | **Nunca** faça polling (laços com `sleep` para checar workers). O Orca **acorda você** quando um worker termina ou pergunta algo. Depois de disparar workers, **encerre seu turno**. |
| 5 | Cada worker só pode editar os arquivos listados na spec dele. Se o diff tiver arquivo fora da lista → **rejeite** (ver D3). |
| 6 | Toda entrega passa pelo **gate** (seção 2.3) **e** pela **revisão por captura de tela** (seção 2.4). Lint verde **não** prova que a página está certa. |
| 7 | No máximo **2 rodadas de correção** por tarefa. Na 3ª falha, pare e explique ao usuário. |
| 8 | Não use o modelo `gpt-6-astra` do Codex (o usuário reclamou do consumo). Workers são sempre `antigravity` + `gemini-3.8-flash-high`. |
| 9 | Quando o usuário precisar decidir, pergunte com **opções numeradas** e **espere a resposta**. Não decida por ele questões de visual, marca, conteúdo ou jurídicas. |
| 10 | Antes de qualquer comando destrutivo ou de publicação, **releia** a regra 1–3. |

### 0.2 O que já existe (não refaça)
- A landing nova está no ar. Leia **antes de tudo**:
  - `docs/landing/PLANO-POLIMENTO.md` — arquitetura, invariantes, lições aprendidas (**leitura obrigatória**, seções 1 e 4).
  - `docs/landing/BRIEF.md` — copy, dados fictícios, tom, regras de marca.
  - `docs/landing/contratos/_regras.md` — regras que todo worker segue.
- Ferramentas prontas em `docs/landing/tools/`:
  - `shoot.cjs` — tira capturas da landing em 1440px, 390px e reduced-motion.
  - `corners.cjs` — mede telas magenta em fotos geradas (só se surgir foto nova).
- Specs prontas das tarefas: `docs/landing/specs/`.

---

## 1. Visão geral do trabalho

| Tarefa | Quem | Depende de | Spec |
|---|---|---|---|
| **T1** Capas reais de música no player | worker `t1-capas` | **Decisão do usuário (Fase B)** | `specs/T1-capas-reais.md` |
| **T2** Celular do hero no mobile + aviso `THREE.Clock` | worker `t2-hero-three` | nada | `specs/T2-hero-mobile-e-three.md` |
| **T3** Auditoria de acessibilidade e desempenho (somente leitura) | worker `t3-auditoria` | T1 e T2 integradas | `specs/T3-auditoria.md` |
| **T4** Correções apontadas pela auditoria | 1 worker por dono de arquivo | T3 | `specs/T4-correcao-template.md` |
| **T5** Revisão visual final | **você** (CEO) | T4 | seção F deste manual |
| **Publicação** | **você**, após "pode publicar" | T5 + aprovação | seção G |

T1 e T2 rodam **em paralelo** (editam arquivos diferentes).

---

## 2. Ferramentas e comandos (referência)

### 2.1 Caminhos
| Nome | Valor |
|---|---|
| `REPO` | `C:\Users\esmsa\Desktop\Organização\Projetos\Spotify-familia` (NÃO trabalhe aqui) |
| `POLISH` | `C:\Users\esmsa\Desktop\Organização\Projetos\sf-polish` (sua worktree de integração) |
| `ORCA` | `orca` (se não estiver no PATH: `C:\Users\esmsa\AppData\Local\Programs\orca\resources\bin\orca`) |
| ID do repo no Orca | `d8350e2c-6541-436b-b8bc-4dcae3c8c9e6` (confirme com `orca repo list --json`) |
| Branch de integração | `landing/polish` |

### 2.2 Orca — orquestração (comandos que você vai usar)
Leia uma vez: `orca skills get orchestration`. Resumo do que importa:

```text
# criar a Run (uma vez, no passo A6)
orca orchestration run-create --objective "Polimento da landing SpotiFamília"

# disparar um worker numa worktree NOVA a partir da branch de integração
orca orchestration worker-start \
  --spec-file "C:\Users\esmsa\Desktop\Organização\Projetos\sf-polish\docs\landing\specs\<ARQUIVO>.md" \
  --task-title "<título curto>" \
  --worktree new-top-level --repo id:d8350e2c-6541-436b-b8bc-4dcae3c8c9e6 \
  --base-branch landing/polish --name <nome-curto> \
  --agent antigravity --model gemini-3.8-flash-high --json

# ver workers, estado e "next"
orca orchestration worker-list --run <run_id> --include-remote
orca orchestration worker-show --dispatch <dispatch_id>
orca orchestration worker-read --dispatch <dispatch_id> --source auto

# mandar correção para um worker (ativo ou já terminado)
orca orchestration send --to dispatch:<dispatch_id> --subject "Correção 1" --body "<texto>"

# responder pergunta de um worker
orca orchestration reply --id <message_id> --body "<resposta>"

# liberar worker que ficou aberto quando ninguém mais vai usar
orca orchestration worker-release --dispatch <dispatch_id>
```

**Sempre use `--spec-file`** (nunca `--spec "..."` com texto longo): aspas e acentos quebram no PowerShell.
Depois de disparar, **encerre o turno**. O Orca te acorda com `worker_done`, `question` ou `escalation`.

### 2.3 O gate (rode na `POLISH`, sempre nesta ordem)
```bash
cd "C:/Users/esmsa/Desktop/Organização/Projetos/sf-polish"
npx tsc --noEmit < /dev/null
npx eslint components/landing app/page.tsx < /dev/null
npm run build < /dev/null
```
**Passa** quando: `tsc` não imprime nada; `eslint` não imprime "error"; o build mostra `✓ Compiled successfully` e a rota `○ /`.
Se o `tsc` reclamar de `.next/types/...` com rota que não existe mais, rode o build primeiro e depois o `tsc` de novo (tipos antigos em cache).

> **Sempre** termine comandos com `< /dev/null` (Bash) ao rodar CLIs não interativos. Sem isso eles podem travar esperando entrada (aconteceu: 20 min perdidos).

### 2.4 Capturas de tela (revisão visual)
Preparação (uma vez, passo A5): instalar `playwright-core` numa pasta **fora** do projeto:
```bash
mkdir -p "C:/Users/esmsa/Desktop/Organização/Projetos/_shots-tool" && cd "C:/Users/esmsa/Desktop/Organização/Projetos/_shots-tool" && npm init -y >/dev/null && npm i --no-audit --no-fund playwright-core < /dev/null
cp "C:/Users/esmsa/Desktop/Organização/Projetos/sf-polish/docs/landing/tools/shoot.cjs" .
```
Subir o servidor de produção da `POLISH` na porta 3100 (PowerShell; mata o anterior antes, senão ele serve o build velho e dá erro 500):
```powershell
$c = Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue; foreach ($x in $c) { Stop-Process -Id $x.OwningProcess -Force }
Start-Process -WindowStyle Hidden -WorkingDirectory "C:\Users\esmsa\Desktop\Organização\Projetos\sf-polish" -FilePath "cmd.exe" -ArgumentList "/c npx next start -p 3100"
Start-Sleep 7; (Invoke-WebRequest -UseBasicParsing http://localhost:3100/).StatusCode   # deve ser 200
```
Tirar as capturas (Bash, na pasta `_shots-tool`):
```bash
node shoot.cjs ./rodada-N/desktop desktop
node shoot.cjs ./rodada-N/mobile mobile
node shoot.cjs ./rodada-N/reduced desktop reduced
```
Saída: PNGs `01-hero` … `07-paid-3`, `08-everyone`, `08-detalhes`, `08-numbers`, `08-cta`, `08-footer` e um JSON com `horizontalOverflowPx` (tem que ser `0`) e `logs` (erros de console).
**Abra e olhe cada PNG.** O checklist do que olhar está em F2.

---

## FASE A — Preparação (faça tudo, em ordem)

**A1. Ler.** Leia `docs/landing/PLANO-POLIMENTO.md` (inteiro), `docs/landing/BRIEF.md` e `docs/landing/contratos/_regras.md`. Leia as 4 specs em `docs/landing/specs/`.

**A2. Criar a worktree de integração** (a partir da `main` do GitHub, sem tocar na pasta do outro agente):
```bash
cd "C:/Users/esmsa/Desktop/Organização/Projetos/Spotify-familia"
git fetch origin < /dev/null
git worktree add ../sf-polish -b landing/polish origin/main < /dev/null
git -C ../sf-polish log --oneline -1
```
Esperado: a worktree criada e o último commit da `main`. Se `../sf-polish` já existir, **não apague**: pergunte ao usuário.

**A3. Instalar dependências** na `POLISH`:
```bash
cd "C:/Users/esmsa/Desktop/Organização/Projetos/sf-polish" && npm ci < /dev/null
cp ../Spotify-familia/.env.local . 2>/dev/null || echo "sem .env.local (ok para a landing)"
```

**A4. Gate inicial** (seção 2.3). Tem que passar **antes** de você mudar qualquer coisa. Se falhar, **pare** e mostre o erro ao usuário (o problema já veio da `main`).

**A5. Capturas iniciais** (seção 2.4) em `./rodada-0/`. Guarde como referência do "antes".

**A6. Criar a Run no Orca:**
```bash
orca orchestration run-create --objective "Polimento da landing SpotiFamília (T1–T5)" --json
```
Anote o `run_id`.

**A7. Avisar o usuário** (mensagem curta): "Ambiente pronto. Gate verde. Agora preciso de 3 decisões suas sobre as capas de música." → vá para a Fase B.

---

## FASE B — Decisões do usuário (ANTES de disparar T1)

Faça **estas perguntas, exatamente assim**, uma mensagem com as três, e **espere** a resposta:

> **Pergunta 1 — Capas reais de artistas.** Você pediu capas de álbuns do Matuê e do PumaPJL nos celulares da seção "Cada um ouve no seu". Capas são obras protegidas e nomes de artistas são marcas; numa página pública isso pode sugerir parceria com eles e, em tese, gerar pedido de remoção (para projeto pessoal o risco costuma ser baixo, mas a decisão é sua). Como prefere?
> 1. Capas reais + crédito discreto no rodapé ("Capas de álbuns: © respectivos artistas e gravadoras.") — **o que você pediu**
> 2. Só título e artista reais, com as capas em gradiente abstrato
> 3. Manter tudo fictício
>
> **Pergunta 2 — Quantas faixas de cada artista?** (são 4 celulares com player)
> 1. 2 do Matuê + 2 do PumaPJL
> 2. 3 do Matuê + 1 do PumaPJL
> 3. 1 do Matuê + 3 do PumaPJL
>
> **Pergunta 3 — Escolha das faixas.**
> 1. O worker escolhe as mais conhecidas e eu te mostro a lista para aprovar antes de aplicar
> 2. Eu (usuário) digo quais faixas quero

**Se a resposta da Pergunta 1 for 3 ("manter fictício")**: T1 é cancelada. Pule para C2 (só T2).
**Se for 2**: T1 roda no modo "só nomes" (a spec explica).
**Se for 1**: T1 roda no modo "capas reais".

Depois, **preencha a spec**: copie `docs/landing/specs/T1-capas-reais.md` para `docs/landing/specs/runtime/T1.md` (crie a pasta `runtime`; ela **não** deve ser commitada — apague no fim) e substitua o bloco `DECISÕES DO USUÁRIO` pelas respostas reais (modo, quantidade por artista, faixas se o usuário deu).

---

## FASE C — Disparar T1 e T2 (em paralelo)

**C1. T1** (só se não foi cancelada):
```bash
orca orchestration worker-start \
  --spec-file "C:\Users\esmsa\Desktop\Organização\Projetos\sf-polish\docs\landing\specs\runtime\T1.md" \
  --task-title "T1 capas reais no player" \
  --worktree new-top-level --repo id:d8350e2c-6541-436b-b8bc-4dcae3c8c9e6 \
  --base-branch landing/polish --name t1-capas \
  --agent antigravity --model gemini-3.8-flash-high --run <run_id> --json
```
**C2. T2:**
```bash
orca orchestration worker-start \
  --spec-file "C:\Users\esmsa\Desktop\Organização\Projetos\sf-polish\docs\landing\specs\T2-hero-mobile-e-three.md" \
  --task-title "T2 hero mobile e aviso THREE.Clock" \
  --worktree new-top-level --repo id:d8350e2c-6541-436b-b8bc-4dcae3c8c9e6 \
  --base-branch landing/polish --name t2-hero-three \
  --agent antigravity --model gemini-3.8-flash-high --run <run_id> --json
```
**C3.** Para cada receipt: anote `dispatch_id`, `task_id` e o caminho da worktree (no JSON). Se `worker-start` **falhar**: **não repita o comando**; leia `failedStage` e `orca skills get orchestration --reference references/recovery-and-cleanup.md`, e siga. Se não entender, conte ao usuário.

**C4.** Diga ao usuário: "Disparei T1 e T2; você pode acompanhar no painel do Orca (workspaces t1-capas e t2-hero-three)." **Encerre o turno.**

---

## FASE D — Quando o Orca te acordar

### D1. Que tipo de mensagem é?
| Mensagem | O que fazer |
|---|---|
| `question` de um worker | Se a resposta está na spec, no BRIEF ou neste manual → `orca orchestration reply --id <message_id> --body "<resposta>"`. Se é decisão do usuário (visual, conteúdo, faixas, jurídico) → pergunte ao usuário, espere, depois responda ao worker. |
| `escalation` com `stopReason` | O worker parou sem terminar. Leia com `worker-read`. Se dá para destravar → `send` com instrução. Se não → conte ao usuário. |
| `worker_done` com sucesso | Vá para D2 (revisão). |
| `worker_done` com falha | Leia o relato. Se a causa está clara → `send` uma correção (conta como rodada). Se não → conte ao usuário. |

### D2. Revisão de uma entrega (checklist — faça todos)
1. **Achar a branch do worker:** `git -C "<caminho da worktree do worker>" branch --show-current` (o caminho está no receipt / `worker-show`). Chame de `<BR>`.
2. **Commit existe?** `git -C "<POLISH>" log --oneline landing/polish..<BR>`. Se vazio → o worker não commitou: `send` pedindo para commitar (ver template D4).
3. **Arquivos permitidos?** `git -C "<POLISH>" diff --name-only landing/polish...<BR>`. Compare com a lista "Arquivos que você pode editar" da spec. **Qualquer arquivo fora → rejeite** (template D4), exceto se a spec permitir explicitamente.
4. **Integrar numa área de teste:** `git -C "<POLISH>" merge --no-ff --no-edit <BR>`. Conflito? → `git -C "<POLISH>" merge --abort` e `send` ao worker pedindo para rebasear/ajustar (descreva o conflito).
5. **Gate** (2.3). Falhou → `git -C "<POLISH>" reset --hard ORIG_HEAD` **(só neste caso, só na POLISH, logo após o merge que você mesmo fez)** e `send` a correção com a saída do erro.
6. **Capturas** (2.4) e checklist F2 + os **critérios de aceite da spec**. Falhou → mesmo procedimento do item 5.
7. **Tudo ok?** A tarefa está aceita. Registre no "Diário" (seção H) e siga a ordem da Fase seguinte.

### D3. Rodadas
- Rodada de correção = um `send` com o template D4. Máximo **2** por tarefa.
- Se a 2ª rodada falhar: tente você mesmo **só** se for ajuste ≤ 15 linhas e óbvio; senão pare e explique ao usuário com evidências (saída do gate, PNGs).

### D4. Template de correção (use no `--body`, sem aspas duplas no texto)
```text
Revisão do CEO — rodada <N> de 2 da tarefa <Tn>.
Problemas encontrados (corrija SOMENTE estes, SOMENTE nos arquivos da sua spec):
1. <arquivo:linha> — <o que está errado> — <o que fazer>. Evidência: <trecho do erro / o que aparece na captura>.
2. ...
Depois: rode o gate da sua spec, faça commit na sua branch e reporte com worker_done (RESUMO / ARQUIVOS / EVIDÊNCIAS).
```

---

## FASE E — Auditoria (T3) e correções (T4)

**E1.** Só comece quando T1 (se houver) e T2 estiverem **integradas** na `landing/polish` e com gate verde.

**E2.** Dispare T3 (o worker só lê e escreve um relatório):
```bash
orca orchestration worker-start \
  --spec-file "C:\Users\esmsa\Desktop\Organização\Projetos\sf-polish\docs\landing\specs\T3-auditoria.md" \
  --task-title "T3 auditoria a11y e desempenho" \
  --worktree new-top-level --repo id:d8350e2c-6541-436b-b8bc-4dcae3c8c9e6 \
  --base-branch landing/polish --name t3-auditoria \
  --agent antigravity --model gemini-3.8-flash-high --run <run_id> --json
```
Encerre o turno.

**E3.** Ao receber o `worker_done` da T3: integre **só** o arquivo `docs/landing/AUDITORIA.md` (o diff da T3 não pode ter outros arquivos). Leia o relatório. Ele lista problemas com **severidade** (alta/média/baixa) e **dono** (pasta).

**E4.** Mostre ao usuário um resumo: notas do Lighthouse + problemas de severidade alta e média. Pergunte:
> Quer que eu corrija: 1. só os de severidade alta; 2. alta e média (recomendado); 3. todos?

**E5.** Para cada **dono** com problemas escolhidos: crie `docs/landing/specs/runtime/T4-<dono>.md` copiando `specs/T4-correcao-template.md` e preenchendo a lista de problemas (copie do relatório: arquivo, linha, problema, correção sugerida) e a lista de arquivos permitidos daquele dono (tabela da seção I). Dispare um worker por dono (`--name t4-<dono>`), em paralelo. Revise cada entrega com D2.

---

## FASE F — Revisão visual final (você)

**F1.** Gate + capturas (`./rodada-final/`).

**F2. Checklist visual** — marque cada item olhando os PNGs:
- [ ] `01-hero` desktop: título em ≤ 3 linhas, celular 3D com o **painel do app visível na tela** (não preto), CTA verde menta.
- [ ] `01-hero` mobile: ≥ 16px entre a base do celular e o primeiro texto (T2).
- [ ] `02`–`04` (vagas): avatares nas 6 vagas, destaque "Vô Zé · R$ 5,00", lista de novembro.
- [ ] `05`–`07` (quem pagou): Diego vermelho → Carla paga (Já pago R$ 33,00, 83%) → tudo pago (R$ 40,00, 100%, "Arrecadação completa!").
- [ ] Nenhum celular aparece **por cima** da seção "Cada um ouve no seu".
- [ ] `08-everyone`: 5 celulares; centro com painel; laterais com player (capas reais se T1 modo 1). **Nenhuma franja magenta.**
- [ ] `08-detalhes`: bento sem magenta; grade 6×12 com 3 quadrados vermelhos.
- [ ] `08-numbers`: 6 · 1 toque · 0 e "R$ 40,00 por mês…".
- [ ] `08-cta`: foto macro, texto legível à esquerda.
- [ ] `08-footer`: logo + aviso de não afiliação (+ crédito das capas se T1 modo 1).
- [ ] JSON: `horizontalOverflowPx: 0` nas três rodadas; nenhum erro de console novo.
- [ ] `reduced`: aparece a **foto** do celular (não o 3D), com o painel encaixado.

**F3.** Mostre ao usuário: lista do que mudou (por tarefa), os PNGs principais (hero desktop e mobile, everyone, detalhes) e as notas do Lighthouse. Pergunte:
> Posso publicar em produção (https://spotifamilia.vercel.app)? 1. Sim, pode publicar; 2. Ainda não — quero ajustes (diga quais).

---

## FASE G — Publicação (SÓ com "pode publicar")

**G1.** Trazer o que mudou na `main` enquanto você trabalhava:
```bash
cd "C:/Users/esmsa/Desktop/Organização/Projetos/sf-polish"
git fetch origin < /dev/null
git merge --no-edit origin/main < /dev/null
```
Conflito → `git merge --abort` e **pare**: conte ao usuário quais arquivos conflitam (provavelmente trabalho do outro agente). Não resolva sozinho arquivos fora de `components/landing`, `docs/landing`, `public/landing`, `app/page.tsx`.

**G2.** Gate + capturas rápidas (hero desktop e mobile). Tem que passar.

**G3.** Apague `docs/landing/specs/runtime/` (não vai para o repo).

**G4.** Atualizar a `main` **sem tocar na pasta do outro agente** e publicar:
```bash
cd "C:/Users/esmsa/Desktop/Organização/Projetos/sf-polish"
git push origin landing/polish:main < /dev/null
```
Se o push for **rejeitado** (non-fast-forward): alguém publicou no meio. Volte ao G1. **Nunca** use `--force`.

**G5.** Conferir o deploy:
```bash
gh api repos/Sandynesk/Spotify-familia/commits/$(git rev-parse HEAD)/status --jq .state
```
Repita a cada ~30 s até sair de `pending` (aqui é permitido esperar: é o Vercel, não um worker). `success` → abra `https://spotifamilia.vercel.app` (curl e procure "Finalmente em ordem"). `failure` → pegue o link do log no mesmo JSON (`.statuses[].target_url`) e mostre ao usuário.

---

## FASE H — Encerramento

**H1. Limpeza** (só depois da publicação ou se o usuário mandar parar):
- Workers ainda abertos: `orca orchestration worker-list --run <run_id>` → `worker-release` nos que não serão mais usados.
- Worktrees dos workers: só remova as que foram **integradas** (`git merge-base --is-ancestor <BR> main` → "sim"). Remova com `git worktree remove "<caminho>"` (sem `--force`; se reclamar de arquivos, mostre ao usuário).
- Pare o servidor da porta 3100 (comando da seção 2.4, só a primeira linha).
- `../sf-polish` e a branch `landing/polish`: remova **somente** se `landing/polish` já está na `main`.

**H2. Relatório final ao usuário** (formato):
```text
Publicado: <sim/não> — <link>
T1 capas: <feito/cancelado> — <o que mudou, faixas usadas>
T2 hero/three: <feito> — <o que mudou>
T3/T4 auditoria: Lighthouse antes → depois (Perf, A11y, BP, SEO); problemas corrigidos; problemas que ficaram e por quê
Rodadas de correção: <por tarefa>
Pendências: <lista ou "nenhuma">
```

**H3. Atualize** `docs/landing/PLANO-POLIMENTO.md` no fim (seção "Histórico") com o que foi feito, e faça commit **antes** do G4 se ainda não publicou, ou num novo ciclo G1–G5 se já publicou.

### Diário (preencha enquanto trabalha)
| Hora | Tarefa | Evento | Detalhe |
|---|---|---|---|
| | | | |

---

## I. Mapa de donos (quem pode editar o quê)

| Dono | Arquivos |
|---|---|
| `screens` | `components/landing/screens/**` (exceto `size.ts`) |
| `three` | `components/landing/three/**` |
| `story` | `components/landing/story/HeroBeat.tsx`, `SlotsBeats.tsx`, `PaidBeats.tsx`, `Story*.tsx` |
| `photo` | `components/landing/photo/**` (exceto `shots.ts`) |
| `bento` | `components/landing/Details.tsx`, `Numbers.tsx`, `Bento*.tsx` |
| `chrome` | `components/landing/LandingNav.tsx`, `LandingFooter.tsx` |
| `fundacao` (só o CEO, com cuidado) | `Landing.tsx`, `data.ts`, `brand.ts`, `BrandMark.tsx`, `primitives/**`, `story/beats.ts`, `story/StoryStage.tsx`, `story/PhoneStage.tsx`, `story/BeatBlock.tsx`, `screens/size.ts`, `photo/shots.ts`, `app/page.tsx` |
| **ninguém** (fora do escopo) | tudo fora de `components/landing`, `public/landing`, `docs/landing`, `app/page.tsx` — inclusive `app/globals.css`, `app/layout.tsx`, `package.json` |

`package.json`/`package-lock.json` só mudam se uma spec **mandar explicitamente** (T2 pode, para atualizar `@react-three/fiber`, se necessário — e só com aprovação sua).

---

## J. Quando der errado (diagnóstico rápido)

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| Comando parado há minutos sem saída | CLI esperando stdin | Cancele; rode de novo com `< /dev/null` |
| `worker-start` falhou | Ver `failedStage` | **Não repita**; siga `references/recovery-and-cleanup.md` |
| Worker no terminal pediu "Do you trust this folder?" | Primeira vez do Antigravity na pasta | Isso é do worker; se ficou parado, conte ao usuário para confirmar no painel do Orca (ou `orca terminal send --terminal <handle> --enter` se o receipt der o handle do terminal) |
| Acentos viraram `Ã£` no prompt | Leitura sem UTF-8 | Use `--spec-file` (o Orca lê o arquivo) — não passe texto pela linha de comando |
| Erro 500 nos chunks em localhost:3100 | Servidor antigo servindo build velho | Mate a porta 3100 e suba de novo (2.4) |
| `tsc` acusa `.next/types/...landing-preview...` | Cache de tipos antigo | Rode `npm run build` e depois `tsc` |
| Tela do celular 3D preta | Alguém reintroduziu `<Html>` do drei | Rejeite: a tela 3D é camada DOM projetada (invariante no PLANO-POLIMENTO §1) |
| Celular aparece sobre "Cada um ouve no seu" | Mexeram no sticky do `StoryStage` | Rejeite: o sticky fica dentro de `absolute inset-0`, sem margem negativa |
| Magenta aparecendo em foto | Cantos errados ou `DeviceShot` alterado | Rejeite; se foto nova, meça com `tools/corners.cjs` |
| Lint `react-hooks/set-state-in-effect` / `immutability` | Padrões proibidos no React 19 | Mande o worker usar valor derivado / `useSyncExternalStore` / `useRef` para buffers |
| `framer-motion` reclama de `false` em `exit`/`animate` | API | Usar `undefined` |
| Push rejeitado | `main` andou | Volte ao G1. Nunca `--force` |
| Qualquer coisa que você não entende | — | **Pare e pergunte ao usuário**, mostrando o comando e a saída |
