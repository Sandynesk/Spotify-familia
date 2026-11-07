# T1 — Músicas reais no player dos celulares (Matuê e PumaPJL)

Você é um **worker** de front-end, coordenado pelo CEO via Orca. Execute **somente** esta tarefa.

## DECISÕES DO USUÁRIO (o CEO preenche antes de disparar)
```
MODO: <capas-reais | so-nomes>
QUANTIDADE: <ex.: 2 Matuê + 2 PumaPJL>
FAIXAS ESCOLHIDAS PELO USUÁRIO: <lista, ou "o worker escolhe e o CEO aprova">
```
Se este bloco ainda tiver `<...>`, **pare** e pergunte ao CEO (`ask`) antes de fazer qualquer coisa.

## Contexto
- A landing (`/`) tem a seção "Cada um ouve no seu" (`components/landing/photo/Everyone.tsx`): uma foto com 5 celulares; o do centro mostra o painel do app e **os 4 laterais mostram um player de música** (`components/landing/screens/PlayerScreen.tsx`), hoje com faixas **fictícias** e capas em **gradiente**.
- O usuário quer **músicas reais** de **Matuê** e **PumaPJL** nesses 4 players.
- Leia antes: `docs/landing/contratos/_regras.md`, `docs/landing/contratos/screens.md`, `docs/landing/BRIEF.md` (§5 regras de marca), `components/landing/screens/PlayerScreen.tsx` (inteiro), `components/landing/photo/Everyone.tsx`.

## Arquivos que você pode editar/criar
- `components/landing/screens/PlayerScreen.tsx`
- `components/landing/screens/tracks.ts` (novo)
- `public/landing/covers/*.jpg` (novos; só no MODO `capas-reais`)
- `components/landing/LandingFooter.tsx` — **somente** para adicionar a linha de crédito (MODO `capas-reais`)
- `docs/landing/BRIEF.md` — **somente** o item do player em §4 ("Cada um no seu") e §5 (regras de marca), para refletir a decisão

**Qualquer outro arquivo é proibido.** Não mude a assinatura `export function PlayerScreen(props: { variant: 0 | 1 | 2 | 3 })`.

## Passo a passo
1. **Escolher as 4 faixas** (se o usuário não escolheu):
   - Use a QUANTIDADE do bloco de decisões. Prefira faixas conhecidas e de álbuns/singles oficiais.
   - **Verifique cada faixa numa fonte real** (busca na web / página da faixa no Spotify). **Não invente** títulos, álbuns ou durações. Candidatos para começar a pesquisa (NÃO verificados): do Matuê, faixas dos álbuns *Máquina do Tempo* (2020) e *333* (2024); do PumaPJL, pesquise a discografia oficial.
   - Para cada faixa anote: título, artista (como creditado), álbum/single, duração real (m:ss), URL da faixa no Spotify (`https://open.spotify.com/track/<id>`).
   - **Antes de aplicar**, mande a lista ao CEO com `ask` e **espere aprovação** (o CEO confirma com o usuário). Formato: `1. Título — Artista — Álbum (ano) — 3:12 — URL`.
2. **Capas** (só MODO `capas-reais`):
   - Para cada URL, consulte a oEmbed pública (sem autenticação): `https://open.spotify.com/oembed?url=<URL da faixa>` → campo `thumbnail_url`.
   - Baixe a imagem para `public/landing/covers/<slug>.jpg` (slug: `artista-titulo` em minúsculas, sem acento, com hífens). Ex. (PowerShell): `Invoke-WebRequest -Uri "<thumbnail_url>" -OutFile "public/landing/covers/<slug>.jpg"`.
   - Confirme que cada arquivo existe e tem > 10 KB. **Não faça hotlink** (a página não pode depender do Spotify em tempo de execução).
3. **Dados** — crie `components/landing/screens/tracks.ts`:
   ```ts
   export interface Track {
     title: string
     artist: string
     album: string
     /** caminho em /public, ou null no modo so-nomes */
     cover: string | null
     /** gradiente usado quando cover é null */
     gradient: string
     duration: string     // "3:12" (real)
     currentTime: string  // posição fictícia do player, < duration
     progressPercent: number // coerente com currentTime/duration
   }
   export const TRACKS: readonly [Track, Track, Track, Track] = [ /* 4 faixas */ ]
   ```
   Mantenha os gradientes atuais do `PlayerScreen` como `gradient` (fallback).
4. **PlayerScreen** — use `TRACKS[variant]`:
   - Capa: se `cover` existe, `<img src={cover} alt="" width={...} height={...} draggable={false} style={{objectFit:'cover'}}>` no mesmo quadrado/raio de hoje; senão, o gradiente atual.
   - Título, artista, tempo atual, duração e barra de progresso vêm da faixa.
   - **Não adicione** nenhum logo ou elemento visual do Spotify (nem o verde do Spotify como cor do player). Ícones continuam os do `lucide-react`.
   - Não use `next/image` aqui (a tela é DOM transformado por matriz 3D; `<img>` simples é o correto). Use `{/* eslint-disable-next-line @next/next/no-img-element */}` acima do `<img>` se o lint reclamar.
5. **Crédito** (só MODO `capas-reais`): em `LandingFooter.tsx`, na linha do aviso legal, acrescente: `Capas de álbuns: © respectivos artistas e gravadoras.` (mesmo estilo de texto da linha).
6. **BRIEF**: atualize o texto do player em §4 e a regra do player genérico em §5 para refletir: "player com faixas reais de Matuê e PumaPJL (decisão do usuário em 2026-11), sem nenhum elemento visual de serviço de streaming".

## Gate (rode na sua worktree)
```bash
# se não existir node_modules:
npm ci < /dev/null
npx tsc --noEmit < /dev/null
npx eslint components/landing < /dev/null
npm run build < /dev/null
```
Tudo precisa passar (tsc sem saída; eslint sem "error"; build com "Compiled successfully").

## Entrega
1. `git add` **só** dos arquivos permitidos e `git commit -m "feat(landing): faixas reais no player (T1)"` na sua branch. **Não faça push.**
2. Reporte com `worker_done`:
```
RESUMO: <2-3 linhas>
ARQUIVOS: <lista>
FAIXAS: <as 4, no formato do passo 1>
EVIDÊNCIAS: tsc ok / eslint ok / build ok (cole a linha "Compiled successfully"); tamanhos dos .jpg
NOTES: <riscos, dúvidas, ou "nenhuma">
```

## Critérios de aceite (o CEO vai checar)
- As 4 faixas existem de verdade (títulos, artistas e durações corretos) e foram aprovadas.
- Capas nítidas nos 4 celulares em 1440px e 390px (captura `08-everyone`), sem distorção.
- Nenhum elemento visual do Spotify no player. Crédito no rodapé (modo capas-reais).
- Diff só com arquivos permitidos. Gate verde.
