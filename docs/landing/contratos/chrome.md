# Contrato: chrome (navegação + rodapé)

## Seus arquivos
- `components/landing/LandingNav.tsx` (substituir o stub)
- `components/landing/LandingFooter.tsx` (substituir o stub)

## `LandingNav`
Barra fixa no topo, no estilo apple.com.
- Altura de 52px, mais `padding-top: env(safe-area-inset-top)`. Padding lateral com `max(24px, env(safe-area-inset-left/right))`.
- **No topo da página:** transparente. **Após 24px de scroll:** `bg-black/72`, `backdrop-blur-xl`, `backdrop-saturate-150` e borda inferior `white/[0.08]`, com transição de 300 ms. Detecte o scroll com `useScroll` + `useMotionValueEvent` do framer-motion, guardando só um booleano no estado e atualizando apenas quando ele mudar.
- **Esquerda:** `<BrandMark size={20} />` de `./BrandMark`, dentro de um link para `/`, com nome em 17px. Não desenhe outra marca.
- **Centro (≥ md):** links "Como funciona" (`#como-funciona`) e "Detalhes" (`#detalhes`), 13px, cinza `#A1A1A6`, branco no hover.
- **Direita:** "Entrar" (`LINKS.login`, link de texto, oculto em telas < 400px) e "Começar grátis" (`LINKS.cadastro`), uma pílula verde pequena (h-8, px-4, 13px, peso 600, texto preto).
- `nav` com `aria-label="Principal"`; foco visível em tudo.

## `LandingFooter`
- Borda superior `white/[0.08]`, padding vertical de 48px e texto de 13px em cinza `#86868B`.
- Linha 1: `<BrandMark />` e, à direita, os links "Entrar" e "Criar conta".
- Linha 2: "Projeto pessoal, sem afiliação com o Spotify." · "© 2026".
- No mobile, tudo empilha.

## Critérios de aceite
1. Discreto e fino como a nav da apple.com: não compete com o hero.
2. O blur aparece só depois de rolar; sem re-render por frame.
3. Links corretos (`LINKS` de `data.ts`) e âncoras funcionando.
4. Funciona em 360px sem quebrar a linha.
