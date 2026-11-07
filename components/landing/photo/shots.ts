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
  everyone: {
    src: '/landing/everyone.webp',
    width: 1672,
    height: 941,
    alt: 'Cinco smartphones de titânio lado a lado sobre uma mesa escura de madeira, em leque.',
    // ordem: centro (maior), depois da esquerda para a direita
    screens: [
      [[693.4, 87], [978, 87], [975.4, 688], [695.7, 688]],
      [[31.1, 348.8], [258.3, 254.1], [449.3, 745.1], [231, 834.4]],
      [[348.9, 183.2], [595.5, 134.8], [679.5, 653.5], [452, 696.9]],
      [[1085.7, 133.8], [1333.9, 187.6], [1216, 702.3], [989.3, 653.4]],
      [[1418.4, 264], [1642.1, 364.1], [1430.1, 849.9], [1214.5, 754.5]],
    ],
  },
} as const satisfies Record<string, Shot>
