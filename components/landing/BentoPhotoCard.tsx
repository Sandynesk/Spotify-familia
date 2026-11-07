import { DeviceShot } from './photo/DeviceShot'
import { SHOTS } from './photo/shots'
import { DashboardScreen } from './screens/DashboardScreen'

/**
 * Card fotográfico estilo Apple bento:
 * 1 col x 2 rows no desktop. Encaixa a foto pocket com a tela real do app
 * renderizada via homografia sobre a tela do smartphone.
 */
export function BentoPhotoCard() {
  const shot = SHOTS.pocket

  return (
    <div
      className="relative flex flex-col justify-end overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#0b0b0c] h-full w-full min-h-[380px] lg:min-h-[520px] transition-transform duration-300 motion-safe:hover:scale-[1.01] group"
    >
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <DeviceShot
          src={shot.src}
          alt={shot.alt}
          width={shot.width}
          height={shot.height}
          screens={[
            {
              corners: shot.screens[0],
              content: <DashboardScreen moment="inicial" />,
            },
          ]}
          className="w-full h-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
        />
      </div>

      {/* Legenda mínima no rodapé do card */}
      <div className="relative z-10 p-6 md:p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none mt-auto">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-[#86868B]">
          No bolso
        </span>
        <p className="text-white text-base md:text-lg font-medium tracking-tight mt-0.5">
          Sempre à mão.
        </p>
      </div>
    </div>
  )
}
