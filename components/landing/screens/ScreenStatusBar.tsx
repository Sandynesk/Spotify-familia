import { Signal, Wifi, Battery } from 'lucide-react'

/**
 * Barra de status fixa (54px) de toda tela de celular.
 * - Hora 21:30 à esquerda
 * - Centro livre (~130px) para acomodar a ilha frontal desenhada pelo 3D e fotos
 * - Sinal, Wi-Fi e Bateria à direita
 */
export function ScreenStatusBar() {
  return (
    <div className="h-[54px] w-full flex items-center justify-between px-7 pt-2 flex-shrink-0 relative z-30 select-none">
      {/* Esquerda: hora */}
      <span className="text-xs font-semibold text-white tracking-tight tabular-nums">
        21:30
      </span>

      {/* Centro livre: ilha frontal (~126x37px a 11px do topo) */}
      <div className="w-[130px] h-[37px] pointer-events-none" aria-hidden="true" />

      {/* Direita: sinal, wi-fi, bateria */}
      <div className="flex items-center gap-1.5 text-white">
        <Signal className="w-3.5 h-3.5" strokeWidth={2.5} />
        <Wifi className="w-3.5 h-3.5" strokeWidth={2.5} />
        <Battery className="w-4 h-4" strokeWidth={2.2} />
      </div>
    </div>
  )
}
