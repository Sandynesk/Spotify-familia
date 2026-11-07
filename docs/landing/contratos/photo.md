# Contrato: photo (fotos com telas encaixadas)

## Seus arquivos
- `components/landing/photo/DeviceShot.tsx` (substituir o stub)
- `components/landing/photo/PhoneFallback.tsx` (substituir o stub)
- `components/landing/photo/Everyone.tsx` (substituir o stub)
- `components/landing/photo/FinalCta.tsx` (substituir o stub)
- Arquivos auxiliares novos dentro de `components/landing/photo/`

**Não edite** `photo/shots.ts`: ele tem as fotos e os cantos medidos.

## `DeviceShot`: interface (não mudar)
```ts
export interface DeviceShotScreen { corners: Quad; content: React.ReactNode }
export interface DeviceShotProps {
  src: string; alt: string; width: number; height: number
  screens: DeviceShotScreen[]; priority?: boolean; sizes?: string; className?: string
}
```
- Renderiza a foto com `next/image` (`fill` ou width/height, responsiva e sem CLS) dentro de um contêiner com `aspect-ratio: width / height`.
- Para cada tela, faz o seguinte:
  1. Uma camada com o tamanho da **imagem original** (`width × height` px), escalada para o tamanho renderizado do contêiner. Use `ResizeObserver`; o componente pode virar client.
  2. Dentro dela, um elemento de `SCREEN_W × SCREEN_H` com `transform-origin: 0 0` e `transform: quadToMatrix3d(SCREEN_W, SCREEN_H, cantos)`, usando `primitives/homography.ts`.
  3. **Infle os cantos ~1,5px** para fora do centro da tela, para cobrir a franja magenta.
  4. Dentro do elemento, nesta ordem: o `content`, a **ilha frontal** (pílula preta de 126 × 37px, centralizada, a 11px do topo) e um **reflexo de vidro** (gradiente linear branco 7% → 0% em diagonal, `mix-blend-mode: screen`).
  5. Tudo `aria-hidden`; o `alt` da imagem descreve a cena.
- Sem JS (antes da hidratação), a foto aparece e a tela pode aparecer depois. Só a foto não pode ter CLS.

## `PhoneFallback({ screen })`
Substitui o 3D (SSR, aparelhos fracos, reduced-motion) dentro da camada `sticky` de 100svh, por trás do texto da narrativa. Usa `SHOTS.heroFallback` com `screen` encaixado.
- **Desktop:** a foto alinhada à direita (centro do aparelho a ~70% da largura), com altura ≈ 92svh para o aparelho ocupar ~70% da altura. Isso replica a posição do 3D.
- **Mobile:** centralizada horizontalmente, ocupando o topo (~60svh), para o texto ficar embaixo.
- `priority` (ela pode ser o LCP de imagem) e `sizes` corretos.

## `Everyone`
Seção 4 do BRIEF ("Cada um ouve no seu. / Você organiza num só.", com o texto de apoio).
- Usa `SHOTS.everyone`, que **ainda vai ser adicionado** ao `shots.ts` pelo orquestrador com 5 telas. Escreva o código pensando nessa entrada e, enquanto ela não existir, use `SHOTS.pocket` como substituto, com um comentário `// TODO everyone`.
- Tela de **maior área**: `<DashboardScreen moment="completo" />`. As outras: `<PlayerScreen variant={0..3} />`. Ambos vêm de `../screens/...`; use só a assinatura.
- Layout: título grande centralizado acima; a foto embaixo, com largura até 1200px e cantos de 28px. Parallax sutil na foto (translateY de -4% a 4% pelo scroll da seção via `useScroll`/`useTransform`), desligado com reduced-motion.

## `FinalCta`
Seção 7 do BRIEF.
- `SHOTS.macro` como fundo de largura total (`object-cover`, `object-right`), altura ~90svh no desktop.
- Texto à esquerda, no espaço preto da foto: `h2` "Organize seu plano agora.", apoio "Grátis. Sem cartão. Leva um minuto." e o botão pílula verde `Começar grátis` (`LINKS.cadastro`).
- **Mobile:** foto em cima (aspect 4/3) e texto embaixo, ou foto de fundo com degradê escuro forte. O contraste do texto precisa ser AA.

## Critérios de aceite
1. As telas encaixam no magenta sem nenhuma franja visível, em qualquer largura (360–1920px).
2. Nenhuma foto causa CLS; `sizes` coerentes; só o `PhoneFallback` usa `priority`.
3. O Everyone parece uma foto real de 5 celulares com o app e players.
4. O FinalCta tem cara de fechamento de keynote.
