// STUB da fundação — o agente "photo" substitui a implementação mantendo DeviceShotProps e o export.
import Image from 'next/image'
import type { Quad } from '../primitives/homography'

export interface DeviceShotScreen {
  /** cantos da tela magenta medidos na imagem ORIGINAL (px), ordem TL, TR, BR, BL */
  corners: Quad
  /** conteúdo HTML de SCREEN_W × SCREEN_H */
  content: React.ReactNode
}

export interface DeviceShotProps {
  src: string
  alt: string
  /** dimensões da imagem original em px */
  width: number
  height: number
  screens: DeviceShotScreen[]
  priority?: boolean
  sizes?: string
  className?: string
}

export function DeviceShot({ src, alt, width, height, priority, sizes, className }: DeviceShotProps) {
  return (
    <div className={className}>
      <Image src={src} alt={alt} width={width} height={height} priority={priority} sizes={sizes} />
    </div>
  )
}
