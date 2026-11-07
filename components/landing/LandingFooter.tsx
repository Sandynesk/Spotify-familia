import Link from 'next/link'
import { BrandMark } from './BrandMark'
import { LINKS } from './data'

export function LandingFooter() {
  return (
    <footer
      className="border-t border-white/[0.08] px-6 py-12 text-[13px] text-[#86868B]"
      style={{
        paddingLeft: 'max(24px, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(24px, env(safe-area-inset-right, 0px))',
        paddingBottom: 'max(48px, env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8">
        {/* Linha 1 */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="inline-flex items-center rounded-sm text-white outline-none focus-visible:outline-2 focus-visible:outline-(--landing-accent) focus-visible:outline-offset-2"
          >
            <BrandMark />
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href={LINKS.login}
              className="rounded-sm text-[#86868B] transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-(--landing-accent) focus-visible:outline-offset-2"
            >
              Entrar
            </Link>
            <Link
              href={LINKS.cadastro}
              className="rounded-sm text-[#86868B] transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-(--landing-accent) focus-visible:outline-offset-2"
            >
              Criar conta
            </Link>
          </div>
        </div>

        {/* Linha 2 */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
          <span>Projeto pessoal, sem afiliação com o Spotify.</span>
          <span className="hidden sm:inline" aria-hidden="true">
            ·
          </span>
          <span>© 2026</span>
        </div>
      </div>
    </footer>
  )
}
