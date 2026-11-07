# T3 — Auditoria de acessibilidade e desempenho (SOMENTE LEITURA + relatório)

Você é um **worker revisor**, coordenado pelo CEO via Orca. Você **não corrige nada**: você mede, inspeciona e escreve **um relatório**.

## Arquivo que você pode criar
- `docs/landing/AUDITORIA.md` (único arquivo do seu commit)

Você pode **rodar** comandos (build, servidor, Lighthouse) mas **não pode editar** nenhum outro arquivo. Arquivos gerados (ex.: `lh-*.html`, `lh-*.json`) ficam **fora** do commit (apague-os ou deixe sem `git add`).

## Leia antes
`docs/landing/PLANO-POLIMENTO.md` (§1 e §2-P4), `docs/landing/contratos/_regras.md`, `docs/landing/BRIEF.md` §6, e o código em `components/landing/**` e `app/page.tsx`.

## Passo a passo
1. **Build e servidor**:
   ```bash
   npm ci < /dev/null    # se não existir node_modules
   npm run build < /dev/null
   npx next start -p 3300   # deixe rodando em outro terminal/processo
   ```
2. **Lighthouse** (mobile e desktop), 2 execuções cada, use a **mediana**:
   ```bash
   npx lighthouse http://localhost:3300/ --form-factor=mobile --screenEmulation.mobile --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=./lh-mobile-1.json --chrome-flags="--headless=new" < /dev/null
   npx lighthouse http://localhost:3300/ --preset=desktop --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=./lh-desktop-1.json --chrome-flags="--headless=new" < /dev/null
   ```
   Extraia: notas das 4 categorias, LCP (e qual elemento é o LCP), CLS, TBT, peso total de JS, maiores recursos, e **todas** as auditorias falhando de acessibilidade.
3. **three.js sob demanda**: confirme (pela aba Network do Lighthouse JSON → `network-requests`, ou abrindo o site com reduced-motion) que o chunk do three **não** é baixado quando `prefers-reduced-motion: reduce`. Registre a evidência.
4. **Inspeção manual de acessibilidade** (leia o código e, se puder, navegue):
   - Exatamente **um** `<h1>` (no hero); `h2` por seção; ordem lógica.
   - Foco visível em **todos** os links/botões (procure `focus-visible`).
   - Contraste AA de texto pequeno: `#86868B` e `#A1A1A6` sobre `#000` (calcule a razão; AA exige ≥ 4.5:1 para texto < 18px).
   - Decorativos com `aria-hidden` (canvas, telas encaixadas, ícones decorativos); imagens com `alt` descritivo (fotos em `photo/shots.ts`).
   - Navegação por teclado: Tab percorre nav → CTAs → links do rodapé, sem armadilha.
   - Conteúdo legível com JS desligado (o texto do hero e das seções está no HTML do servidor?).
   - `prefers-reduced-motion`: nada se move sozinho (verifique `Reveal`, `SmoothScroll`, contadores, animações CSS do hero).
5. **Desempenho (código)**: listar componentes `'use client'` que poderiam ser server; imagens sem `sizes` adequado; animações fora de transform/opacity; listeners sem cleanup; alocações por frame em `three/`.

## Formato do relatório (`docs/landing/AUDITORIA.md`)
```markdown
# Auditoria da landing — <data>
## Notas (mediana de 2)
| | Perf | A11y | Best | SEO | LCP | CLS | TBT | JS total |
| mobile | | | | | | | | |
| desktop | | | | | | | | |
Elemento LCP: <...>. three.js com reduced-motion: <baixa / não baixa — evidência>.

## Problemas
| # | Severidade (alta/média/baixa) | Dono (screens/three/story/photo/bento/chrome/fundacao) | Arquivo:linha | Problema | Evidência | Correção sugerida |
|---|---|---|---|---|---|---|

## O que está bom
<lista curta>
```
**Severidade:** alta = falha WCAG AA ou meta do PLANO §2-P4 não atingida (Perf < 85, A11y < 95, LCP ≥ 2,5 s, CLS ≥ 0,1); média = melhoria clara de qualidade; baixa = cosmético.
**Dono:** use a tabela "Mapa de donos" em `docs/landing/CEO.md` §I.

## Entrega
1. `git add docs/landing/AUDITORIA.md && git commit -m "docs(landing): auditoria a11y e desempenho (T3)"`. **Não faça push.** Pare o servidor da porta 3300.
2. `worker_done`:
```
RESUMO: notas mobile/desktop + nº de problemas por severidade
ARQUIVOS: docs/landing/AUDITORIA.md
NOTES: <limitações da medição, ou "nenhuma">
```
