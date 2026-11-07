# T2 — Espaço do celular no hero (mobile) + aviso `THREE.Clock`

Você é um **worker** de front-end, coordenado pelo CEO via Orca. Execute **somente** esta tarefa.

## Contexto
- Na landing (`/`), no **mobile** (390×844), o celular do hero (3D ou foto de reserva) fica no topo e o texto embaixo. Hoje a **base do celular encosta/sobrepõe o "eyebrow"** (a linha pequena verde "SpotiFamília" acima do título). Precisa de respiro.
- O celular aparece de dois jeitos (os dois precisam ficar certos):
  1. **3D** (`components/landing/three/`): pose mobile em `three/poses.ts` (bloco `if (isMobile)`, hoje `target.y = viewportHeight * 0.15 + rawY * 0.35`) e escala em `three/PhoneCanvas.tsx` (`maxMobileH = (viewport.height * 0.44) / PHONE_H`, `baseMobileScale = desktopBaseScale * 0.82`).
  2. **Foto de reserva** (reduced-motion / aparelho fraco): `components/landing/photo/PhoneFallback.tsx`, contêiner com `h-[58svh] sm:h-[60svh]` no mobile.
- O texto do hero está em `components/landing/story/HeroBeat.tsx` (eyebrow com `BrandMark` + "SpotiFamília").
- **Aviso `THREE.Clock`**: o console mostra `THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.` O CEO anterior já investigou: o aviso vem **de dentro do `@react-three/fiber` 9.8.2** (`node_modules/@react-three/fiber/dist/events-*.esm.js`), que é a **versão mais recente** publicada; **não** vem do nosso código.
- Leia antes: `docs/landing/contratos/_regras.md`, `docs/landing/contratos/three.md`, `docs/landing/PLANO-POLIMENTO.md` §1 (invariantes).

## Arquivos que você pode editar
- `components/landing/three/poses.ts`
- `components/landing/three/PhoneCanvas.tsx` — **somente** o cálculo de escala/posição mobile
- `components/landing/photo/PhoneFallback.tsx` — **somente** as classes de tamanho/posição mobile
- `components/landing/story/HeroBeat.tsx` — **somente** se escolher a alternativa do passo 3

**Proibido**: qualquer outro arquivo; `package.json`; reintroduzir `<Html>` do drei; mexer em `StoryStage.tsx`, `BeatBlock.tsx`, `beats.ts`.

## Passo a passo
1. **3D mobile**: ajuste para o aparelho ocupar o terço superior **com margem**:
   - Reduza `maxMobileH` para algo como `viewport.height * 0.40` e/ou suba `target.y` no mobile.
   - Meta: a borda inferior do aparelho projetado fica em **≤ 50% da altura da tela** em 360×740, 390×844 e 430×932, e o topo **não** fica escondido atrás da nav (52px).
   - Dica de verificação matemática: a altura projetada = `PHONE_H * escala`; o centro fica em `target.y`; em unidades de viewport, a base = `viewport.height/2 - (target.y - PHONE_H*escala/2)` medida do topo. Garanta isso nas três alturas acima.
2. **Foto de reserva mobile**: reduza a altura no mobile (ex.: `h-[48svh] sm:h-[50svh]`) e adicione um pequeno `top` (ex.: `top-[56px]`) para não ficar sob a nav. Mantenha o desktop **idêntico** (classes `md:` intocadas).
3. **Se ainda faltar espaço** (avalie pelo texto: o bloco do hero no mobile ocupa o terço inferior), você pode esconder o eyebrow só no mobile: na `div` do eyebrow em `HeroBeat.tsx`, troque para que fique `hidden md:block` (a nav já mostra a marca no mobile). Não mude mais nada no `HeroBeat`.
4. **`THREE.Clock`**: **não** mexa em `node_modules` nem faça monkey-patch. Confirme com `grep -rn "Clock" components/landing` que **nosso** código não usa `THREE.Clock` (se usar, troque pelo `delta` do `useFrame`). Registre no relatório que o aviso é interno do r3f 9.8.2 e some quando o r3f publicar uma versão que use `THREE.Timer`.

## Gate (rode na sua worktree)
```bash
npm ci < /dev/null   # se não existir node_modules
npx tsc --noEmit < /dev/null
npx eslint components/landing < /dev/null
npm run build < /dev/null
```

## Verificação visual (se você conseguir rodar comandos)
Opcional, mas ajuda: suba `npx next start -p 3200` na sua worktree e rode `docs/landing/tools/shoot.cjs` (veja instruções no topo do arquivo; precisa de `playwright-core` numa pasta temporária e `LANDING_URL=http://localhost:3200/`). Olhe `01-hero.png` no modo `mobile` e no modo `desktop reduced`. Se não conseguir, diga no relatório — o CEO faz.

## Entrega
1. `git add` só dos arquivos permitidos; `git commit -m "fix(landing): respiro do celular no hero mobile (T2)"`. **Não faça push.**
2. `worker_done`:
```
RESUMO: <2-3 linhas>
ARQUIVOS: <lista>
VALORES: <novos maxMobileH / y / classes, antes → depois>
THREE.Clock: <confirmação de que não é nosso código + versão do r3f>
EVIDÊNCIAS: tsc ok / eslint ok / build ok; capturas se tiver
NOTES: <ou "nenhuma">
```

## Critérios de aceite
- Mobile (3D e reduced): ≥ 16px entre a base do aparelho e o primeiro texto do hero, em 360, 390 e 430px; nada sob a nav.
- Desktop **inalterado** (o CEO compara `01-hero` desktop antes/depois).
- Nenhum outro beat piorou no mobile (capturas `02`–`07`).
- Diff só com arquivos permitidos. Gate verde.
