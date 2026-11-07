import type { Quad } from '../primitives/homography'

// Fotos geradas por IA (Codex) e os cantos das telas magenta, medidos automaticamente
// (ajuste de retas por borda + interseção) na imagem ORIGINAL. Ordem: TL, TR, BR, BL,
// onde "topo" é o lado da ilha frontal da tela. Não editar à mão sem remedir.

export interface Shot {
  src: string
  width: number
  height: number
  alt: string
  /** telas magenta presentes na foto (vazio = sem tela visível) */
  screens: Quad[]
}

export const SHOTS = {
  heroFallback: {
    src: '/landing/hero-fallback.webp',
    width: 1024,
    height: 1210, // recortada acima do reflexo do chão
    alt: 'Smartphone de titânio grafite flutuando em fundo preto, com brilho verde atrás.',
    screens: [
      [
        [345, 296.1],
        [708, 339.5],
        [708, 1170.6],
        [345, 1192],
      ],
    ],
  },
  macro: {
    src: '/landing/macro.webp',
    width: 1536,
    height: 1024,
    alt: 'Close das três câmeras traseiras de um smartphone de titânio, com luz verde desenhando a borda.',
    screens: [],
  },
  pocket: {
    src: '/landing/pocket.webp',
    width: 1254,
    height: 1254,
    alt: 'Smartphone sobre um sofá escuro ao lado de fones de ouvido, à noite.',
    screens: [
      [
        [66.8, 423.7],
        [395.4, 322.2],
        [873.7, 960.1],
        [511.8, 1083],
      ],
    ],
  },
  // everyone: aguardando a nova geração (sem mãos)
} as const satisfies Record<string, Shot>
