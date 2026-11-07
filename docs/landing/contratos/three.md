# Contrato: three (celular 3D)

## Seus arquivos
`components/landing/three/**`. Substitua o stub `PhoneCanvas.tsx` e crie quantos arquivos quiser nessa pasta (ex.: `PhoneModel.tsx`, `StudioLights.tsx`, `poses.ts`).

## Interface (não mudar)
```ts
export interface PhoneCanvasProps {
  progress: MotionValue<number> // 0–1 do trecho da narrativa (ver story/beats.ts)
  beat: Beat
  quality: 'high' | 'low'
  screen: React.ReactNode       // tela HTML de SCREEN_W × SCREEN_H (390 × 844)
  onReady: () => void           // chamar UMA vez, após o primeiro frame com o aparelho
}
export function PhoneCanvas(props: PhoneCanvasProps): JSX.Element
```
O canvas ocupa uma camada `sticky` de 100svh × 100vw, atrás do texto. Ele é `aria-hidden` e sem eventos de ponteiro.

## O aparelho (modelado em código, sem GLB)
Um flagship premium genérico em **titânio grafite**, sem logo e sem marca. Proporções reais: 71,5 × 149,6 × 8,25 mm (use 1 unidade = 100 mm).
- **Corpo:** cantos arredondados (`RoundedBox` do drei ou `ExtrudeGeometry` de um shape arredondado, com chanfro/bevel suave). Laterais retas em titânio escovado: `MeshPhysicalMaterial`, cor `#5a5a60`, `metalness: 1`, `roughness` ≈ 0,32, `clearcoat` leve. Se ajudar, use `anisotropy`.
- **Frente:** vidro preto com borda fina (~1,5 mm). O **display** é um retângulo de cantos arredondados cuja proporção é **exatamente** `SCREEN_W / SCREEN_H`, com raio proporcional a `SCREEN_RADIUS`.
- **Tela HTML:** use `<Html transform>` do drei no plano do display, levemente à frente do vidro, com o conteúdo `screen` escalado para cobrir o display **exatamente**, sem sobra nem corte. Calcule a escala a partir da largura do display em unidades e de `SCREEN_W`. Quando o aparelho estiver de costas, a tela **não pode aparecer**: use `style={{ backfaceVisibility: 'hidden' }}` no wrapper ou `occlude`. Coloque `pointerEvents: 'none'`.
- **Ilha frontal:** pílula preta (mesh) sobre a tela, centralizada no topo, por cima do HTML.
- **Traseira:** vidro fosco (`roughness` ≈ 0,55, cor `#2a2a2e`). No canto superior esquerdo, um **módulo de 3 câmeras em triângulo**: cada uma com anel de titânio, lente de vidro escuro brilhante (`roughness` 0,05, `clearcoat` 1) e um reflexo interno sutil (disco menor azulado/esverdeado). Inclua também o flash (disco pequeno) e um microfone (ponto).
- **Botões laterais:** 1 à direita (power) e 2 à esquerda (volume), em titânio.

## Luz (sem HDR externo)
- `<Environment resolution={256}>` com `Lightformer`s, no estilo estúdio de produto: uma softbox grande em cima, duas faixas verticais nas laterais para desenhar o contorno do titânio e uma faixa **na cor `BRAND.accent`** (de `data.ts`) atrás e à esquerda, como rim light.
- **Nada de arquivos `.hdr` nem `preset`**: os presets baixam de CDN externa.
- Fundo transparente (`gl={{ alpha: true }}`); a página já é preta. Tone mapping ACES e `outputColorSpace` sRGB.
- Só em `quality === 'high'`: `ContactShadows` bem suave abaixo do aparelho.

## Movimento (o coração da página)
- **Entrada (por tempo, ao montar):** o aparelho sobe de `y = -1.6` girando em Y de `-1.1 rad` até a pose do hero, em ~1,8 s com easing `easeOutExpo`. Depois disso, quem manda é o scroll.
- **Scroll:** leia `progress.get()` dentro de `useFrame` (nunca via estado React). Interpole a pose-alvo entre as poses dos beats, com o centro de cada beat em `beatCenter(beat)` de `story/beats.ts`, e aproxime suavemente com `THREE.MathUtils.damp` (lambda ≈ 4–6). Os valores são ponto de partida; ajuste para ficar bonito:

| beat | x | y | z | rotX | rotY | rotZ | observação |
|---|---|---|---|---|---|---|---|
| hero | 0.95 | 0 | 0 | 0.06 | -0.42 | 0.02 | 3/4 elegante |
| slots-1 | 0.95 | 0 | 0 | 0.02 | **2π − 0.12** | 0 | entre hero e slots-1: **giro completo** que mostra as câmeras e volta de frente |
| slots-2 | 0.95 | 0 | 0 | 0.02 | 2π + 0.18 | -0.02 | |
| slots-3 | 0.95 | 0 | 0 | 0 | 2π | 0 | frontal |
| paid-1 | 0.7 | -0.05 | 1.1 | 0.1 | 2π + 0.28 | 0 | close |
| paid-2 | 0.7 | -0.05 | 1.3 | 0.08 | 2π + 0.12 | 0 | mais close |
| paid-3 | 0.95 | 0 | 0.4 | 0.04 | 2π − 0.3 | 0.02 | recua satisfeito |

- **Retrato/mobile** (aspect do canvas < 1): `x = 0`, `y` deslocado para o terço superior (o texto fica embaixo) e escala ~0,82. Recalcule com `useThree().viewport` para o aparelho nunca cortar.
- Flutuação idle sutil (±0,015 em y, período ~5 s), só quando o scroll está parado.
- Câmera fixa: `fov` ~28, posição `z` ~5,2. No desktop o aparelho ocupa cerca de 78% da altura da tela.

## Desempenho
- `dpr`: `[1, 2]` em high; `[1, 1.5]` em low. `quality === 'low'`: sem `ContactShadows`, `Environment resolution={128}`.
- Pause o render quando o canvas sair da tela (`IntersectionObserver` → `frameloop="never"`/`"always"`).
- Geometrias e materiais memorizados; zero alocação por frame dentro de `useFrame`.
- `onReady`: chame uma vez, no primeiro `useFrame` após o modelo montar.

## Critérios de aceite
1. Parece um aparelho premium real numa foto de produto: arestas com brilho especular, titânio com contorno de luz e o verde só como rim light.
2. A tela HTML encaixa no display sem sobra nem corte, em qualquer pose, e some quando o aparelho está de costas.
3. O giro completo entre hero e slots-1 mostra as câmeras com clareza.
4. Nada de jank: sem `setState` por frame e sem alocação por frame.
5. Sem nenhum asset externo (HDR, GLB, textura de URL).
