import Link from 'next/link'
import { LINKS } from '../data'
import { BrandMark } from '../BrandMark'
import { BeatBlock } from './BeatBlock'

export function HeroBeat() {
  return (
    <BeatBlock beat="hero">
      {/* Degradê de legibilidade para mobile contra o celular ao fundo */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[65svh] bg-gradient-to-t from-black via-black/80 to-transparent md:hidden"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col gap-5 md:gap-7">
        {/* Eyebrow: pequeno, verde, peso 600 */}
        <div className="animate-hero-fade">
          <span className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold tracking-wide text-(--landing-accent)">
            <BrandMark size={14} withName={false} />
            <span>SpotiFamília</span>
          </span>
        </div>

        {/* H1 em duas linhas (LCP: visível no primeiro paint, sem opacity: 0 inicial) */}
        <h1 className="animate-hero-rise text-[clamp(48px,7.2vw,104px)] font-bold tracking-[-0.035em] leading-[1.02] text-balance">
          <span className="block text-white">Plano Família.</span>
          <span className="block text-(--landing-accent)">Finalmente em ordem.</span>
        </h1>

        {/* Subtítulo em cinza #A1A1A6 */}
        <p className="animate-hero-rise text-[clamp(19px,1.6vw,24px)] font-normal leading-relaxed text-[#A1A1A6] text-balance max-w-[500px]">
          Quem pagou, quem falta e quanto entra, num painel que cabe no bolso.
        </p>

        {/* CTAs */}
        <div className="animate-hero-fade flex flex-wrap items-center gap-4 pt-1 sm:pt-2">
          <Link
            href={LINKS.cadastro}
            className="inline-flex h-12 items-center justify-center rounded-full bg-(--landing-accent) px-7 text-base font-semibold text-black transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--landing-accent)"
          >
            Começar grátis
          </Link>
          <Link
            href="#como-funciona"
            className="inline-flex items-center gap-1 text-base font-medium text-(--landing-accent) transition-colors hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--landing-accent)"
          >
            Ver como funciona <span aria-hidden="true">›</span>
          </Link>
        </div>
      </div>

      {/* Dica de scroll no rodapé do bloco */}
      <div
        className="pointer-events-none absolute bottom-4 md:bottom-8 flex items-center gap-1.5 text-xs md:text-sm text-[#86868B]"
        style={{ left: 'max(1.5rem, calc((100% - 1200px) / 2))' }}
        aria-hidden="true"
      >
        <span>Role para ver</span>
        <svg
          className="h-4 w-4 motion-safe:animate-pulse text-[#A1A1A6]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>

      <style>{`
        @keyframes heroRise {
          from { transform: translateY(16px); }
          to { transform: translateY(0); }
        }
        @keyframes heroFade {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: no-preference) {
          .animate-hero-rise {
            animation: heroRise 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
          }
          .animate-hero-fade {
            animation: heroFade 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both;
          }
        }
      `}</style>
    </BeatBlock>
  )
}
