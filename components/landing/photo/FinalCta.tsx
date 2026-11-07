import Image from 'next/image'
import Link from 'next/link'
import { LINKS } from '../data'
import { Reveal } from '../primitives/Reveal'
import { SHOTS } from './shots'

export function FinalCta() {
  const shot = SHOTS.macro

  return (
    <section className="relative w-full overflow-hidden bg-black min-h-[85svh] md:min-h-[90svh] flex flex-col justify-end md:justify-center px-6 py-20 md:px-12 md:py-0">
      {/* Imagem de fundo macro das câmeras com anel de luz verde */}
      <Image
        src={shot.src}
        alt={shot.alt}
        fill
        sizes="100vw"
        className="pointer-events-none select-none object-cover object-right"
      />

      {/*
        Degradê escuro forte garantindo contraste AA/AAA impecável:
        - Mobile: fade do topo para preto puro na base onde o texto repousa.
        - Desktop: faixa esquerda preta cobrindo o bloco de texto até transparente à direita.
      */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/80 to-black md:bg-gradient-to-r md:from-black md:via-black/85 md:to-transparent"
        aria-hidden="true"
      />

      {/* Conteúdo à esquerda no espaço preto */}
      <div className="relative z-10 mx-auto w-full max-w-[1200px]">
        <Reveal className="max-w-[580px]">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.035em] leading-[1.02] text-balance text-white">
            Organize seu plano agora.
          </h2>
          <p className="mt-5 text-lg md:text-xl text-[#A1A1A6] font-normal leading-relaxed text-balance">
            Grátis. Sem cartão. Leva um minuto.
          </p>
          <div className="mt-8 md:mt-10">
            <Link
              href={LINKS.cadastro}
              className="inline-flex items-center justify-center rounded-full bg-(--landing-accent) px-8 py-4 text-base md:text-lg font-medium text-black transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--landing-accent)"
            >
              Começar grátis
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
