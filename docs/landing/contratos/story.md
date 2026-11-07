# Contrato: story (texto da narrativa 3D)

## Seus arquivos
- `components/landing/story/HeroBeat.tsx`
- `components/landing/story/SlotsBeats.tsx`
- `components/landing/story/PaidBeats.tsx`
- Arquivos novos com o prefixo `components/landing/story/Story*.tsx` (ex.: `StoryText.tsx`), se quiser componentes auxiliares.

**Não edite** `beats.ts`, `StoryStage.tsx`, `PhoneStage.tsx` nem `BeatBlock.tsx`.

## Como funciona
O `StoryStage` cria um trecho de scroll com o celular (3D ou foto) preso atrás, e os seus componentes são os blocos de texto que rolam por cima. **Cada beat é exatamente um `<BeatBlock beat="...">`**, com altura de 100svh, que não pode ser alterada. Os beats e a ordem estão fixados em `beats.ts`:
- `HeroBeat`: 1 bloco (`hero`)
- `SlotsBeats`: 3 blocos (`slots-1`, `slots-2`, `slots-3`); o wrapper tem `id="como-funciona"`
- `PaidBeats`: 3 blocos (`paid-1`, `paid-2`, `paid-3`)

O `BeatBlock` já posiciona o texto: no desktop, coluna esquerda, verticalmente centralizado; no mobile, o terço inferior. Lá o celular fica atrás, no topo, então coloque um degradê de legibilidade (`from-black via-black/80 to-transparent`, de baixo para cima) **só no mobile**.

## Copy
Use exatamente a do BRIEF §4: Hero, Seis vagas e Quem pagou.

**Hero**
- Eyebrow `SpotiFamília`: pequeno, verde, peso 600.
- `h1` em duas linhas: "Plano Família." em branco e "Finalmente em ordem." em `var(--landing-accent)`. Tamanho `clamp(48px, 7.2vw, 104px)`.
- Subtítulo em cinza `#A1A1A6`, `clamp(19px, 1.6vw, 24px)`.
- CTAs:
  - `Começar grátis`: pílula verde, texto preto, peso 600, `href={LINKS.cadastro}`.
  - `Ver como funciona ›`: link de texto verde, `href="#como-funciona"`.
- Dica de scroll no rodapé do bloco: "Role para ver", com uma setinha que pulsa (só com `motion-safe`).
- **O hero é o LCP:** o `h1` e o subtítulo aparecem **visíveis no primeiro paint**. A animação de entrada é só `transform` (translateY 16px → 0); **nada de `opacity: 0` inicial** no h1 ou no subtítulo. CTAs e eyebrow podem fazer fade.

**Seis vagas** (`h2` no `slots-1`) e **Quem pagou** (`h2` no `paid-1`)
- O título da seção (`h2`, 2 linhas, a segunda em verde) aparece no primeiro bloco de cada seção, junto com a etapa 1.
- Cada bloco tem: um marcador `01`, `02` ou `03` (as etapas são uma sequência real), a frase da etapa (BRIEF) em 28–40px e uma linha de apoio curta em cinza. Escreva o apoio no tom do BRIEF, sem prometer nada além do BRIEF §2.
- **Foco por beat:** use `useStory().beat`. O bloco do beat atual fica com opacidade 1; os outros visíveis no viewport ficam com opacidade 0,3. Transição de 400 ms. Com reduced-motion, todos ficam com opacidade 1.

## Critérios de aceite
1. Há exatamente 7 `BeatBlock`, na ordem de `BEAT_ORDER`, sem nenhum outro elemento com altura entre eles. Um wrapper sem altura própria pode envolvê-los.
2. Há um único `h1`, no hero. Os `h2` ficam em slots-1 e paid-1.
3. Hero legível e completo no primeiro paint, sem esperar JS.
4. No mobile, o texto nunca fica ilegível sobre o celular.
5. A tipografia tem cara de keynote: grande, apertada e com muito respiro.
